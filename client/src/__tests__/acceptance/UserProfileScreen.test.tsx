import * as React from 'react';
import { act } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { render, screen, userEvent } from '@testing-library/react-native';
import { configureStore } from '@reduxjs/toolkit';

import userReducer from '../../components/user/store/user.slice';
import UserProfileScreen from '../../screens/UserProfileScreen';

jest.useFakeTimers();

// --- Redux Store + Render Helper ---
const renderWithProviders = () => {
  const store = configureStore({
    reducer: {
      user: userReducer,
      learning: (state = {}) => state,
      engagement: (state = { streak: { currentStreak: 0 } }) => state,
    },
  });

  const Stack = createStackNavigator();

  return {
    store,
    ...render(
      <Provider store={store}>
        <PaperProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Profile" component={UserProfileScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </Provider>
    ),
  };
};

describe('UserProfileScreen Acceptance', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  });

  test('renders all required elements', async () => {
    renderWithProviders();

    await act(async () => {
      jest.runAllTimers();
    });

    // Back button
    expect(screen.getByTestId('back-button')).toBeOnTheScreen();

    // Title block
    expect(screen.getByTestId('screen-title')).toBeOnTheScreen();
    expect(screen.getByTestId('screen-title')).toHaveTextContent('User profile');

    // Menu button
    expect(screen.getByTestId('menu-button')).toBeOnTheScreen();

    // User name block and edit icon
    expect(screen.getByTestId('user-name-block')).toBeOnTheScreen();
    expect(screen.getByTestId('user-name-block')).toHaveTextContent('Sammy Skott');
    expect(screen.getByTestId('edit-icon')).toBeOnTheScreen();

    // User stats block
    expect(screen.getByTestId('user-stats-block')).toBeOnTheScreen();
    expect(screen.getByTestId('user-stats-block')).toHaveTextContent('Level');
    expect(screen.getByTestId('user-stats-block')).toHaveTextContent('Achievements');
    expect(screen.getByTestId('user-stats-block')).toHaveTextContent('Weekly gifts');

    // Bottom nav
    expect(screen.getByTestId('bottom-nav')).toBeOnTheScreen();
  });

  test('dropdown menu icon functions properly', async () => {
    renderWithProviders();
    await act(async () => {
      jest.runAllTimers();
    });

    const menuButton = screen.getByTestId('menu-button');
    await user.press(menuButton);

    // Check if menu items are displayed
    expect(screen.getByText('Coin history')).toBeTruthy();
    expect(screen.getByText('Profile details')).toBeTruthy();
    expect(screen.getByText('Weekly gifts')).toBeTruthy();
    expect(screen.getByText('Questions?')).toBeTruthy();
  });
});
