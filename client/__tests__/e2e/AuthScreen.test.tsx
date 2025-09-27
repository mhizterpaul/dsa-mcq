import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { PaperProvider } from 'react-native-paper';
import { setupServer } from 'msw/native';
import { http, HttpResponse } from 'msw';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import AuthScreen from '../../src/screens/AuthScreen';
import userReducer from '../../src/components/user/store/user.slice';

// Use fake timers to handle async operations in a controlled way
jest.useFakeTimers();

const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
const mockToken = 'fake-token';

const server = setupServer(
  http.post('http://localhost:3000/api/auth/signin', async ({ request }) => {
    const { email, password } = await request.json();
    if (email === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({ user: mockUser, token: mockToken }, { status: 200 });
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),
  http.post('http://localhost:3000/api/auth/register', async () => {
    return HttpResponse.json({ user: mockUser, token: mockToken }, { status: 201 });
  }),
  http.post('http://localhost:3000/api/auth/provider-signin', async ({ request }) => {
    const { provider, token } = await request.json();
    if (provider && token === 'valid-token') {
      return HttpResponse.json({ user: mockUser, token: mockToken }, { status: 200 });
    }
    return HttpResponse.json({ message: 'OAuth failed' }, { status: 401 });
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});
afterAll(() => server.close());

const mockAuthorize = jest.fn(() => Promise.resolve({ accessToken: 'valid-token' }));
jest.mock('react-native-app-auth', () => ({
  authorize: mockAuthorize,
}));

// Mock the Toast component to prevent timer-related issues
jest.mock('../../src/components/common/components/Toast', () => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return ({ visible, message }) =>
      visible ? (
        <View testID="toast">
          <Text>{message}</Text>
        </View>
      ) : null;
  });

const renderWithProviders = () => {
  const store = configureStore({
    reducer: { user: userReducer },
  });

  const navigation = {
    navigate: jest.fn(),
  };

  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  return {
    store,
    user,
    navigation,
    ...render(
      <Provider store={store}>
        <PaperProvider>
          <AuthScreen navigation={navigation} />
        </PaperProvider>
      </Provider>
    ),
  };
};

describe('AuthScreen E2E', () => {
  beforeEach(() => {
    mockAuthorize.mockClear();
  });

  describe('Login Flow', () => {
    it('logs in a user successfully and navigates to Home', async () => {
      const { user, navigation } = renderWithProviders();

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.press(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() => expect(navigation.navigate).toHaveBeenCalledWith('Home'));
    });

    it('does not send a second request if login is pressed twice', async () => {
        const fetchSpy = jest.spyOn(globalThis, 'fetch');
        const { user } = renderWithProviders();

        await user.type(screen.getByLabelText('Email'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');

        const loginButton = screen.getByRole('button', { name: 'Login' });
        await user.press(loginButton);
        await user.press(loginButton);

        await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
      });

      it('shows an error message when login fails (401)', async () => {
        const { user, navigation } = renderWithProviders();

        await user.type(screen.getByLabelText('Email'), 'wrong@example.com');
        await user.type(screen.getByLabelText('Password'), 'wrongpassword');
        await user.press(screen.getByRole('button', { name: 'Login' }));

        expect(await screen.findByText('Invalid credentials')).toBeOnTheScreen();
        expect(navigation.navigate).not.toHaveBeenCalled();
      });

      it('clears the error message on a successful retry', async () => {
        server.use(
          http.post('http://localhost:3000/api/auth/signin', async () => {
            return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
          })
        );
        const { user, navigation } = renderWithProviders();

        await user.type(screen.getByLabelText('Email'), 'wrong@example.com');
        await user.type(screen.getByLabelText('Password'), 'wrongpassword');
        await user.press(screen.getByRole('button', { name: 'Login' }));

        expect(await screen.findByText('Invalid credentials')).toBeOnTheScreen();

        server.resetHandlers();

        await user.clear(screen.getByLabelText('Email'));
        await user.type(screen.getByLabelText('Email'), 'test@example.com');
        await user.clear(screen.getByLabelText('Password'));
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.press(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => expect(screen.queryByText('Invalid credentials')).toBeNull());
        await waitFor(() => expect(navigation.navigate).toHaveBeenCalledWith('Home'));
      });

      it('shows a validation error for an invalid email without calling the API', async () => {
        const fetchSpy = jest.spyOn(globalThis, 'fetch');
        const { user } = renderWithProviders();

        await user.type(screen.getByLabelText('Email'), 'invalid-email');
        await user.press(screen.getByRole('button', { name: 'Login' }));

        expect(await screen.findByText('Please enter a valid email address.')).toBeOnTheScreen();
        expect(fetchSpy).not.toHaveBeenCalled();
      });

      it('shows a validation error for a short password without calling the API', async () => {
        const fetchSpy = jest.spyOn(globalThis, 'fetch');
        const { user } = renderWithProviders();

        await user.type(screen.getByLabelText('Email'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), '123');
        await user.press(screen.getByRole('button', { name: 'Login' }));

        expect(await screen.findByText('Password must be at least 6 characters long.')).toBeOnTheScreen();
        expect(fetchSpy).not.toHaveBeenCalled();
      });

      it('logs in with google and navigates to home', async () => {
        const { user, navigation } = renderWithProviders();

        await user.press(screen.getByTestId('google-button'));

        expect(mockAuthorize).toHaveBeenCalledWith(
          expect.objectContaining({ issuer: 'https://accounts.google.com' })
        );
        await waitFor(() => expect(navigation.navigate).toHaveBeenCalledWith('Home'));
      });

      it('logs in with github and navigates to home', async () => {
        const { user, navigation } = renderWithProviders();

        await user.press(screen.getByTestId('github-button'));

        expect(mockAuthorize).toHaveBeenCalledWith(
          expect.objectContaining({ serviceConfiguration: expect.any(Object) })
        );
        await waitFor(() => expect(navigation.navigate).toHaveBeenCalledWith('Home'));
      });

      it('shows an error message if OAuth sign-in fails', async () => {
        mockAuthorize.mockRejectedValueOnce(new Error('OAuth provider error'));
        const { user } = renderWithProviders();

        await user.press(screen.getByTestId('google-button'));

        expect(await screen.findByText('OAuth provider error')).toBeOnTheScreen();
      });
  });

  describe('Register Flow', () => {
    it('registers a new user successfully and navigates to Home', async () => {
        const { user, store, navigation } = renderWithProviders();

        await user.press(screen.getByRole('button', { name: 'Register' }));

        await user.type(screen.getByLabelText('Email'), 'newuser@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.type(screen.getByLabelText('Confirm Password'), 'password123');
        await user.press(screen.getByRole('button', { name: 'Register' }));

        await waitFor(() => expect(navigation.navigate).toHaveBeenCalledWith('Home'));
        expect(store.getState().user.currentUser).toEqual(mockUser);
      });

      it('shows a server error if registration fails (e.g., email in use)', async () => {
        server.use(
          http.post('http://localhost:3000/api/auth/register', async () => {
            return HttpResponse.json({ message: 'Email already in use' }, { status: 400 });
          })
        );
        const { user, navigation } = renderWithProviders();

        await user.press(screen.getByRole('button', { name: 'Register' }));

        await user.type(screen.getByLabelText('Email'), 'existing@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.type(screen.getByLabelText('Confirm Password'), 'password123');
        await user.press(screen.getByRole('button', { name: 'Register' }));

        expect(await screen.findByText('Email already in use')).toBeOnTheScreen();
        expect(navigation.navigate).not.toHaveBeenCalled();
      });

      it('shows a validation error for mismatched passwords', async () => {
        const fetchSpy = jest.spyOn(globalThis, 'fetch');
        const { user, navigation } = renderWithProviders();

        await user.press(screen.getByRole('button', { name: 'Register' }));

        await user.type(screen.getByLabelText('Email'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.type(screen.getByLabelText('Confirm Password'), 'password456');
        await user.press(screen.getByRole('button', { name: 'Register' }));

        expect(await screen.findByText('Passwords do not match.')).toBeOnTheScreen();
        expect(fetchSpy).not.toHaveBeenCalled();
        expect(navigation.navigate).not.toHaveBeenCalled();
      });
  });
});