import * as React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { configureStore } from '@reduxjs/toolkit';

import { rootReducer } from '../../components/user/store';
import GoalScreen from '../../screens/GoalScreen';
import { UserProfile, GoalType } from '../../components/user/store/primitives/UserProfile';

const Stack = createStackNavigator();

const mockGoBack = jest.fn();
const mockCanGoBack = jest.fn().mockReturnValue(true);

const renderWithProviders = (preloadedState?: any) => {
  const store = configureStore({
    reducer: {
        user: rootReducer
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
  });

  const navigation = { goBack: mockGoBack, canGoBack: mockCanGoBack };

  return {
    store,
    ...render(
        <Provider store={store}>
          <PaperProvider>
            <GoalScreen navigation={navigation as any} />
          </PaperProvider>
        </Provider>
      )
  };
};

describe('GoalScreen Acceptance Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
  });

  test('navigates through the flow and uses optional calendar icon to modify plan', async () => {
    const initialProfile = new UserProfile('user-123');
    initialProfile.globalRanking = 50;

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

    // Step 1: Performance Goal
    await waitFor(() => expect(screen.getByText('Performance Goal?')).toBeOnTheScreen());
    await user.press(screen.getByTestId('goal-type-LEADERBOARD_PERCENTILE'));

    // Set a more feasible goal: Top 40% (delta = 10, required = 30)
    const percentileInput = screen.getByTestId('percentile-input');
    await user.clear(percentileInput);
    await user.type(percentileInput, '40');
    await user.press(screen.getByTestId('continue-button'));

    // Step 2: Deadline
    await waitFor(() => expect(screen.getByText('Set Your Deadline')).toBeOnTheScreen());
    await user.press(screen.getByTestId('continue-button'));

    // Step 3: Summary Screen (Create Habit Plan)
    await waitFor(() => expect(screen.getByText('Create Habit Plan')).toBeOnTheScreen());
    expect(screen.getByText('80%')).toBeOnTheScreen();
    expect(screen.getByText('Complete')).toBeOnTheScreen();

    // Click optional calendar icon to modify plan (gaming days)
    await user.press(screen.getByTestId('summary-calendar-icon'));
    await waitFor(() => expect(screen.getByText('Modify Gaming Days')).toBeOnTheScreen());

    // Toggle a day
    await user.press(screen.getByTestId('summary-day-option-Sat'));
    await user.press(screen.getByText('Done'));

    // Back to summary
    await waitFor(() => expect(screen.getByText('Create Habit Plan')).toBeOnTheScreen());

    await user.press(screen.getByTestId('continue-button'));

    // Verify Redux state
    const state = store.getState() as any;
    expect(state.user.profile.profile.isGoalSet).toBe(true);
    expect(state.user.profile.profile.gamingDays).toContain('Sat');

    expect(mockGoBack).toHaveBeenCalled();
  });

  test('shows Edit button and existing goal data', async () => {
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
