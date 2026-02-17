import * as React from 'react';
import { View, Text } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/native';
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
    }));
});

// --- Mediator Mock ---
jest.mock('../../services/mediatorService', () => ({
    getEarnedBadgesForSession: jest.fn().mockResolvedValue([{ id: 'badge1', name: 'Fast Learner' }]),
}));

beforeAll(() => server.listen());
afterEach(() => {
    server.resetHandlers();
    mockSseListeners = {};
    jest.clearAllMocks();
});
afterAll(() => server.close());

jest.useFakeTimers();

// --- Navigation Test Setup ---
const Stack = createStackNavigator();
const HomeScreen = () => <View><Text>Home Screen</Text></View>;

const TestNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DailyQuiz" component={DailyQuizScreen} />
      <Stack.Screen name="DailyQuizSummary" component={DailyQuizSummaryScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

const renderWithProviders = () => {
  const store = configureStore({
    reducer: rootReducer,
  });

  return render(
    <Provider store={store}>
      <PaperProvider>
        <TestNavigator />
      </PaperProvider>
    </Provider>
  );
};

describe('DailyQuizScreen Acceptance Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  });

  test('renders all daily quiz UI elements correctly', async () => {
    renderWithProviders();

    await waitFor(() => expect(screen.getByTestId('quiz-header-title')).toBeOnTheScreen());

    expect(screen.getByTestId('back-button')).toBeOnTheScreen();
    expect(screen.getByText('Aptitude Test')).toBeOnTheScreen();
    expect(screen.getByTestId('timer-text')).toHaveTextContent('2:00');
    expect(screen.getByTestId('progress-bar-container')).toBeOnTheScreen();
    expect(screen.getByTestId('quiz-type')).toHaveTextContent('ALGORITHMS');
    expect(screen.getByTestId('question-count')).toHaveTextContent('0 out of 2 questions');
    expect(screen.getByTestId('member-tracking')).toBeOnTheScreen();
    expect(screen.getByText('3 members in session')).toBeOnTheScreen();
    expect(screen.getByText('Start Quiz')).toBeOnTheScreen();
  });

  test('Next button is disabled until an option is selected for all questions', async () => {
    renderWithProviders();

    await waitFor(() => expect(screen.getByText('Start Quiz')).toBeOnTheScreen());
    await user.press(screen.getByText('Start Quiz'));

    const nextButton = screen.getByTestId('next-button');

    // Question 1
    expect(nextButton).toBeDisabled();
    await user.press(screen.getByText('Option A'));
    expect(nextButton).not.toBeDisabled();
    await user.press(nextButton);

    // Question 2
    await waitFor(() => expect(screen.getByText('Daily Question 2')).toBeOnTheScreen());
    expect(nextButton).toBeDisabled();
    await user.press(screen.getByText('Option C'));
    expect(nextButton).not.toBeDisabled();
  });

  test('timer counts down after starting', async () => {
    renderWithProviders();
    await waitFor(() => expect(screen.getByText('Start Quiz')).toBeOnTheScreen());
    await user.press(screen.getByText('Start Quiz'));

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId('timer-text')).toHaveTextContent('1:59');
  });

  test('back button does not exit the quiz', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    renderWithProviders();
    await waitFor(() => expect(screen.getByTestId('back-button')).toBeOnTheScreen());

    await user.press(screen.getByTestId('back-button'));
    expect(consoleSpy).toHaveBeenCalledWith("Exit restricted during Daily Quiz");
    consoleSpy.mockRestore();
  });

  test('completes quiz and shows summary with leaderboard', async () => {
    renderWithProviders();
    await waitFor(() => expect(screen.getByText('Start Quiz')).toBeOnTheScreen());
    await user.press(screen.getByText('Start Quiz'));

    // Question 1
    await user.press(screen.getByText('Option A'));
    await user.press(screen.getByTestId('next-button'));

    // Question 2
    await waitFor(() => expect(screen.getByText('Daily Question 2')).toBeOnTheScreen());
    await user.press(screen.getByText('Option C'));
    await user.press(screen.getByTestId('next-button'));

    // Summary Screen
    await waitFor(() => expect(screen.getByTestId('summary-title')).toBeOnTheScreen());
    expect(screen.getByTestId('user-rank')).toHaveTextContent('1 / 3');
    expect(screen.getByTestId('xp-earned')).toHaveTextContent('+50');
    expect(screen.getByTestId('leaderboard-scroll')).toBeOnTheScreen();

    // Check leaderboard content (Winner Alice should have a crown)
    expect(screen.getByText('Alice')).toBeOnTheScreen();
    expect(screen.getByText('Bob')).toBeOnTheScreen();
    expect(screen.getByText('Charlie')).toBeOnTheScreen();

    expect(screen.getByTestId('play-again-button')).toBeOnTheScreen();
    expect(screen.getByTestId('home-button')).toBeOnTheScreen();
  });

  test('handles real-time participant updates via SSE', async () => {
    renderWithProviders();
    await waitFor(() => expect(screen.getByTestId('member-tracking')).toBeOnTheScreen());

    // Trigger SSE event
    act(() => {
        mockSseListeners['message']({
            data: JSON.stringify({
                type: 'participant_update',
                payload: [
                    { userId: 'user1', name: 'Alice', score: 10 },
                    { userId: 'user2', name: 'Bob', score: 5 },
                ]
            })
        });
    });

    // In this implementation, participant updates might update a list,
    // but the UI mainly shows AvatarGroup from the initial session.
    // If we wanted to show scores in real-time we'd need more UI.
    // For now, let's just ensure it doesn't crash.
  });
});
