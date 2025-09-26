import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { PaperProvider } from 'react-native-paper';
import AuthScreen from '../../src/screens/AuthScreen';

// Mock the user slice actions
const mockLoginUser = jest.fn();
const mockRegisterUser = jest.fn();
jest.mock('../../src/components/user/store/user.slice', () => ({
  loginUser: mockLoginUser,
  registerUser: mockRegisterUser,
}));

// Mock the useOAuth hook - fixed version
const mockSignIn = jest.fn();
jest.mock('../../src/components/common/hooks/useOAuth', () => ({
  useOAuth: jest.fn(() => ({
    signIn: mockSignIn,
  })),
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  dispatch: jest.fn(),
  setParams: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  canGoBack: jest.fn(() => false),
  isFocused: jest.fn(() => true),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  replace: jest.fn(),
  reset: jest.fn(),
};

// Mock the common components
jest.mock('../../src/components/common/components/Spinner', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ visible }: { visible: boolean }) =>
    visible ? React.createElement(View, { testID: 'spinner' }) : null;
});

jest.mock('../../src/components/common/components/Toast', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  return ({ visible, message }: { visible: boolean; message: string }) =>
    visible ? React.createElement(View, {testID: 'toast'}, React.createElement(Text, null, message)) : null;
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const MockIcon = ({ name, size, color, onPress, testID }: any) => (
    <Text
      onPress={onPress}
      testID={testID}
      style={{ fontSize: size, color: color }}
    >
      {name}
    </Text>
  );
  return MockIcon;
});

// Create test store that matches your user slice structure
const createTestStore = (preloadedState = {}) => {
  const defaultUserState = {
    currentUser: null,
    loading: false,
    error: null,
  };

  return configureStore({
    reducer: {
      user: (state = defaultUserState, action) => {
        switch (action.type) {
          case 'user/loginUser/pending':
          case 'user/registerUser/pending':
            return { ...state, loading: true, error: null };
          case 'user/loginUser/fulfilled':
          case 'user/registerUser/fulfilled':
            return {
              ...state,
              loading: false,
              error: null,
              currentUser: action.payload
            };
          case 'user/loginUser/rejected':
          case 'user/registerUser/rejected':
            return {
              ...state,
              loading: false,
              error: action.payload || 'An error occurred'
            };
          default:
            return state;
        }
      },
    },
    preloadedState: {
      user: { ...defaultUserState, ...preloadedState.user },
      ...preloadedState,
    },
  });
};

const renderWithProviders = (
  ui: React.ReactElement,
  { preloadedState = {}, store = createTestStore(preloadedState) } = {}
) => {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <PaperProvider>
          {children}
        </PaperProvider>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper }) };
};

describe('AuthScreen E2E', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset the mock functions
    mockLoginUser.mockReturnValue({ type: 'user/loginUser/pending' });
    mockRegisterUser.mockReturnValue({ type: 'user/registerUser/pending' });

    // Reset the signIn mock
    mockSignIn.mockClear();
  });

  describe('Login Flow', () => {
    it('logs in a user successfully and navigates to Home', async () => {
      const store = createTestStore();
      const { getByTestId } = renderWithProviders(
        <AuthScreen navigation={mockNavigation} />,
        { store }
      );

      // Fill in the form
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');

      // Submit the form
      fireEvent.press(getByTestId('auth-button'));

      // Check that loginUser action was dispatched
      await waitFor(() => {
        expect(mockLoginUser).toHaveBeenCalledWith({
          username: 'test@example.com',
          password: 'password123',
        });
      });

      // Simulate successful login by dispatching success action
      store.dispatch({
        type: 'user/loginUser/fulfilled',
        payload: { id: 1, email: 'test@example.com' },
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('Home');
      });
    });

    it('does not send a second request if login is pressed twice', async () => {
      const store = createTestStore();
      const { getByTestId } = renderWithProviders(
        <AuthScreen navigation={mockNavigation} />,
        { store }
      );

      // Set loading state
      store.dispatch({ type: 'user/loginUser/pending' });

      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');

      // Press login button twice quickly
      fireEvent.press(getByTestId('auth-button'));
      fireEvent.press(getByTestId('auth-button'));

      // Only one call should be made since button should be disabled during loading
      expect(mockLoginUser).toHaveBeenCalledTimes(1);
    });

    it('shows an error message when login fails (401)', async () => {
      const store = createTestStore();
      const { getByTestId } = renderWithProviders(
        <AuthScreen navigation={mockNavigation} />,
        { store }
      );

      fireEvent.changeText(getByTestId('email-input'), 'wrong@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'wrongpassword');
      fireEvent.press(getByTestId('auth-button'));

      // Simulate login failure
      store.dispatch({
        type: 'user/loginUser/rejected',
        payload: 'Invalid credentials',
      });

      await waitFor(() => {
        expect(getByTestId('toast')).toBeTruthy();
      });
    });

    it('clears the error message on a successful retry', async () => {
      const store = createTestStore({
        user: { error: 'Invalid credentials', loading: false, currentUser: null }
      });

      const { getByTestId, queryByTestId } = renderWithProviders(
        <AuthScreen navigation={mockNavigation} />,
        { store }
      );

      // Error should be visible initially
      expect(queryByTestId('toast')).toBeTruthy();

      // Second attempt - succeeds
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.press(getByTestId('auth-button'));

      // Simulate successful login
      store.dispatch({
        type: 'user/loginUser/fulfilled',
        payload: { id: 1, email: 'test@example.com' },
      });

      await waitFor(() => {
        expect(queryByTestId('toast')).toBeNull();
      });
    });

    it('shows a validation error for an invalid email without calling the API', async () => {
      const { getByTestId } = renderWithProviders(
        <AuthScreen navigation={mockNavigation} />
      );

      fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
      fireEvent.press(getByTestId('auth-button'));

      await waitFor(() => {
        expect(getByTestId('toast')).toBeTruthy();
      });

      expect(mockLoginUser).not.toHaveBeenCalled();
    });

    it('shows a validation error for a short password without calling the API', async () => {
      const { getByTestId } = renderWithProviders(
        <AuthScreen navigation={mockNavigation} />
      );

      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), '123');
      fireEvent.press(getByTestId('auth-button'));

      await waitFor(() => {
        expect(getByTestId('toast')).toBeTruthy();
      });

      expect(mockLoginUser).not.toHaveBeenCalled();
    });

    it('calls signIn with the correct provider for OAuth login', async () => {
      const { getByTestId } = renderWithProviders(
        <AuthScreen navigation={mockNavigation} />
      );

      fireEvent.press(getByTestId('google-button'));

      expect(mockSignIn).toHaveBeenCalledWith('google');
    });

    it('shows an error message if OAuth sign-in fails', async () => {
      // Mock signIn to throw an error
      mockSignIn.mockRejectedValueOnce(new Error('OAuth provider error'));

      const { getByTestId } = renderWithProviders(
        <AuthScreen navigation={mockNavigation} />
      );

      fireEvent.press(getByTestId('google-button'));

      await waitFor(() => {
        expect(getByTestId('toast')).toBeTruthy();
      });
    });
  });

  describe('Register Flow', () => {
    it('registers a new user successfully and navigates to Home', async () => {
      const store = createTestStore();
      const { getByTestId } = renderWithProviders(
        <AuthScreen navigation={mockNavigation} />,
        { store }
      );

      // Switch to register mode
      fireEvent.press(getByTestId('register-tab'));

      // Fill in the registration form
      fireEvent.changeText(getByTestId('email-input'), 'new@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');

      fireEvent.press(getByTestId('auth-button'));

      await waitFor(() => {
        expect(mockRegisterUser).toHaveBeenCalledWith({
          username: 'new@example.com',
          email: 'new@example.com',
          password: 'password123',
        });
      });

      // Simulate successful registration
      store.dispatch({
        type: 'user/registerUser/fulfilled',
        payload: { id: 1, email: 'new@example.com' },
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('Home');
      });
    });

    it('shows a server error if registration fails (e.g., email in use)', async () => {
      const store = createTestStore();
      const { getByTestId } = renderWithProviders(
        <AuthScreen navigation={mockNavigation} />,
        { store }
      );

      // Switch to register mode
      fireEvent.press(getByTestId('register-tab'));

      fireEvent.changeText(getByTestId('email-input'), 'existing@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');

      fireEvent.press(getByTestId('auth-button'));

      // Simulate registration failure
      store.dispatch({
        type: 'user/registerUser/rejected',
        payload: 'Email already in use',
      });

      await waitFor(() => {
        expect(getByTestId('toast')).toBeTruthy();
      });
    });

    it('shows a validation error for mismatched passwords', async () => {
      const { getByTestId } = renderWithProviders(
        <AuthScreen navigation={mockNavigation} />
      );

      // Switch to register mode
      fireEvent.press(getByTestId('register-tab'));

      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'different123');

      fireEvent.press(getByTestId('auth-button'));

      await waitFor(() => {
        expect(getByTestId('toast')).toBeTruthy();
      });

      expect(mockRegisterUser).not.toHaveBeenCalled();
    });

    it('calls signIn with the correct provider for OAuth registration', async () => {
      const { getByTestId } = renderWithProviders(
        <AuthScreen navigation={mockNavigation} />
      );

      // Switch to register mode
      fireEvent.press(getByTestId('register-tab'));

      fireEvent.press(getByTestId('google-button'));

      expect(mockSignIn).toHaveBeenCalledWith('google');
    });
  });
});