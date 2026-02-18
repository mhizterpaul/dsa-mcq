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
        user: rootReducer,
        engagement: (state: any = { userEngagement: { engagements: {} } }, action: any) => {
            return state;
        }
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

  test('navigates through the flow and displays real progress and injected metrics', async () => {
    const userId = 'user-123';
    const initialProfile = new UserProfile(userId);
    initialProfile.globalRanking = 50;

    const mockEngagement = {
        userId,
        leaderboard_rank: 40,
        streak_length: 5,
        response_latency: 150.5,
        session_attendance: 0.8,
        xp_progress: 1000,
        achievements: [{ id: '1', name: 'First Quiz' }]
    };

    const { store } = renderWithProviders({
        user: {
            user: { currentUser: { id: userId } },
            profile: { profile: initialProfile }
        },
        engagement: {
            userEngagement: {
                engagements: { [userId]: mockEngagement }
            }
        }
    });

    // Step 0: Quiz Time
    await user.press(screen.getByTestId('time-option-09:00'));
    await user.press(screen.getByTestId('continue-button'));

    // Step 1: Goal
    await waitFor(() => expect(screen.getByText('Performance Goal?')).toBeOnTheScreen());
    await user.press(screen.getByTestId('goal-type-LEADERBOARD_PERCENTILE'));
    const percentileInput = screen.getByTestId('percentile-input');
    await user.clear(percentileInput);
    await user.type(percentileInput, '30');
    await user.press(screen.getByTestId('continue-button'));

    // Step 2: Deadline
    await waitFor(() => expect(screen.getByText('Set Your Deadline')).toBeOnTheScreen());
    await user.press(screen.getByTestId('continue-button'));

    // Step 3: Summary
    await waitFor(() => expect(screen.getByText('Create Habit Plan')).toBeOnTheScreen());

    // Progress: (100-40)/(100-30) = 60/70 = 86%
    expect(screen.getByTestId('progress-percentage')).toHaveTextContent('86%');

    // Stats and Badges are NOT displayed visually anymore as per latest instruction "only the progress icon"
    expect(screen.queryByText('150.50ms')).not.toBeOnTheScreen();

    await user.press(screen.getByTestId('continue-button'));

    // Verify Injection into Upstream (Profile) - Data IS fed and injected
    const state = store.getState() as any;
    expect(state.user.profile.profile.isGoalSet).toBe(true);
    expect(state.user.profile.profile.averageResponseTime).toBe(150.5);
    expect(state.user.profile.profile.achievementBadges).toContain('1');

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
