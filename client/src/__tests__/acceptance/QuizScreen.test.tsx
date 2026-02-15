import * as React from 'react';
import { View, Text } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/native';
import { render, screen, userEvent, waitFor, within, fireEvent, act } from '@testing-library/react-native';

import { configureStore } from '@reduxjs/toolkit';
import type { PreloadedState } from '@reduxjs/toolkit';

import rootReducer from '../../store/rootReducer';
import QuizScreen from '../../screens/QuizScreen';
import { AppStore, RootState } from '../../store';
import { UserQuestionData } from '../../components/learning/store/primitives/UserQuestionData';

// --- Mock Data ---
const mockQuestions = [
  {
    id: 1,
    question: "Two Sum: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    category: "algorithms",
    tags: ["Array", "Hash Table"],
    options: [
      { text: "Use a brute-force approach", isCorrect: false },
      { text: "Sort the array", isCorrect: false },
      { text: "Use recursion", isCorrect: false },
      { text: "Iterate through the array", isCorrect: false },
      { text: "Use a hash map", isCorrect: true },
    ],
  },
  {
    id: 2,
    question: "Add Two Numbers: You are given two non-empty linked lists representing two non-negative integers.",
    category: "algorithms",
    tags: ["Linked List", "Math"],
    options: [
      { text: "Use a hash map", isCorrect: false },
      { text: "Recursively add", isCorrect: false },
      { text: "Convert to strings", isCorrect: false },
      { text: "Subtract smaller", isCorrect: false },
      { text: "Traverse both lists", isCorrect: true },
    ],
  },
  {
    id: 3,
    question: "Question 3",
    category: "algorithms",
    tags: [],
    options: [{ text: "Next →", isCorrect: true }, { text: "B", isCorrect: false }],
  },
  {
    id: 4,
    question: "Question 4",
    category: "algorithms",
    tags: [],
    options: [{ text: "Finish", isCorrect: true }, { text: "B", isCorrect: false }],
  },
];

const mockUser = { id: 'user1', name: 'Test User', email: 'test@example.com' };

// --- MSW Server Setup ---
const server = setupServer(
  http.post('http://localhost:3000/api/learning/questions', async ({ request }) => {
    const { ids } = (await request.json()) as { ids: number[] };
    const filtered = mockQuestions.filter(q => ids.includes(q.id));
    return HttpResponse.json(filtered);
  }),
  http.get('http://localhost:3000/api/user/profile-summary', () => {
    return HttpResponse.json({
      user: mockUser,
      stats: { xp: 100, rank: 1 },
    });
  })
);

// Mock SQLite Service
let mockDb: { [key: string]: any } = {};
jest.mock('../../components/common/services/sqliteService', () => ({
  sqliteService: {
    getById: jest.fn((table, id) => Promise.resolve(mockDb[id])),
    create: jest.fn((table, data) => {
        if (data.id) mockDb[data.id] = data;
        return Promise.resolve();
    }),
    update: jest.fn((table, id, data) => {
        mockDb[id] = { ...mockDb[id], ...data };
        return Promise.resolve();
    }),
    getAll: jest.fn().mockResolvedValue([]),
  }
}));

// Mock Feedback Service
jest.mock('../../components/learning/services/feedbackService', () => ({
    generateBatchFeedback: jest.fn().mockResolvedValue({}),
}));

beforeAll(() => server.listen());
afterEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
});
afterAll(() => server.close());

jest.useFakeTimers();

// --- Navigation Test Setup ---
const Stack = createStackNavigator();
const SummaryScreen = () => <View testID="summary-page"><Text>Summary</Text></View>;

const TestNavigator = ({ sessionQuestionIds }: { sessionQuestionIds?: string[] }) => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Quiz"
        component={QuizScreen}
        initialParams={{ sessionQuestionIds }}
      />
      <Stack.Screen name="SessionSummary" component={SummaryScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

// --- Redux Store + Render Helper ---
let store: AppStore;
const renderWithProviders = (
  preloadedState?: PreloadedState<RootState>,
  sessionQuestionIds?: string[]
) => {
  store = configureStore({
    reducer: rootReducer,
    preloadedState,
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <PaperProvider>
          <TestNavigator sessionQuestionIds={sessionQuestionIds} />
        </PaperProvider>
      </Provider>
    ),
  };
};

describe('QuizScreen Acceptance Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockDb = {};
  });

  const initialLoggedInState = (uqds: UserQuestionData[] = []): PreloadedState<RootState> => {
    // Populate mock DB for thunks
    uqds.forEach(u => {
        const id = `${u.userId}-${u.questionId}`;
        mockDb[id] = {
            ...u,
            techniqueTransferScores: JSON.stringify(u.techniqueTransferScores),
            sm2: JSON.stringify(u.sm2)
        };
    });

    return {
        user: {
            currentUser: mockUser,
            loading: false,
            error: null,
        },
        learning: {
            categories: { ids: [], entities: {}, loading: 'idle' },
            questions: { ids: [], entities: {} },
            userQuestionData: {
                ids: uqds.map(u => `${u.userId}-${u.questionId}`),
                entities: uqds.reduce((acc, u) => ({
                    ...acc,
                    [`${u.userId}-${u.questionId}`]: JSON.parse(JSON.stringify(u))
                }), {})
            },
            recentQuizzes: { ids: [], entities: {} },
            learningSession: {
                session: null,
                recommendations: null,
                loading: 'idle',
            },
        },
    } as any;
  };

  test('renders header elements correctly', async () => {
    renderWithProviders(initialLoggedInState());

    await waitFor(() => expect(screen.getByTestId('quiz-header-title')).toBeOnTheScreen());

    expect(screen.getByTestId('back-button')).toBeOnTheScreen();
    expect(screen.getByText('Aptitude Test')).toBeOnTheScreen();
    expect(screen.getByTestId('timer-text')).toHaveTextContent('2:00');
  });

  test('renders title block and question count block correctly before start', async () => {
    renderWithProviders(initialLoggedInState(), ['1', '2', '3', '4']);

    await waitFor(() => expect(screen.getByTestId('quiz-type')).toBeOnTheScreen());
    expect(screen.getByText('ALGORITHMS')).toBeOnTheScreen();
    expect(screen.getByText('0 out of 4 questions')).toBeOnTheScreen();
    expect(screen.getByText('Ready to start the quiz?')).toBeOnTheScreen();
    expect(screen.getByText('Start Quiz')).toBeOnTheScreen();
  });

  test('starts countdown and updates question count when Start Quiz is pressed', async () => {
    renderWithProviders(initialLoggedInState(), ['1', '2', '3', '4']);

    await waitFor(() => expect(screen.getByText('Start Quiz')).toBeOnTheScreen());
    await user.press(screen.getByText('Start Quiz'));

    expect(screen.getByText(/Questions 1 of 1 \(Subset 1 of 4\)/)).toBeOnTheScreen();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId('timer-text')).toHaveTextContent('1:59');
  });

  test('option selection highlights the option and shows correct icon', async () => {
    renderWithProviders(initialLoggedInState(), ['1', '2', '3', '4']);
    await user.press(await screen.findByText('Start Quiz'));

    const option0 = screen.getByTestId('option-0');
    const option1 = screen.getByTestId('option-1');

    await user.press(option0);
    expect(screen.getByTestId('selected-icon-0')).toBeOnTheScreen();
    expect(screen.getByTestId('unselected-icon-1')).toBeOnTheScreen();

    await user.press(option1);
    expect(screen.getByTestId('unselected-icon-0')).toBeOnTheScreen();
    expect(screen.getByTestId('selected-icon-1')).toBeOnTheScreen();
  });

  test('navigates through questions and completes quiz', async () => {
    renderWithProviders(initialLoggedInState(), ['1', '2', '3', '4']);
    await user.press(await screen.findByText('Start Quiz'));

    // Question 1
    await user.press(screen.getByText(mockQuestions[0].options[4].text));
    await user.press(screen.getByTestId('next-button'));

    // Question 2
    expect(await screen.findByText(mockQuestions[1].question)).toBeOnTheScreen();
    expect(screen.getByText(/Questions 1 of 1 \(Subset 2 of 4\)/)).toBeOnTheScreen();
    await user.press(screen.getByText(mockQuestions[1].options[4].text));
    await user.press(screen.getByTestId('next-button'));

    // Question 3
    await waitFor(() => expect(screen.getByText(/Subset 3 of 4/)).toBeOnTheScreen());
    await user.press(screen.getByTestId('next-button'));

    // Question 4
    await waitFor(() => expect(screen.getByText(/Subset 4 of 4/)).toBeOnTheScreen());
    await user.press(screen.getByTestId('next-button'));

    expect(await screen.findByTestId('summary-page')).toBeOnTheScreen();
  });

  test('back button goes to previous question', async () => {
    // 8 questions -> subsetSize 2
    renderWithProviders(initialLoggedInState(), ['1', '2', '3', '4', '5', '6', '7', '8']);
    await user.press(await screen.findByText('Start Quiz'));

    await user.press(screen.getByText(mockQuestions[0].options[0].text));
    await user.press(screen.getByTestId('next-button'));

    expect(await screen.findByText(mockQuestions[1].question)).toBeOnTheScreen();
    await user.press(screen.getByTestId('back-button'));

    expect(screen.getByText(mockQuestions[0].question)).toBeOnTheScreen();
    expect(screen.getByTestId('selected-icon-0')).toBeOnTheScreen();
  });

  test('back button triggers exit modal on first question', async () => {
    renderWithProviders(initialLoggedInState());
    await waitFor(() => expect(screen.getByTestId('back-button')).toBeOnTheScreen());
    await user.press(screen.getByTestId('back-button'));

    expect(screen.getByTestId('exit-modal')).toBeOnTheScreen();
    await user.press(screen.getByText('Cancel'));
    expect(screen.queryByTestId('exit-modal')).not.toBeOnTheScreen();
  });

  test('progress bar updates correctly', async () => {
    renderWithProviders(initialLoggedInState(), ['1', '2', '3', '4']);
    const progressBarFill = await screen.findByTestId('progress-bar-fill');

    expect(progressBarFill.props.style).toContainEqual(expect.objectContaining({ width: '0%' }));
    await user.press(screen.getByText('Start Quiz'));
    expect(progressBarFill.props.style).toContainEqual(expect.objectContaining({ width: '25%' }));

    await user.press(screen.getByText(mockQuestions[0].options[0].text));
    await user.press(screen.getByTestId('next-button'));

    expect(await screen.findByText(/Subset 2 of 4/)).toBeOnTheScreen();
    expect(progressBarFill.props.style).toContainEqual(expect.objectContaining({ width: '50%' }));
  });

  test('SM-2 Spaced Repetition and Metadata updates', async () => {
    renderWithProviders(initialLoggedInState([]), ['1']);
    await user.press(await screen.findByText('Start Quiz'));

    await user.press(screen.getByText('Use a hash map')); // Correct
    await user.press(screen.getByTestId('next-button'));

    const state = store.getState().learning.userQuestionData.entities['user1-1'];
    expect(state?.totalAttempts).toBe(1);
    expect(state?.correctAttempts).toBe(1);
    expect(state?.sm2.repetitionCount).toBe(1);
    expect(state?.sm2.interval).toBe(1);
  });

  test('Top-K Recommendations consistency', async () => {
    const q1 = new UserQuestionData('user1', '1'); q1.recallStrength = 0.2;
    const q2 = new UserQuestionData('user1', '2'); q2.recallStrength = 0.5;
    const q3 = new UserQuestionData('user1', '3'); q3.recallStrength = 0.9;
    const q4 = new UserQuestionData('user1', '4'); q4.recallStrength = 0.0;

    // Force 5-20 to have high mastery so 1-4 are recommended first
    const manyUqds = [q1, q2, q3, q4];
    for (let i = 5; i <= 20; i++) {
        const q = new UserQuestionData('user1', String(i));
        q.recallStrength = 1.0;
        manyUqds.push(q);
    }

    renderWithProviders(initialLoggedInState(manyUqds));
    await waitFor(() => expect(store.getState().learning.learningSession.session).not.toBeNull());
    const session = store.getState().learning.learningSession.session;

    expect(session?.questionIds[0]).toBe('4'); // Mastery 0.0 -> Score 1.0
    expect(session?.questionIds[1]).toBe('1'); // Mastery 0.2 -> Score 0.81
  });

  test('Previous session feedback displayed if last session was yesterday or older', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const preloadedState = initialLoggedInState([]);
    preloadedState.learning.recentQuizzes = {
        ids: ['old-session'],
        entities: {
            'old-session': {
                id: 'old-session',
                score: 5,
                totalQuestions: 10,
                completedAt: yesterday.toISOString(),
                strengths: ['Algorithms'],
                weaknesses: ['Data Structures']
            }
        }
    } as any;

    renderWithProviders(preloadedState, ['1']);

    expect(await screen.findByTestId('prev-feedback-title')).toBeOnTheScreen();
    await user.press(screen.getByTestId('continue-to-quiz'));
    expect(screen.queryByTestId('prev-feedback-title')).not.toBeOnTheScreen();
  });
});
