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
import mediatorService from '../../services/mediatorService';

jest.mock('../../services/mediatorService');

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

  test('navigates through the flow and displays real progress via mediator', async () => {
    const userId = 'user-123';
    const initialProfile = new UserProfile(userId);
    initialProfile.globalRanking = 50;

    const mockEngagement = {
        rank: 40,
        streak: 5,
        avgResponseTime: 150.5,
        attendance: 0.8,
        xp: 1000,
        badges: ['1']
    };

    (mediatorService.getUserProgress as jest.Mock).mockResolvedValue(mockEngagement);

    const { store } = renderWithProviders({
        user: {
            user: { currentUser: { id: userId } },
            profile: { profile: initialProfile }
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

    await user.press(screen.getByTestId('continue-button'));

    // Verify Injection into Engagement via Mediator
    expect(mediatorService.injectUserMetrics).toHaveBeenCalledWith(userId, expect.objectContaining({
        avgResponseTime: expect.any(Number)
    }));

    // Verify UserProfile update
    const state = store.getState() as any;
    expect(state.user.profile.profile.isGoalSet).toBe(true);

    expect(mockGoBack).toHaveBeenCalled();
  });

  test('shows Edit button and existing goal data', async () => {
    const profile = new UserProfile('user-123');
    profile.isGoalSet = true;
    profile.preferredQuizTime = '07:00';

    (mediatorService.getUserProgress as jest.Mock).mockResolvedValue({});

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
