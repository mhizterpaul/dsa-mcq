import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { setupServer } from 'msw/native';
import { http, HttpResponse } from 'msw';
import AuthScreen from '../../src/screens/AuthScreen';
import userReducer from '../../src/components/user/store/user.slice';
import * as useOAuth from '../../src/components/common/hooks/useOAuth';

// --- MSW Handlers (Mock Server) ---
const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };

const server = setupServer(
  http.post('http://localhost:3000/api/auth/signin', async ({ request }) => {
    const { email, password } = await request.json();
    if (email === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({ user: mockUser, token: 'fake-token' }, { status: 200 });
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  http.post('http://localhost:3000/api/auth/register', async () => {
    return HttpResponse.json({ user: mockUser, token: 'fake-token' }, { status: 201 });
  })
);

// --- Setup & Teardown MSW ---
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});
afterAll(() => server.close());

// --- Test Setup ---
const Stack = createStackNavigator();
const mockNavigation = { navigate: jest.fn() };

const renderWithProviders = (ui: React.ReactElement) => {
  const store = configureStore({
    reducer: { user: userReducer },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Auth" component={() => children} />
          <Stack.Screen name="Home" component={() => <></>} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
  return { store, ...render(ui, { wrapper: Wrapper }) };
};

// Mock the useOAuth hook
jest.mock('../../src/components/common/hooks/useOAuth');

describe('AuthScreen E2E', () => {
  describe('Login Flow', () => {
    it('logs in a user successfully and navigates to Home', async () => {
      const { getByTestId, getByText, queryByTestId } = renderWithProviders(
        <AuthScreen navigation={mockNavigation} />
      );

      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.press(getByText('Login'));

      expect(queryByTestId('auth-spinner')).toBeTruthy();
      await waitFor(() => expect(queryByTestId('auth-spinner')).toBeNull());

      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
      });
    });

    it('does not send a second request if login is pressed twice', async () => {
      const fetchSpy = jest.spyOn(globalThis, 'fetch');
      const { getByTestId, getByText } = renderWithProviders(
        <AuthScreen navigation={mockNavigation} />
      );

      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');

      fireEvent.press(getByText('Login'));
      fireEvent.press(getByText('Login'));

      await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    });

    it('shows an error message when login fails (401)', async () => {
      const { getByTestId, getByText, queryByTestId, findByText } = renderWithProviders(
        <AuthScreen navigation={mockNavigation} />
      );

      fireEvent.changeText(getByTestId('email-input'), 'wrong@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'wrongpassword');
      fireEvent.press(getByText('Login'));

      expect(queryByTestId('auth-spinner')).toBeTruthy();
      await waitFor(() => expect(queryByTestId('auth-spinner')).toBeNull());

      expect(await findByText('Invalid credentials')).toBeTruthy();
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });

    it('clears the error message on a successful retry', async () => {
      server.use(
        http.post('http://localhost:3000/api/auth/signin', async ({ request }) => {
          return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        })
      );

      const { getByTestId, getByText, findByText, queryByText } = renderWithProviders(
        <AuthScreen navigation={mockNavigation} />
      );

      fireEvent.changeText(getByTestId('email-input'), 'wrong@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'wrongpassword');
      fireEvent.press(getByText('Login'));
      expect(await findByText('Invalid credentials')).toBeTruthy();

      // Retry with correct credentials — will hit the default handler
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.press(getByText('Login'));

      await waitFor(() => expect(queryByText('Invalid credentials')).toBeNull());
      await waitFor(() => expect(mockNavigation.navigate).toHaveBeenCalledWith('Home'));
    });

    it('shows a validation error for an invalid email without calling the API', async () => {
      const fetchSpy = jest.spyOn(globalThis, 'fetch');
      const { getByTestId, getByText, findByText } = renderWithProviders(
        <AuthScreen navigation={mockNavigation} />
      );

      fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
      fireEvent.press(getByText('Login'));

      expect(await findByText('Please enter a valid email address.')).toBeTruthy();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('shows a validation error for a short password without calling the API', async () => {
      const fetchSpy = jest.spyOn(globalThis, 'fetch');
      const { getByTestId, getByText, findByText } = renderWithProviders(
        <AuthScreen navigation={mockNavigation} />
      );

      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), '123');
      fireEvent.press(getByText('Login'));

      expect(await findByText('Password must be at least 6 characters long.')).toBeTruthy();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('calls signIn with the correct provider for OAuth login', () => {
      const mockSignIn = jest.fn();
      (useOAuth as jest.Mock).mockReturnValue({ signIn: mockSignIn });

      const { getByTestId } = renderWithProviders(<AuthScreen navigation={mockNavigation} />);

      fireEvent.press(getByTestId('google-button'));
      expect(mockSignIn).toHaveBeenCalledWith('google');

      fireEvent.press(getByTestId('github-button'));
      expect(mockSignIn).toHaveBeenCalledWith('github');

      fireEvent.press(getByTestId('twitter-button'));
      expect(mockSignIn).toHaveBeenCalledWith('twitter');
    });

    it('shows an error message if OAuth sign-in fails', async () => {
      const errorMessage = 'OAuth provider error';
      (useOAuth as jest.Mock).mockReturnValue({
        signIn: jest.fn().mockRejectedValue(new Error(errorMessage)),
      });

      const { getByTestId, findByText } = renderWithProviders(
        <AuthScreen navigation={mockNavigation} />
      );

      fireEvent.press(getByTestId('google-button'));

      expect(await findByText(errorMessage)).toBeTruthy();
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Register Flow', () => {
    it('registers a new user successfully and navigates to Home', async () => {
      const { getByTestId, getByText, queryByTestId, store } = renderWithProviders(
        <AuthScreen navigation={mockNavigation} />
      );

      fireEvent.press(getByText('Register'));

      fireEvent.changeText(getByTestId('email-input'), 'newuser@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');
      fireEvent.press(getByText('Register'));

      expect(queryByTestId('auth-spinner')).toBeTruthy();
      await waitFor(() => expect(queryByTestId('auth-spinner')).toBeNull());

      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
      });

      expect(store.getState().user.currentUser).toEqual(mockUser);
    });

    it('shows a server error if registration fails (e.g., email in use)', async () => {
      server.use(
        http.post('http://localhost:3000/api/auth/register', async () => {
          return HttpResponse.json({ message: 'Email already in use' }, { status: 400 });
        })
      );

      const { getByTestId, getByText, queryByTestId, findByText } = renderWithProviders(
        <AuthScreen navigation={mockNavigation} />
      );

      fireEvent.press(getByText('Register'));

      fireEvent.changeText(getByTestId('email-input'), 'existing@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');
      fireEvent.press(getByText('Register'));

      expect(queryByTestId('auth-spinner')).toBeTruthy();
      await waitFor(() => expect(queryByTestId('auth-spinner')).toBeNull());

      expect(await findByText('Email already in use')).toBeTruthy();
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });

    it('shows a validation error for mismatched passwords', async () => {
      const fetchSpy = jest.spyOn(globalThis, 'fetch');
      const { getByTestId, getByText, findByText } = renderWithProviders(
        <AuthScreen navigation={mockNavigation} />
      );

      fireEvent.press(getByText('Register'));

      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password456');
      fireEvent.press(getByText('Register'));

      expect(await findByText('Passwords do not match.')).toBeTruthy();
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });

    it('calls signIn with the correct provider for OAuth registration', () => {
      const mockSignIn = jest.fn();
      (useOAuth as jest.Mock).mockReturnValue({ signIn: mockSignIn });

      const { getByText, getByTestId } = renderWithProviders(<AuthScreen navigation={mockNavigation} />);

      fireEvent.press(getByText('Register'));

      fireEvent.press(getByTestId('google-button'));
      expect(mockSignIn).toHaveBeenCalledWith('google');

      fireEvent.press(getByTestId('github-button'));
      expect(mockSignIn).toHaveBeenCalledWith('github');

      fireEvent.press(getByTestId('twitter-button'));
      expect(mockSignIn).toHaveBeenCalledWith('twitter');
    });
  });
});
