// @ts-ignore
global.IS_REACT_ACT_ENVIRONMENT = true;

import * as React from 'react';
import { View, Text, Alert } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, userEvent, waitFor, act, fireEvent } from '@testing-library/react-native';
import { configureStore } from '@reduxjs/toolkit';

import rootReducer from '../../store/rootReducer';
import DailyQuizScreen from '../../components/learning/screens/DailyQuizScreen';
import DailyQuizSummaryScreen from '../../components/learning/screens/DailyQuizSummaryScreen';

// --- Mock Data ---
const mockQuestions = [
  {
    id: 1,
    question: "Daily Question 1",
    category: "algorithms",
    options: [
      { text: "Option A", isCorrect: true },
      { text: "Option B", isCorrect: false },
    ],
  },
  {
    id: 2,
    question: "Daily Question 2",
    category: "algorithms",
    options: [
      { text: "Option C", isCorrect: true },
      { text: "Option D", isCorrect: false },
    ],
  },
];

const mockSession = {
    sessionId: 'session-123',
    participantCount: 3,
    participants: [
        { userId: 'user1', name: 'Alice', avatarUrl: 'https://i.pravatar.cc/150?u=alice' },
        { userId: 'user2', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/150?u=bob' },
        { userId: 'user3', name: 'Charlie', avatarUrl: 'https://i.pravatar.cc/150?u=charlie' },
    ],
    questionIds: ['1', '2']
};

const mockResults = {
    rank: 1,
    totalParticipants: 3,
    xpEarned: 50,
    leaderboard: [
        { id: 'user1', name: 'Alice', score: 100, avatar: 'https://i.pravatar.cc/150?u=alice' },
        { id: 'user2', name: 'Bob', score: 80, avatar: 'https://i.pravatar.cc/150?u=bob' },
        { id: 'user3', name: 'Charlie', score: 60, avatar: 'https://i.pravatar.cc/150?u=charlie' },
    ]
};

// --- MSW Server Setup ---
const server = setupServer(
  http.get('http://localhost:3000/api/daily-quiz/session', () => {
    return HttpResponse.json(mockSession);
  }),
  http.post('http://localhost:3000/api/learning/questions', async ({ request }) => {
    return HttpResponse.json(mockQuestions);
  }),
  http.post('http://localhost:3000/api/daily-quiz/answer', () => {
    return HttpResponse.json({ success: true });
  }),
  http.get('http://localhost:3000/api/daily-quiz/results', () => {
    return HttpResponse.json(mockResults);
  })
);

// --- SSE Mock ---
let mockSseListeners: { [key: string]: (event: any) => void } = {};
const mockSSEClose = jest.fn();
jest.mock('react-native-sse', () => {
    return jest.fn().mockImplementation(() => ({
        addEventListener: (type: string, listener: any) => {
            mockSseListeners[type] = listener;
        },
        close: mockSSEClose,
        removeEventListener: jest.fn(),
    }));
});

// --- Mediator Mock ---
jest.mock('../../services/mediatorService', () => ({
    getEarnedBadgesForSession: jest.fn().mockResolvedValue([{ id: 'badge1', name: 'Fast Learner' }]),
}));

beforeAll(() => server.listen());
afterEach(async () => {
    server.resetHandlers();
    mockSseListeners = {};
    jest.clearAllMocks();
    // Clear any pending timers
    await act(async () => {
        jest.runOnlyPendingTimers();
    });
});
afterAll(() => server.close());

jest.useFakeTimers();

// --- Navigation Test Setup ---
const Stack = createStackNavigator();
const HomeScreen = () => <View><Text>Home Screen</Text></View>;

const TestNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DailyQuiz" component={DailyQuizScreen} />
      <Stack.Screen name="DailyQuizSummary" component={DailyQuizSummaryScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
);

let store: any;
const renderWithProviders = async (preloadedState?: any) => {
  store = configureStore({
    reducer: rootReducer,
    preloadedState
  });

  const result = await render(
    <Provider store={store}>
      <PaperProvider>
        <NavigationContainer>
            <TestNavigator />
        </NavigationContainer>
      </PaperProvider>
    </Provider>
  );

  return {
    store,
    ...result
  };
};

describe('DailyQuizScreen Acceptance Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  });

  test('renders all daily quiz UI elements correctly', async () => {
    await renderWithProviders({ profile: { profile: { bookmarks: [] } } });

    expect(await screen.findByTestId('quiz-header-title')).toBeOnTheScreen();

    expect(screen.getByTestId('back-button')).toBeOnTheScreen();
    expect(screen.getByText('Aptitude Test')).toBeOnTheScreen();
    expect(screen.getByTestId('timer-text')).toHaveTextContent('2:00');
    expect(screen.getByTestId('progress-bar-container')).toBeOnTheScreen();
    expect(screen.getByTestId('quiz-type')).toHaveTextContent(/ALGORITHMS/i);
    expect(screen.getByTestId('question-count')).toHaveTextContent('0 out of 2 questions');
    expect(screen.getByTestId('member-tracking')).toBeOnTheScreen();
    expect(screen.getByText('3 members in session')).toBeOnTheScreen();
    expect(screen.getByText('Start Quiz')).toBeOnTheScreen();
  });

  test('Next button is disabled until an option is selected for all questions', async () => {
    await renderWithProviders({ profile: { profile: { bookmarks: [] } } });

    const startBtn = await screen.findByText('Start Quiz');
    await user.press(startBtn);

    const nextButton = await screen.findByTestId('next-button');

    // Question 1
    expect(nextButton).toBeDisabled();
    await user.press(screen.getByText('Option A'));
    expect(nextButton).not.toBeDisabled();
    await user.press(nextButton);

    // Question 2
    expect(await screen.findByText('Daily Question 2')).toBeOnTheScreen();
    expect(nextButton).toBeDisabled();
    await user.press(screen.getByText('Option C'));
    expect(nextButton).not.toBeDisabled();
  });

  test('timer counts down after starting', async () => {
    await renderWithProviders({ profile: { profile: { bookmarks: [] } } });
    const startBtn = await screen.findByText('Start Quiz');
    await user.press(startBtn);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
        expect(screen.getByTestId('timer-text')).toHaveTextContent('1:59');
    });
  });

  test('back button does not exit the quiz', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation();
    await renderWithProviders({ profile: { profile: { bookmarks: [] } } });

    const backBtn = await screen.findByTestId('back-button');
    await user.press(backBtn);

    expect(alertSpy).toHaveBeenCalledWith(
        "Exit Restricted",
        "You cannot exit the quiz until the session is over.",
        [{ text: "OK" }]
    );
    alertSpy.mockRestore();
  });

  test('completes quiz and shows summary with leaderboard', async () => {
    await renderWithProviders({ profile: { profile: { bookmarks: [] } } });
    const startBtn = await screen.findByText('Start Quiz');
    await user.press(startBtn);

    // Question 1
    await user.press(screen.getByText('Option A'));
    await user.press(screen.getByTestId('next-button'));

    // Question 2
    expect(await screen.findByText('Daily Question 2')).toBeOnTheScreen();
    await user.press(screen.getByText('Option C'));
    await user.press(screen.getByTestId('next-button'));

    // Summary Screen
    expect(await screen.findByTestId('summary-title')).toBeOnTheScreen();
    expect(screen.getByTestId('user-rank')).toHaveTextContent('1 / 3');
    expect(screen.getByTestId('xp-earned')).toHaveTextContent('+50');
    expect(screen.getByTestId('leaderboard-scroll')).toBeOnTheScreen();

    // Check leaderboard content (Winner Alice should have a crown)
    expect(screen.getByText('Alice')).toBeOnTheScreen();
    expect(screen.getByTestId('winner-crown')).toBeOnTheScreen();
    expect(screen.getByText('Bob')).toBeOnTheScreen();
    expect(screen.getByText('Charlie')).toBeOnTheScreen();

    expect(screen.getByTestId('play-again-button')).toBeOnTheScreen();
    expect(screen.getByTestId('home-button')).toBeOnTheScreen();
  });

  test('handles real-time participant updates via SSE', async () => {
    await renderWithProviders({ profile: { profile: { bookmarks: [] } } });
    expect(await screen.findByTestId('member-tracking')).toBeOnTheScreen();
    expect(screen.getByText('3 members in session')).toBeOnTheScreen();

    // Trigger SSE event with 4 participants
    await act(async () => {
        if (mockSseListeners['message']) {
            mockSseListeners['message']({
                data: JSON.stringify({
                    type: 'participant_update',
                    payload: [
                        { userId: 'user1', name: 'Alice', avatarUrl: '...' },
                        { userId: 'user2', name: 'Bob', avatarUrl: '...' },
                        { userId: 'user3', name: 'Charlie', avatarUrl: '...' },
                        { userId: 'user4', name: 'David', avatarUrl: '...' },
                    ]
                })
            });
        }
    });

    expect(screen.getByText('4 members in session')).toBeOnTheScreen();
  });

  test('handles tie scores on the leaderboard', async () => {
    const tiedResults = {
        ...mockResults,
        leaderboard: [
            { id: 'user1', name: 'Alice', score: 100, avatar: '...' },
            { id: 'user2', name: 'Bob', score: 100, avatar: '...' },
            { id: 'user3', name: 'Charlie', score: 60, avatar: '...' },
        ]
    };
    server.use(
        http.get('http://localhost:3000/api/daily-quiz/results', () => {
            return HttpResponse.json(tiedResults);
        })
    );

    await renderWithProviders();
    const startBtn = await screen.findByText('Start Quiz');
    await user.press(startBtn);

    await user.press(screen.getByText('Option A'));
    await user.press(screen.getByTestId('next-button'));

    expect(await screen.findByText('Daily Question 2')).toBeOnTheScreen();
    await user.press(screen.getByText('Option C'));
    await user.press(screen.getByTestId('next-button'));

    expect(await screen.findByTestId('summary-title')).toBeOnTheScreen();

    // Both Alice and Bob should have crowns
    const crowns = screen.getAllByTestId('winner-crown');
    expect(crowns.length).toBe(2);
  });

  test('handles maximum (5) participants and UI scales', async () => {
    await renderWithProviders();
    expect(await screen.findByTestId('member-tracking')).toBeOnTheScreen();

    await act(async () => {
        if (mockSseListeners['message']) {
            mockSseListeners['message']({
                data: JSON.stringify({
                    type: 'participant_update',
                    payload: [
                        { userId: 'u1', name: 'A', avatarUrl: '...' },
                        { userId: 'u2', name: 'B', avatarUrl: '...' },
                        { userId: 'u3', name: 'C', avatarUrl: '...' },
                        { userId: 'u4', name: 'D', avatarUrl: '...' },
                        { userId: 'u5', name: 'E', avatarUrl: '...' },
                    ]
                })
            });
        }
    });

    expect(screen.getByText('5 members in session')).toBeOnTheScreen();
    // AvatarGroup should show +2 if it slices at 3
    expect(screen.getByText('+2')).toBeOnTheScreen();
  });

  test('handles participant leaving mid-quiz', async () => {
    await renderWithProviders();
    expect(await screen.findByTestId('member-tracking')).toBeOnTheScreen();
    expect(screen.getByText('3 members in session')).toBeOnTheScreen();

    // Trigger SSE event with 2 participants (one left)
    await act(async () => {
        if (mockSseListeners['message']) {
            mockSseListeners['message']({
                data: JSON.stringify({
                    type: 'participant_update',
                    payload: [
                        { userId: 'user1', name: 'Alice', avatarUrl: '...' },
                        { userId: 'user2', name: 'Bob', avatarUrl: '...' },
                    ]
                })
            });
        }
    });

    expect(screen.getByText('2 members in session')).toBeOnTheScreen();
  });

  test('timer expiration auto-advances to next question', async () => {
    await renderWithProviders();
    const startBtn = await screen.findByText('Start Quiz');
    await user.press(startBtn);

    expect(await screen.findByText('Daily Question 1')).toBeOnTheScreen();

    // Advance timer by 120 seconds
    await act(async () => {
        jest.advanceTimersByTime(120000);
    });

    expect(await screen.findByText('Daily Question 2')).toBeOnTheScreen();
  });

  test('summary screen buttons work as required', async () => {
    await renderWithProviders();
    const startBtn = await screen.findByText('Start Quiz');
    await user.press(startBtn);

    // Question 1
    await user.press(screen.getByText('Option A'));
    await user.press(screen.getByTestId('next-button'));
    // Question 2
    expect(await screen.findByText('Daily Question 2')).toBeOnTheScreen();
    await user.press(screen.getByText('Option C'));
    await user.press(screen.getByTestId('next-button'));

    // Summary Screen
    expect(await screen.findByTestId('summary-title')).toBeOnTheScreen();

    // Play Again
    await user.press(screen.getByTestId('play-again-button'));
    expect(await screen.findByText('Start Quiz')).toBeOnTheScreen();

    // Go to summary again
    await user.press(screen.getByText('Start Quiz'));
    await user.press(screen.getByText('Option A'));
    await user.press(screen.getByTestId('next-button'));
    expect(await screen.findByText('Daily Question 2')).toBeOnTheScreen();
    await user.press(screen.getByText('Option C'));
    await user.press(screen.getByTestId('next-button'));

    // Home button
    expect(await screen.findByTestId('summary-title')).toBeOnTheScreen();
    await user.press(screen.getByTestId('home-button'));
    expect(await screen.findByText('Home Screen')).toBeOnTheScreen();
  });

  test('user can bookmark question in daily quiz session', async () => {
    await renderWithProviders({
        profile: {
            profile: {
                userId: 'user1',
                bookmarks: [],
                goals: [],
                totalXP: 0,
                correctAnswers: 0,
                completedQuizzes: 0,
                globalRanking: 0,
                highestAchievement: null,
                settings: { theme: 'system', notificationsEnabled: true, language: 'en', soundEffects: true }
            }
        }
    });
    const startBtn = await screen.findByText('Start Quiz');
    await user.press(startBtn);

    expect(await screen.findByText(/Daily Question 1/)).toBeOnTheScreen();

    const bookmarkIcon = screen.getByTestId('daily-bookmark-icon');
    await user.press(bookmarkIcon);

    expect(await screen.findByTestId('daily-bookmark-icon-active')).toBeOnTheScreen();

    const state = store.getState();
    expect(state.profile.profile.bookmarks.length).toBe(1);
  });
});
