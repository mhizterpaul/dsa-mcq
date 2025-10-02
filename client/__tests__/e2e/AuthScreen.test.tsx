import * as React from 'react';
import { Text, View } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/native';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import { configureStore } from '@reduxjs/toolkit';
import type { PreloadedState } from '@reduxjs/toolkit';

import userReducer, { loginUser } from '../../src/components/user/store/user.slice';
import AuthScreen from '../../src/screens/AuthScreen';
import { AppStore, RootState } from '../../src/store';

// Mock the useOAuth hook
import * as oauth from '../../src/components/common/hooks/useOAuth';

// MSW Server Setup
const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };

const server = setupServer(
  http.post('http://localhost:3000/api/auth/signin', async ({ request }) => {
    const body = await request.json() as any;
    if (body.username === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({ user: mockUser, token: 'fake-token' });
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),
  http.post('http://localhost:3000/api/auth/register', async ({ request }) => {
    const body = await request.json() as any;
    if (body.email === 'newuser@example.com') {
      return HttpResponse.json({ user: { ...mockUser, email: 'newuser@example.com' }, token: 'new-fake-token' }, { status: 201 });
    }
    return HttpResponse.json({ message: 'Email already in use' }, { status: 400 });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

jest.useFakeTimers();

// --- Test Setup ---
const Stack = createStackNavigator();

// Define screen components outside of the render function
const HomeScreen = () => <View><Text>Welcome Home</Text></View>;
const ForgotPasswordScreen = () => <View><Text>Forgot Password</Text></View>;

const TestNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

let store: AppStore;
const renderWithProviders = (preloadedState?: PreloadedState<RootState>) => {
  store = configureStore({
    reducer: { user: userReducer },
    preloadedState,
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <PaperProvider>
          <TestNavigator />
        </PaperProvider>
      </Provider>
    ),
  };
};

describe('AuthScreen Best Practices', () => {
  let user;
  let signInSpy: jest.SpyInstance;

  beforeEach(() => {
    // Setup User Event instance
    user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    // Spy on the useOAuth hook
    signInSpy = jest.spyOn(oauth, 'useOAuth');
  });

  afterEach(() => {
      jest.clearAllMocks();
  });

  test('renders login form correctly by default', () => {
    renderWithProviders();
    // The first button with the name "Login" is the tab button.
    expect(screen.getAllByRole('button', { name: 'Login' })[0]).toBeOnTheScreen();
    expect(screen.getByLabelText('Email')).toBeOnTheScreen();
    expect(screen.getByLabelText('Password')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Confirm Password')).not.toBeOnTheScreen();
  });

  test('switches to register form and back', async () => {
    renderWithProviders();
    const registerButton = screen.getByRole('button', { name: 'Register' });
    await user.press(registerButton);

    expect(screen.getByLabelText('Confirm Password')).toBeOnTheScreen();

    // The first button with the name "Login" is the tab button.
    const loginButton = screen.getAllByRole('button', { name: 'Login' })[0];
    await user.press(loginButton);
    expect(screen.queryByLabelText('Confirm Password')).not.toBeOnTheScreen();
  });

  describe('Login Flow', () => {
    test('user can log in successfully', async () => {
      renderWithProviders();

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      // The second button with the name "Login" is the form submission button.
      await user.press(screen.getAllByRole('button', { name: 'Login' })[1]);

      // Wait for navigation
      expect(await screen.findByText('Welcome Home')).toBeOnTheScreen();

      // Check that user state is updated in redux
      const state = store.getState().user;
      expect(state.currentUser).toEqual(mockUser);
      expect(state.loading).toBe(false);
    });

    test('shows an error for incorrect credentials', async () => {
        renderWithProviders();

        await user.type(screen.getByLabelText('Email'), 'wrong@email.com');
        await user.type(screen.getByLabelText('Password'), 'wrongpassword');
        await user.press(screen.getAllByRole('button', { name: 'Login' })[1]);

        expect(await screen.findByText('Invalid credentials')).toBeOnTheScreen();
        // Check we are still on the Auth screen
        expect(screen.getByLabelText('Email')).toBeOnTheScreen();
    });

    test('shows validation error for invalid email and does not call API', async () => {
        renderWithProviders();
        const fetchSpy = jest.spyOn(global, 'fetch');

        await user.type(screen.getByLabelText('Email'), 'invalid-email');
        await user.press(screen.getAllByRole('button', { name: 'Login' })[1]);

        expect(await screen.findByText('Please enter a valid email address.')).toBeOnTheScreen();
        expect(fetchSpy).not.toHaveBeenCalled();
        expect(store.getState().user.currentUser).toBeNull();
    });
  });

  describe('Register Flow', () => {
      test('user can register successfully', async () => {
          renderWithProviders();

          await user.press(screen.getAllByRole('button', { name: 'Register' })[0]);
          await user.type(screen.getByLabelText('Email'), 'newuser@example.com');
          await user.type(screen.getByLabelText('Password'), 'password123');
          await user.type(screen.getByLabelText('Confirm Password'), 'password123');
          await user.press(screen.getAllByRole('button', { name: 'Register' })[1]);

          expect(await screen.findByText('Welcome Home')).toBeOnTheScreen();

          const state = store.getState().user;
          expect(state.currentUser.email).toBe('newuser@example.com');
      });

      test('shows an error for mismatched passwords and does not call API', async () => {
        renderWithProviders();
        const fetchSpy = jest.spyOn(global, 'fetch');

        await user.press(screen.getAllByRole('button', { name: 'Register' })[0]);
        await user.type(screen.getByLabelText('Email'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.type(screen.getByLabelText('Confirm Password'), 'password456');
        await user.press(screen.getAllByRole('button', { name: 'Register' })[1]);

        expect(await screen.findByText('Passwords do not match.')).toBeOnTheScreen();
        expect(fetchSpy).not.toHaveBeenCalled();
      });
  });

  describe('OAuth Flow', () => {
    test('user can sign in with OAuth provider', async () => {
        // Mock the hook to simulate a successful OAuth login
        const mockSignInWithSuccess = jest.fn().mockImplementation(() => {
            store.dispatch(loginUser.fulfilled({ user: mockUser, token: 'fake-session-token' }, '', { username: 'test@example.com', password: ''}));
            return Promise.resolve({ id_token: 'fake-oauth-token' });
        });
        signInSpy.mockReturnValue({ signIn: mockSignInWithSuccess });

        renderWithProviders();

        await user.press(screen.getByLabelText('Sign in with Google'));

        expect(mockSignInWithSuccess).toHaveBeenCalledWith('google');

        expect(await screen.findByText('Welcome Home')).toBeOnTheScreen();

        const state = store.getState().user;
        expect(state.currentUser).toEqual(mockUser);
    });

    test('shows an error if OAuth fails', async () => {
        const errorMessage = 'OAuth provider error';
        const mockSignInWithFailure = jest.fn().mockRejectedValue(new Error(errorMessage));
        signInSpy.mockReturnValue({ signIn: mockSignInWithFailure });

        renderWithProviders();

        await user.press(screen.getByLabelText('Sign in with Google'));

        expect(await screen.findByText(errorMessage)).toBeOnTheScreen();
    });
  });
});