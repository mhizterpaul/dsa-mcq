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

  test('navigates through the flow and verifies high-fidelity elements via mediator', async () => {
    const userId = 'user-123';
    const initialProfile = new UserProfile(userId);
    initialProfile.globalRanking = 50;

    const mockEngagement = {
        rank: 40,
        streak_length: 5,
        average_response_time: 150.5,
        session_attendance: 0.8,
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

    // Step 0: Wake Time
    expect(screen.getByText('Your Wake Time?')).toBeOnTheScreen();
    await user.press(screen.getByTestId('time-option-09:00'));
    await user.press(screen.getByTestId('continue-button'));

    // Step 1: Goal Target
    await waitFor(() => expect(screen.getByText('Your Goal Target?')).toBeOnTheScreen());
    await user.press(screen.getByTestId('goal-type-LEADERBOARD_PERCENTILE'));
    const percentileInput = screen.getByTestId('percentile-input');
    await user.clear(percentileInput);
    await user.type(percentileInput, '30');
    await user.press(screen.getByTestId('continue-button'));

    // Step 2: Deadline
    await waitFor(() => expect(screen.getByText('Set Your Deadline')).toBeOnTheScreen());
    await user.press(screen.getByTestId('continue-button'));

    // Step 3: Summary (Create Habit Plan)
    await waitFor(() => expect(screen.getByText('Create Habit Plan')).toBeOnTheScreen());

    // Check Calendar Icon at the top
    expect(screen.getByTestId('summary-calendar-icon')).toBeOnTheScreen();

    // Check Progress Component (Progress: (100-40)/(100-30) = 60/70 = 85.7% -> 86%)
    expect(screen.getByTestId('progress-percentage')).toHaveTextContent('86%');
    expect(screen.getByText('Habit')).toBeOnTheScreen();

    // Check Styled Button with "Complete" text
    expect(screen.getByText('Complete')).toBeOnTheScreen();

    await user.press(screen.getByTestId('continue-button'));

    // Verify UserProfile update
    const state = store.getState() as any;
    expect(state.user.profile.profile.isGoalSet).toBe(true);

    // Verification: mediator was used to fetch data
    expect(mediatorService.getUserProgress).toHaveBeenCalledWith(userId);

    expect(mockGoBack).toHaveBeenCalled();
  });

  test('validates percentile input (range 1-100)', async () => {
    const userId = 'user-123';
    (mediatorService.getUserProgress as jest.Mock).mockResolvedValue({});
    renderWithProviders({
        user: {
            user: { currentUser: { id: userId } },
            profile: { profile: new UserProfile(userId) }
        }
    });

    // Move to Step 1
    await user.press(screen.getByTestId('continue-button'));
    await waitFor(() => expect(screen.getByText('Your Goal Target?')).toBeOnTheScreen());
    await user.press(screen.getByTestId('goal-type-LEADERBOARD_PERCENTILE'));

    const percentileInput = screen.getByTestId('percentile-input');
    const continueBtn = screen.getByTestId('continue-button');

    // Case: > 100
    await user.clear(percentileInput);
    await user.type(percentileInput, '101');
    expect(continueBtn).toBeDisabled();
    expect(screen.getByText('Please enter a value between 1 and 100')).toBeOnTheScreen();

    // Case: 0
    await user.clear(percentileInput);
    await user.type(percentileInput, '0');
    expect(continueBtn).toBeDisabled();

    // Case: Valid
    await user.clear(percentileInput);
    await user.type(percentileInput, '50');
    expect(continueBtn).not.toBeDisabled();
  });

  test('handles intermediate back navigation', async () => {
    (mediatorService.getUserProgress as jest.Mock).mockResolvedValue({});
    renderWithProviders();

    // Step 0 -> Step 1
    await user.press(screen.getByTestId('continue-button'));
    await waitFor(() => expect(screen.getByText('Your Goal Target?')).toBeOnTheScreen());

    // Press Back: Step 1 -> Step 0
    await user.press(screen.getByTestId('back-button'));
    await waitFor(() => expect(screen.getByText('Your Wake Time?')).toBeOnTheScreen());

    // Press Back: Step 0 -> Exit (goBack)
    await user.press(screen.getByTestId('back-button'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  test('verifies calendar interaction in summary', async () => {
    const userId = 'user-123';
    const profile = new UserProfile(userId);
    profile.globalRanking = 50;
    (mediatorService.getUserProgress as jest.Mock).mockResolvedValue({ rank: 40 });

    renderWithProviders({
        user: { user: { currentUser: { id: userId } }, profile: { profile } }
    });

    // Skip to summary
    await user.press(screen.getByTestId('continue-button')); // 0 -> 1
    await waitFor(() => screen.getByText('Your Goal Target?'));

    // Set feasible target
    const percentileInput = screen.getByTestId('percentile-input');
    await user.clear(percentileInput);
    await user.type(percentileInput, '40');

    await user.press(screen.getByTestId('continue-button')); // 1 -> 2
    await waitFor(() => screen.getByText('Set Your Deadline'));
    await user.press(screen.getByTestId('continue-button')); // 2 -> 3
    await waitFor(() => screen.getByText('Create Habit Plan'));

    // Open calendar day selector
    await user.press(screen.getByTestId('summary-calendar-icon'));
    expect(screen.getByText('Modify Gaming Days')).toBeOnTheScreen();

    // Toggle a day (Deselect Mon)
    await user.press(screen.getByTestId('summary-day-option-Mon'));
    await user.press(screen.getByText('Done'));

    expect(screen.getByText('Create Habit Plan')).toBeOnTheScreen();
  });

  test('preserves configuration across renders', async () => {
    const userId = 'user-123';
    const profile = new UserProfile(userId);
    profile.preferredQuizTime = '10:00';
    (mediatorService.getUserProgress as jest.Mock).mockResolvedValue({});

    renderWithProviders({
        user: { user: { currentUser: { id: userId } }, profile: { profile } }
    });

    expect(screen.getByText('10:00')).toBeOnTheScreen();
  });

  test('shows Edit button for existing goals', async () => {
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
  });
});
