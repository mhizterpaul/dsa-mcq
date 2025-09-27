import React from 'react';
import { View } from 'react-native';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, userEvent } from '../test-utils';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import AuthScreen from '../../src/screens/AuthScreen';
import * as appAuth from 'react-native-app-auth';

// Enable fake timers
jest.useFakeTimers();

// Mock react-native-app-auth
jest.spyOn(appAuth, 'authorize').mockResolvedValue({
  accessToken: 'fake-google-token',
  accessTokenExpirationDate: '',
  authorizeAdditionalParameters: {},
  tokenType: 'Bearer',
  idToken: 'fake-id-token',
  scopes: [],
  refreshToken: 'fake-refresh-token',
});

// --- MSW Server Setup ---
const server = setupServer(
  http.post('http://localhost:3000/api/auth/signin', () => {
    return HttpResponse.json({
      token: 'fake-jwt-token',
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
    });
  }),
  http.post('http://localhost:3000/api/auth/register', () => {
    return HttpResponse.json({
      token: 'fake-jwt-token',
      user: { id: '2', name: 'New User', email: 'new@example.com' },
    });
  }),
  http.post('http://localhost:3000/api/auth/provider-signin', () => {
    return HttpResponse.json({
      token: 'fake-jwt-token',
      user: { id: '3', name: 'OAuth User', email: 'oauth@example.com' },
    });
  })
);

const Stack = createStackNavigator();
// Define screen components outside the navigator to prevent re-renders
const HomeScreen = () => <View testID="home-screen" />;
const ForgotPasswordScreen = () => <View />;

const TestNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());


describe('AuthScreen E2E', () => {
  const user = userEvent.setup();

  it('logs in a user successfully and navigates to Home', async () => {
    render(<TestNavigator />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    // Use the unambiguous testID for the submission button
    await user.press(screen.getByTestId('auth-button'));

    expect(await screen.findByTestId('home-screen')).toBeOnTheScreen();
  });

  it('shows an error message when login fails', async () => {
      server.use(
          http.post('http://localhost:3000/api/auth/signin', () => {
            return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
          })
      );

      render(<TestNavigator />);

      await user.type(screen.getByLabelText('Email'), 'wrong@example.com');
      await user.type(screen.getByLabelText('Password'), 'wrongpassword');
      await user.press(screen.getByTestId('auth-button'));

      expect(await screen.findByText('Invalid credentials')).toBeOnTheScreen();
  });

  it('registers a new user successfully and navigates', async () => {
      render(<TestNavigator />);
      // Use the unambiguous testID to switch tabs
      await user.press(screen.getByTestId('register-tab'));

      await user.type(screen.getByLabelText('Email'), 'new@example.com');
      await user.type(screen.getByLabelText('Password'), 'newpassword');
      await user.type(screen.getByLabelText('Confirm Password'), 'newpassword');
      await user.press(screen.getByTestId('auth-button'));

      expect(await screen.findByTestId('home-screen')).toBeOnTheScreen();
  });

  it('shows a server error if registration fails', async () => {
      server.use(
          http.post('http://localhost:3000/api/auth/register', () => {
            return HttpResponse.json({ message: 'Email already in use' }, { status: 400 });
          })
      );
      render(<TestNavigator />);
      await user.press(screen.getByTestId('register-tab'));

      await user.type(screen.getByLabelText('Email'), 'existing@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText('Confirm Password'), 'password123');
      await user.press(screen.getByTestId('auth-button'));

      expect(await screen.findByText('Email already in use')).toBeOnTheScreen();
  });

  it('handles google OAuth sign-in and navigates', async () => {
    render(<TestNavigator />);

    await user.press(screen.getByTestId('google-button'));

    expect(await screen.findByTestId('home-screen')).toBeOnTheScreen();
  });
});