// @ts-ignore

import * as React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { render, screen, userEvent, fireEvent, act, waitFor } from '@testing-library/react-native';
import { configureStore } from '@reduxjs/toolkit';

import userReducer, { UserObject } from '../../components/user/store/user.slice';
import UserProfileScreen from '../../screens/UserProfileScreen';

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      goBack: mockGoBack,
      navigate: jest.fn(),
    }),
    useRoute: () => ({
      name: 'Profile',
    }),
  };
});

// --- Redux Store + Render Helper ---
const renderWithProviders = async (preloadedState?: any) => {
  const store = configureStore({
    reducer: {
      user: userReducer,
      learning: (state = { recentQuizzes: { ids: [], entities: {} } }) => state,
      engagement: (state = { streak: { currentStreak: 0 } }) => state,
      profile: (state = { profile: { bookmarks: [] } }) => state,
    },
    preloadedState,
  });

  const Stack = createStackNavigator();

  const renderResult = await render(
    <Provider store={store}>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Profile" component={UserProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </Provider>
  );

  return {
    store,
    ...renderResult,
  };
};

describe('UserProfileScreen Acceptance Enhanced', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    mockGoBack.mockClear();
  });

  test('renders all required elements with default state', async () => {
    await renderWithProviders();

    // Back button
    expect(await screen.findByTestId('back-button')).toBeOnTheScreen();

    // Title block
    expect(screen.getByTestId('screen-title')).toHaveTextContent(/User profile/i);

    // User name block
    expect(screen.getByTestId('user-name-block')).toHaveTextContent(/Sammy Skott/i);

    // User stats block
    const statsBlock = screen.getByTestId('user-stats-block');
    expect(statsBlock).toHaveTextContent(/Level/i);
    expect(statsBlock).toHaveTextContent(/Achievements/i);
    expect(statsBlock).toHaveTextContent(/Weekly gifts/i);

    // Bottom nav
    expect(screen.getByTestId('bottom-nav')).toBeOnTheScreen();
  });

  test('back button triggers navigation.goBack()', async () => {
    await renderWithProviders();
    const backButton = await screen.findByTestId('back-button');
    await user.press(backButton);
    expect(mockGoBack).toHaveBeenCalled();
  });

  test('renders dynamic user data correctly', async () => {
    const customUser: UserObject = {
      id: '123',
      fullName: 'John Constantine',
      email: 'john@hellblazer.com',
      level: 42,
      achievementsCount: 99,
      weeklyGiftsCount: 7,
      avatarUrl: 'https://example.com/avatar.png',
      xp: 1000
    };

    await renderWithProviders({
      user: {
        currentUser: customUser,
        loading: false,
        error: null,
      },
    });

    expect(await screen.findByTestId('user-name-block')).toHaveTextContent(/John Constantine/i);
    const statsBlock = screen.getByTestId('user-stats-block');
    expect(statsBlock).toHaveTextContent(/42/);
    expect(statsBlock).toHaveTextContent(/99/);
    expect(statsBlock).toHaveTextContent(/7/);
  });

  test('handles long username correctly', async () => {
    const longName = 'Maximilian Alexander von Lichtenstein the Third';
    await renderWithProviders({
      user: {
        currentUser: { id: '1', fullName: longName, email: 'test@test.com' },
        loading: false,
        error: null,
      },
    });

    expect(await screen.findByTestId('user-name-block')).toHaveTextContent(new RegExp(longName, 'i'));
  });

  test('dropdown menu opens and closes correctly', async () => {
    await renderWithProviders();
    const menuButton = await screen.findByTestId('menu-button');

    // Open menu
    await user.press(menuButton);

    // Check if menu item is visible
    expect(await screen.findByText(/Coin history/i)).toBeOnTheScreen();

    // Close menu by pressing an item
    const menuItem = screen.getByText(/Coin history/i);
    await user.press(menuItem);

    // Wait for menu to close
    await waitFor(() => {
        expect(screen.queryByText(/Coin history/i)).not.toBeOnTheScreen();
    });
  });

  test('handles missing stats by showing defaults', async () => {
    await renderWithProviders({
      user: {
        currentUser: { id: '1', fullName: 'Minimal User', email: 'min@user.com' },
        loading: false,
        error: null,
      },
    });

    expect(await screen.findByTestId('user-name-block')).toHaveTextContent(/Minimal User/i);
    expect(screen.getByTestId('user-stats-block')).toHaveTextContent(/02/); // Default level
  });

  test('displays error message and handles retry', async () => {
    const errorMessage = 'Failed to fetch profile';
    const { store } = await renderWithProviders({
      user: {
        currentUser: null,
        loading: false,
        error: errorMessage,
      },
    });

    expect(await screen.findByTestId('error-message')).toHaveTextContent(new RegExp(errorMessage, 'i'));

    const retryButton = screen.getByTestId('retry-button');
    fireEvent.press(retryButton);

    // Should dispatch fetchUserProfile
    await waitFor(() => {
        expect(store.getState().user.loading).toBe(true);
    });
  });

  test('displays spinner when loading', async () => {
    await renderWithProviders({
      user: {
        currentUser: null,
        loading: true,
        error: null,
      },
    });

    expect(await screen.findByTestId('auth-spinner')).toBeOnTheScreen();
  });
});
