// @ts-ignore
global.IS_REACT_ACT_ENVIRONMENT = true;

import * as React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { render, screen, userEvent, fireEvent, act, waitFor } from '@testing-library/react-native';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import rootReducer from '../../store/rootReducer';
import { UserObject } from '../../components/user/store/user.slice';
import UserProfileScreen from '../../screens/UserProfileScreen';

// --- MSW Server Setup ---
const server = setupServer(
  http.get('http://localhost:3000/api/user/profile-summary', () => {
    return HttpResponse.json({
      user: { id: 'user1', fullName: 'Sammy Skott', email: 'sammy@example.com' },
    });
  })
);

beforeAll(() => server.listen());
afterEach(async () => {
    server.resetHandlers();
    // Do not run pending timers here, let each test manage its timers
});
afterAll(() => server.close());

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

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

// Mock Spinner
jest.mock('../../components/common/components/Spinner', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return (props: any) => props.visible ? <View testID="auth-spinner"><Text>Loading...</Text></View> : null;
});

// Mock react-native-ui-lib components that cause issues in tests
jest.mock('react-native-ui-lib', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');

  const MockView = (props: any) => <View {...props} />;
  const MockText = (props: any) => <Text {...props} />;
  const MockButton = (props: any) => (
    <TouchableOpacity onPress={props.onPress} testID={props.testID}>
      <Text>{props.label}</Text>
    </TouchableOpacity>
  );
  MockButton.sizes = { xSmall: 'xSmall', small: 'small', medium: 'medium', large: 'large' };

  const MockAvatar = (props: any) => <View testID="user-avatar" />;

  return {
    View: MockView,
    Text: MockText,
    Button: MockButton,
    Avatar: MockAvatar,
    Image: MockView,
    Colors: { grey10: '#000', grey70: '#ccc', grey80: '#eee', white: '#fff', red10: '#f00', red80: '#fee' },
    Spacings: {
      'paddingH-20': 20, 'paddingV-10': 10, 'marginB-20': 20, 'marginT-40': 40,
      'padding-15': 15, 'marginL-10': 10, 'marginT-10': 10, 'marginB-16': 16,
      'paddingV-15': 15, 'padding-20': 20, 'marginB-15': 15, 'marginT-20': 20
    },
    Typography: { text60b: {}, text70b: {}, text80: {}, text80b: {}, text90: {}, text100b: {} },
  };
});

// --- Redux Store + Render Helper ---
const renderWithProviders = async (preloadedState?: any) => {
  const store = configureStore({
    reducer: rootReducer,
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
    await renderWithProviders({
      user: {
        currentUser: { id: 'user1', fullName: 'Sammy Skott', email: 'sammy@example.com' },
        loading: false,
        error: null,
      }
    });

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

    server.use(
      http.get('http://localhost:3000/api/user/profile-summary', () => {
        return HttpResponse.json({ user: customUser });
      })
    );

    await renderWithProviders();

    expect(await screen.findByTestId('user-name-block')).toHaveTextContent(/John Constantine/i);
    const statsBlock = screen.getByTestId('user-stats-block');
    expect(statsBlock).toHaveTextContent(/42/);
    expect(statsBlock).toHaveTextContent(/99/);
    expect(statsBlock).toHaveTextContent(/7/);
  });

  test('handles long username correctly', async () => {
    const longName = 'Maximilian Alexander von Lichtenstein the Third';
    server.use(
      http.get('http://localhost:3000/api/user/profile-summary', () => {
        return HttpResponse.json({
          user: { id: '1', fullName: longName, email: 'test@test.com' }
        });
      })
    );
    await renderWithProviders();

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
    server.use(
      http.get('http://localhost:3000/api/user/profile-summary', () => {
        return HttpResponse.json({
          user: { id: '1', fullName: 'Minimal User', email: 'min@user.com' }
        });
      })
    );
    await renderWithProviders();

    expect(await screen.findByTestId('user-name-block')).toHaveTextContent(/Minimal User/i);
    expect(screen.getByTestId('user-stats-block')).toHaveTextContent(/02/); // Default level
  });

  test('displays error message and handles retry', async () => {
    const errorMessage = 'Failed to fetch profile';
    server.use(
      http.get('http://localhost:3000/api/user/profile-summary', () => {
        return new HttpResponse(null, { status: 500, statusText: errorMessage });
      })
    );

    const { store } = await renderWithProviders();

    expect(await screen.findByTestId('error-message')).toBeOnTheScreen();

    // Mock successful retry
    server.use(
      http.get('http://localhost:3000/api/user/profile-summary', () => {
        return HttpResponse.json({
          user: { id: 'user1', fullName: 'Sammy Skott', email: 'sammy@example.com' },
        });
      })
    );

    const retryButton = screen.getByTestId('retry-button');
    await user.press(retryButton);

    await waitFor(() => {
        expect(screen.queryByTestId('error-message')).toBeNull();
    });
    expect(screen.getByTestId('user-name-block')).toHaveTextContent(/Sammy Skott/i);
  });

  test('displays spinner when loading', async () => {
    server.use(
      http.get('http://localhost:3000/api/user/profile-summary', async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return HttpResponse.json({
          user: { id: 'user1', fullName: 'Sammy Skott', email: 'sammy@example.com' },
        });
      })
    );

    await renderWithProviders();

    await waitFor(() => {
        expect(screen.queryByTestId('auth-spinner')).not.toBeNull();
    });

    await waitFor(() => {
        expect(screen.queryByTestId('auth-spinner')).toBeNull();
    });
  });
});
