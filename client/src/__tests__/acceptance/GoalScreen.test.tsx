import * as React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { configureStore } from '@reduxjs/toolkit';

import { rootReducer } from '../../components/user/store';
import GoalScreen from '../../screens/GoalScreen';
import { UserProfile } from '../../components/user/store/primitives/UserProfile';

const Stack = createStackNavigator();

const renderWithProviders = (preloadedState?: any) => {
  const store = configureStore({
    reducer: {
        user: rootReducer
    },
    preloadedState
  });

  return {
    store,
    ...render(
        <Provider store={store}>
          <PaperProvider>
            <NavigationContainer>
              <Stack.Navigator>
                <Stack.Screen name="Goal" component={GoalScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </PaperProvider>
        </Provider>
      )
  };
};

describe('GoalScreen Acceptance Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  test('renders all initial UI elements correctly', async () => {
    renderWithProviders();

    expect(screen.getByTestId('back-button')).toBeOnTheScreen();
    expect(screen.getByTestId('progress-bar-fill')).toBeOnTheScreen();
    expect(screen.getByText('Preferred Quiz Time?')).toBeOnTheScreen();
    expect(screen.getByTestId('time-option-08:00')).toBeOnTheScreen();
  });

  test('navigates through all steps and completes goal setting', async () => {
    const initialProfile = new UserProfile('user-123');
    const { store } = renderWithProviders({
        user: {
            profile: {
                profile: initialProfile
            }
        }
    });

    // Step 0: Quiz Time
    await user.press(screen.getByTestId('time-option-09:00'));
    await user.press(screen.getByTestId('continue-button'));

    // Step 1: Performance Target
    await waitFor(() => expect(screen.getByText('Performance Target?')).toBeOnTheScreen());
    await user.press(screen.getByTestId('target-option-Master Algorithms'));
    await user.press(screen.getByTestId('continue-button'));

    // Step 2: Habit Plan
    await waitFor(() => expect(screen.getByText('Habit Plan')).toBeOnTheScreen());
    await user.press(screen.getByTestId('continue-button'));

    // Step 3: Create Habit Plan
    await waitFor(() => expect(screen.getByText('Create Habit Plan')).toBeOnTheScreen());
    expect(screen.getByTestId('calendar-icon')).toBeOnTheScreen();
    expect(screen.getByText('Complete')).toBeOnTheScreen();

    await user.press(screen.getByTestId('continue-button'));

    // Verify Redux state
    const state = store.getState() as any;
    expect(state.user.profile.profile.isGoalSet).toBe(true);
    expect(state.user.profile.profile.preferredQuizTime).toBe('09:00');
    expect(state.user.profile.profile.performanceTarget).toBe('Master Algorithms');
  });

  test('shows Edit button on subsequent visit if goal is already set', async () => {
    const profile = new UserProfile('user-123');
    profile.isGoalSet = true;
    profile.preferredQuizTime = '07:00';

    renderWithProviders({
        user: {
            profile: {
                profile: profile
            }
        }
    });

    expect(screen.getByText('Edit')).toBeOnTheScreen();
    expect(screen.getByText('07:00')).toBeOnTheScreen();
  });
});
