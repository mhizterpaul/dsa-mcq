import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { setupServer } from 'msw/native';
import { http, HttpResponse } from 'msw';
import AuthScreen from '../../src/screens/AuthScreen';
import userReducer from '../../src/components/user/store/user.slice';

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

// Mock the useOAuth hook
const mockSignIn = jest.fn();
jest.mock('../../src/components/common/hooks/useOAuth', () => ({
  useOAuth: () => ({
    signIn: mockSignIn,
  }),
}));

// --- Test Setup ---
const Stack = createStackNavigator();

// Create a test component that tracks navigation
const HomeScreen = () => <></>;

const renderWithProviders = (initialRoute = 'Auth') => {
  const store = configureStore({
    reducer: { user: userReducer },
  });

  const navigationSpy = jest.fn();
  
  const TestNavigator = () => (
    <Provider store={store}>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName={initialRoute}
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen 
              name="Home" 
              component={() => {
                navigationSpy('Home');
                return <HomeScreen />;
              }} 
            />
            <Stack.Screen name="ForgotPassword" component={() => <></>} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </Provider>
  );

  return { 
    store, 
    navigationSpy,
    ...render(<TestNavigator />) 
  };
};

describe('AuthScreen E2E', () => {
  beforeEach(() => {
    mockSignIn.mockClear();
  });

  describe('Login Flow', () => {
    it('logs in a user successfully and navigates to Home', async () => {
      const { getByTestId, queryByTestId, navigationSpy } = renderWithProviders();

      // Fill in the form
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      
      // Submit the form
      fireEvent.press(getByTestId('auth-button'));

      // Check spinner appears
      expect(queryByTestId('spinner')).toBeTruthy();
      
      // Wait for spinner to disappear
      await waitFor(() => expect(queryByTestId('spinner')).toBeNull());

      // Check navigation occurred
      await waitFor(() => {
        expect(navigationSpy).toHaveBeenCalledWith('Home');
      });
    });

    it('does not send a second request if login is pressed twice', async () => {
      const fetchSpy = jest.spyOn(globalThis, 'fetch');
      const { getByTestId } = renderWithProviders();

      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');

      // Press login button twice quickly
      fireEvent.press(getByTestId('auth-button'));
      fireEvent.press(getByTestId('auth-button'));

      await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    });

    it('shows an error message when login fails (401)', async () => {
      const { getByTestId, queryByTestId, queryByText, navigationSpy } = renderWithProviders();

      fireEvent.changeText(getByTestId('email-input'), 'wrong@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'wrongpassword');
      fireEvent.press(getByTestId('auth-button'));

      // Check spinner appears
      expect(queryByTestId('spinner')).toBeTruthy();
      
      // Wait for spinner to disappear
      await waitFor(() => expect(queryByTestId('spinner')).toBeNull());

      // Check error message appears
      await waitFor(() => {
        expect(queryByTestId('toast')).toBeTruthy();
      });
      
      expect(navigationSpy).not.toHaveBeenCalled();
    });

    it('clears the error message on a successful retry', async () => {
      // First, set up server to return error
      server.use(
        http.post('http://localhost:3000/api/auth/signin', async () => {
          return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        })
      );

      const { getByTestId, queryByTestId, queryByText, navigationSpy } = renderWithProviders();

      // First attempt - should fail
      fireEvent.changeText(getByTestId('email-input'), 'wrong@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'wrongpassword');
      fireEvent.press(getByTestId('auth-button'));
      
      await waitFor(() => expect(queryByTestId('spinner')).toBeNull());
      expect(queryByTestId('toast')).toBeTruthy();

      // Reset server to default behavior for success
      server.resetHandlers();

      // Second attempt - should succeed
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.press(getByTestId('auth-button'));

      await waitFor(() => expect(queryByTestId('toast')).toBeNull());
      await waitFor(() => expect(navigationSpy).toHaveBeenCalledWith('Home'));
    });

    it('shows a validation error for an invalid email without calling the API', async () => {
      const fetchSpy = jest.spyOn(globalThis, 'fetch');
      const { getByTestId, queryByTestId } = renderWithProviders();

      fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
      fireEvent.press(getByTestId('auth-button'));

      await waitFor(() => {
        expect(queryByTestId('toast')).toBeTruthy();
      });
      
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('shows a validation error for a short password without calling the API', async () => {
      const fetchSpy = jest.spyOn(globalThis, 'fetch');
      const { getByTestId, queryByTestId } = renderWithProviders();

      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), '123');
      fireEvent.press(getByTestId('auth-button'));

      await waitFor(() => {
        expect(queryByTestId('toast')).toBeTruthy();
      });
      
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('calls signIn with the correct provider for OAuth login', () => {
      const { getByTestId } = renderWithProviders();

      fireEvent.press(getByTestId('google-button'));
      expect(mockSignIn).toHaveBeenCalledWith('google');

      fireEvent.press(getByTestId('github-button'));
      expect(mockSignIn).toHaveBeenCalledWith('github');

      fireEvent.press(getByTestId('twitter-button'));
      expect(mockSignIn).toHaveBeenCalledWith('twitter');
    });

    it('shows an error message if OAuth sign-in fails', async () => {
      const errorMessage = 'OAuth provider error';
      mockSignIn.mockRejectedValueOnce(new Error(errorMessage));

      const { getByTestId, queryByTestId } = renderWithProviders();

      fireEvent.press(getByTestId('google-button'));

      await waitFor(() => {
        expect(queryByTestId('toast')).toBeTruthy();
      });
    });
  });

  describe('Register Flow', () => {
    it('registers a new user successfully and navigates to Home', async () => {
      const { getByTestId, queryByTestId, store, navigationSpy } = renderWithProviders();

      // Switch to register mode
      fireEvent.press(getByTestId('register-tab'));

      // Fill in the registration form
      fireEvent.changeText(getByTestId('email-input'), 'newuser@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');
      fireEvent.press(getByTestId('auth-button'));

      // Check spinner appears
      expect(queryByTestId('spinner')).toBeTruthy();
      
      // Wait for spinner to disappear
      await waitFor(() => expect(queryByTestId('spinner')).toBeNull());

      // Check navigation occurred
      await waitFor(() => {
        expect(navigationSpy).toHaveBeenCalledWith('Home');
      });

      // Verify user is in store
      expect(store.getState().user.currentUser).toEqual(mockUser);
    });

    it('shows a server error if registration fails (e.g., email in use)', async () => {
      server.use(
        http.post('http://localhost:3000/api/auth/register', async () => {
          return HttpResponse.json({ message: 'Email already in use' }, { status: 400 });
        })
      );

      const { getByTestId, queryByTestId, navigationSpy } = renderWithProviders();

      // Switch to register mode
      fireEvent.press(getByTestId('register-tab'));

      fireEvent.changeText(getByTestId('email-input'), 'existing@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');
      fireEvent.press(getByTestId('auth-button'));

      // Check spinner appears
      expect(queryByTestId('spinner')).toBeTruthy();
      
      // Wait for spinner to disappear
      await waitFor(() => expect(queryByTestId('spinner')).toBeNull());

      // Check error message appears
      await waitFor(() => {
        expect(queryByTestId('toast')).toBeTruthy();
      });
      
      expect(navigationSpy).not.toHaveBeenCalled();
    });

    it('shows a validation error for mismatched passwords', async () => {
      const fetchSpy = jest.spyOn(globalThis, 'fetch');
      const { getByTestId, queryByTestId, navigationSpy } = renderWithProviders();

      // Switch to register mode
      fireEvent.press(getByTestId('register-tab'));

      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password456');
      fireEvent.press(getByTestId('auth-button'));

      await waitFor(() => {
        expect(queryByTestId('toast')).toBeTruthy();
      });
      
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(navigationSpy).not.toHaveBeenCalled();
    });

    it('calls signIn with the correct provider for OAuth registration', () => {
      const { getByTestId } = renderWithProviders();

      // Switch to register mode
      fireEvent.press(getByTestId('register-tab'));

      fireEvent.press(getByTestId('google-button'));
      expect(mockSignIn).toHaveBeenCalledWith('google');

      fireEvent.press(getByTestId('github-button'));
      expect(mockSignIn).toHaveBeenCalledWith('github');

      fireEvent.press(getByTestId('twitter-button'));
      expect(mockSignIn).toHaveBeenCalledWith('twitter');
    });
  });
});
