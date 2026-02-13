import * as React from 'react';
import { Text, View } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/native';
import { render, screen, userEvent, within } from '@testing-library/react-native';

import { configureStore } from '@reduxjs/toolkit';
import type { PreloadedState } from '@reduxjs/toolkit';

import userReducer, { loginUser } from '../../components/user/store/user.slice';
import AuthScreen from '../../screens/AuthScreen';
import { AppStore, RootState } from '../../store';

// Mock the useOAuth hook
import * as oauth from '../../components/common/hooks/useOAuth';

// --- MSW Server Setup ---
const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };

const server = setupServer(
  http.post('http://localhost:3000/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as any;
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({ user: mockUser, token: 'fake-token' });
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),
  http.post('http://localhost:3000/api/auth/signin', async ({ request }) => {
    const body = (await request.json()) as any;
    if (body.username === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({ user: mockUser, token: 'fake-token' });
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),
  http.post('http://localhost:3000/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as any;
    if (body.email === 'newuser@example.com') {
      return HttpResponse.json(
        { user: { ...mockUser, email: 'newuser@example.com' }, token: 'new-fake-token' },
        { status: 201 }
      );
    }
    return HttpResponse.json({ message: 'Email already in use' }, { status: 400 });
  }),
  // Preserved from HEAD: provider-signin handler
  http.post('http://localhost:3000/api/auth/provider-signin', () => {
    return HttpResponse.json({
      token: 'fake-jwt-token',
      user: { id: '3', name: 'OAuth User', email: 'oauth@example.com' },
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

jest.useFakeTimers();

// --- Navigation Test Setup ---
const Stack = createStackNavigator();
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

// --- Redux Store + Render Helper ---
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

describe('AuthScreen E2E', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let signInSpy: jest.SpyInstance;

  beforeEach(() => {
    user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    signInSpy = jest.spyOn(oauth, 'useOAuth');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form correctly by default', () => {
    renderWithProviders();
    const loginTab = screen.getByTestId('login-tab');
    expect(within(loginTab).getByText('Login')).toBeOnTheScreen();
    expect(screen.getByLabelText('Email')).toBeOnTheScreen();
    expect(screen.getByLabelText('Password')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Full name')).toBeNull();
  });

  test('switches between login and register tabs', async () => {
    renderWithProviders();
    await user.press(screen.getByTestId('register-tab'));
    expect(screen.getByLabelText('Full name')).toBeOnTheScreen();
    expect(screen.getByLabelText('Confirm password')).toBeOnTheScreen();

    await user.press(screen.getByTestId('login-tab'));
    expect(screen.queryByLabelText('Full name')).toBeNull();
    expect(screen.queryByLabelText('Confirm password')).toBeNull();
  });

  describe('Login Flow', () => {
    test('user can log in successfully', async () => {
      renderWithProviders();
      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.press(screen.getByTestId('auth-button'));

      expect(await screen.findByText('Welcome Home')).toBeOnTheScreen();

      const state = store.getState().user;
      expect(state.currentUser).toEqual(mockUser);
    });

    test('shows error for incorrect credentials', async () => {
      renderWithProviders();
      await user.type(screen.getByLabelText('Email'), 'wrong@example.com');
      await user.type(screen.getByLabelText('Password'), 'wrongpassword');
      await user.press(screen.getByTestId('auth-button'));

      expect(await screen.findByText('Invalid credentials')).toBeOnTheScreen();
    });

    test('shows validation error for invalid email', async () => {
      renderWithProviders();
      const fetchSpy = jest.spyOn(global, 'fetch');

      await user.type(screen.getByLabelText('Email'), 'invalid-email');
      await user.press(screen.getByTestId('auth-button'));

      expect(await screen.findByText('Please enter a valid email address.')).toBeOnTheScreen();
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe('Register Flow', () => {
    test('user can register successfully', async () => {
      renderWithProviders();
      await user.press(screen.getByTestId('register-tab'));
      await user.type(screen.getByLabelText('Full name'), 'New User');
      await user.type(screen.getByLabelText('Email'), 'newuser@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText('Confirm password'), 'password123');
      await user.press(screen.getByTestId('auth-button'));

      expect(await screen.findByText('Welcome Home')).toBeOnTheScreen();
    });

    test('shows error for mismatched passwords', async () => {
      renderWithProviders();
      const fetchSpy = jest.spyOn(global, 'fetch');

      await user.press(screen.getByTestId('register-tab'));
      await user.type(screen.getByLabelText('Full name'), 'Test User');
      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText('Confirm password'), 'wrongpass');
      await user.press(screen.getByTestId('auth-button'));

      expect(await screen.findByText('Passwords do not match.')).toBeOnTheScreen();
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe('OAuth Flow', () => {
    test('user can sign in with mocked OAuth hook', async () => {
      const mockSignIn = jest.fn().mockImplementation(() => {
        store.dispatch(loginUser.fulfilled({ user: mockUser, token: 'fake-session-token' }, '', { email: 'test@example.com', password: '' }));
        return Promise.resolve({ id_token: 'fake-oauth-token' });
      });
      signInSpy.mockReturnValue({ signIn: mockSignIn });

      renderWithProviders();
      await user.press(screen.getByLabelText('Sign in with Google'));

      expect(mockSignIn).toHaveBeenCalledWith('google');
      expect(await screen.findByText('Welcome Home')).toBeOnTheScreen();
    });

    test('handles provider-signin API fallback', async () => {
      renderWithProviders();
      await user.press(screen.getByLabelText('Sign in with Google'));
      expect(await screen.findByText('Welcome Home')).toBeOnTheScreen();
    });

    test('shows error if OAuth fails', async () => {
      const errorMessage = 'OAuth provider error';
      const mockFail = jest.fn().mockRejectedValue(new Error(errorMessage));
      signInSpy.mockReturnValue({ signIn: mockFail });

      renderWithProviders();
      await user.press(screen.getByLabelText('Sign in with Google'));
      expect(await screen.findByText(errorMessage)).toBeOnTheScreen();
    });
  });
});