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
            serializableCheck: false // Disable to avoid class instance warnings during tests
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

  test('back button calls navigation.goBack()', async () => {
    renderWithProviders();

    await user.press(screen.getByTestId('back-button'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  test('navigates through the new goal setting flow with leaderboard percentile', async () => {
    const initialProfile = new UserProfile('user-123');
    initialProfile.globalRanking = 50;

    const { store } = renderWithProviders({
        user: {
            profile: {
                profile: initialProfile
            }
        }
    });

    // Step 0: Quiz Time & Days
    await user.press(screen.getByTestId('day-option-Sat'));
    await user.press(screen.getByTestId('time-option-09:00'));
    await user.press(screen.getByTestId('continue-button'));

    // Step 1: Performance Goal
    await waitFor(() => expect(screen.getByText('Performance Goal?')).toBeOnTheScreen());
    await user.press(screen.getByTestId('goal-type-LEADERBOARD_PERCENTILE'));

    const percentileInput = screen.getByTestId('percentile-input');
    await user.clear(percentileInput);
    await user.type(percentileInput, '20');
    await user.press(screen.getByTestId('continue-button'));

    // Step 2: Deadline
    await waitFor(() => expect(screen.getByText('Set Your Deadline')).toBeOnTheScreen());
    const deadlineInput = screen.getByTestId('deadline-input');
    await user.clear(deadlineInput);
    // Setting a far deadline to ensure feasibility
    const futureDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await user.type(deadlineInput, futureDate);
    await user.press(screen.getByTestId('continue-button'));

    // Step 3: Generated Habit Plan
    await waitFor(() => expect(screen.getByText('Your Auto-Generated Habit Plan')).toBeOnTheScreen());
    expect(screen.getByText('Complete')).toBeOnTheScreen();

    await user.press(screen.getByTestId('continue-button'));

    // Verify Redux state
    const state = store.getState() as any;
    expect(state.user.profile.profile.isGoalSet).toBe(true);
    expect(state.user.profile.profile.activePerformanceGoal.type).toBe(GoalType.LEADERBOARD_PERCENTILE);
    expect(state.user.profile.profile.activePerformanceGoal.targetMetric).toBe(20);
    expect(state.user.profile.profile.quizSchedule).toBeDefined();
    expect(state.user.profile.profile.quizSchedule.sessions.length).toBeGreaterThan(0);

    expect(mockGoBack).toHaveBeenCalled();
  });

  test('shows Edit button and existing goal data', async () => {
    const profile = new UserProfile('user-123');
    profile.isGoalSet = true;
    profile.preferredQuizTime = '07:00';
    profile.activePerformanceGoal = {
        type: GoalType.INTERVIEW_PREP,
        targetMetric: 'Standard',
        deadline: '2025-12-31'
    };

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
