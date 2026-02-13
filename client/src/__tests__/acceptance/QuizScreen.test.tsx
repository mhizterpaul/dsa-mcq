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
import learningService from '../../components/learning/services/learningService';

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
];

const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };

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

const TestNavigator = ({ sessionQuestionIds }: { sessionQuestionIds: string[] }) => (
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
  sessionQuestionIds: string[] = ['1', '2']
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

describe('QuizScreen E2E', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  });

  const initialLoggedInState: PreloadedState<RootState> = {
    user: {
      currentUser: mockUser,
      loading: false,
      error: null,
    },
    learning: {
      categories: { ids: [], entities: {}, loading: 'idle' },
      questions: { ids: [], entities: {} },
      userQuestionData: { ids: [], entities: {} },
      recentQuizzes: { ids: [], entities: {} },
      learningSession: {
        session: null,
        recommendations: null,
        loading: 'idle',
      },
    },
  } as any;

  test('renders header elements correctly', async () => {
    renderWithProviders(initialLoggedInState);

    await waitFor(() => expect(screen.getByTestId('quiz-title')).toBeOnTheScreen());

    expect(screen.getByTestId('back-button')).toBeOnTheScreen();
    expect(screen.getByText('Aptitude Test')).toBeOnTheScreen();
    expect(screen.getByTestId('timer-text')).toHaveTextContent('2:00');
  });

  test('renders initial state before quiz starts', async () => {
    renderWithProviders(initialLoggedInState);

    await waitFor(() => expect(screen.getByTestId('question-count')).toBeOnTheScreen());

    expect(screen.getByText('0 out of 2 questions')).toBeOnTheScreen();
    expect(screen.getByText('Ready to start the quiz?')).toBeOnTheScreen();
    expect(screen.getByText('Start Quiz')).toBeOnTheScreen();
  });

  test('starts countdown when Start Quiz is pressed', async () => {
    renderWithProviders(initialLoggedInState);

    await waitFor(() => expect(screen.getByText('Start Quiz')).toBeOnTheScreen());

    await user.press(screen.getByText('Start Quiz'));

    expect(screen.getByText('Questions 1 of 2')).toBeOnTheScreen();

    // Advance timers by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('timer-text')).toHaveTextContent('1:59');
  });

  test('option selection highlights the option and shows correct icon', async () => {
    renderWithProviders(initialLoggedInState);

    await user.press(await screen.findByText('Start Quiz'));

    const option0 = screen.getByTestId('option-0');
    const option1 = screen.getByTestId('option-1');

    await user.press(option0);

    // Check if option 0 is selected
    expect(screen.getByTestId('selected-icon-0')).toBeOnTheScreen();
    expect(screen.getByTestId('unselected-icon-1')).toBeOnTheScreen();

    await user.press(option1);

    // Check if option 1 is selected and 0 is unselected
    expect(screen.getByTestId('unselected-icon-0')).toBeOnTheScreen();
    expect(screen.getByTestId('selected-icon-1')).toBeOnTheScreen();
  });

  test('navigates through questions and completes quiz', async () => {
    renderWithProviders(initialLoggedInState);

    await user.press(await screen.findByText('Start Quiz'));

    // Question 1
    expect(screen.getByText(mockQuestions[0].question)).toBeOnTheScreen();
    await user.press(screen.getByText(mockQuestions[0].options[4].text)); // Select correct
    await user.press(screen.getByText('Next →'));

    // Question 2
    expect(await screen.findByText(mockQuestions[1].question)).toBeOnTheScreen();
    expect(screen.getByText('Questions 2 of 2')).toBeOnTheScreen();
    await user.press(screen.getByText(mockQuestions[1].options[4].text)); // Select correct
    await user.press(screen.getByText('Finish'));

    // Summary Screen
    expect(await screen.findByTestId('summary-page')).toBeOnTheScreen();
  });

  test('back button goes to previous question', async () => {
    renderWithProviders(initialLoggedInState);

    await user.press(await screen.findByText('Start Quiz'));

    // Question 1
    await user.press(screen.getByText(mockQuestions[0].options[0].text));
    await user.press(screen.getByText('Next →'));

    // Question 2
    expect(await screen.findByText(mockQuestions[1].question)).toBeOnTheScreen();

    await user.press(screen.getByTestId('back-button'));

    // Back to Question 1
    expect(screen.getByText(mockQuestions[0].question)).toBeOnTheScreen();
    // Option should still be selected
    expect(screen.getByTestId('selected-icon-0')).toBeOnTheScreen();
  });

  test('back button triggers exit modal on first question', async () => {
    renderWithProviders(initialLoggedInState);

    await waitFor(() => expect(screen.getByTestId('back-button')).toBeOnTheScreen());

    await user.press(screen.getByTestId('back-button'));

    expect(screen.getByTestId('exit-modal')).toBeOnTheScreen();
    expect(screen.getByText('Exit Quiz?')).toBeOnTheScreen();

    await user.press(screen.getByText('Cancel'));
    expect(screen.queryByTestId('exit-modal')).not.toBeOnTheScreen();
  });

  test('progress bar and title block update correctly', async () => {
    renderWithProviders(initialLoggedInState);

    await waitFor(() => expect(screen.getByTestId('question-count')).toBeOnTheScreen());

    // Before start
    expect(screen.getByText('0 out of 2 questions')).toBeOnTheScreen();
    const progressBarFill = screen.getByTestId('progress-bar-fill');
    expect(progressBarFill.props.style).toContainEqual(expect.objectContaining({ width: '0%' }));

    await user.press(screen.getByText('Start Quiz'));

    // Question 1
    expect(screen.getByText('Questions 1 of 2')).toBeOnTheScreen();
    expect(progressBarFill.props.style).toContainEqual(expect.objectContaining({ width: '50%' }));

    await user.press(screen.getByText(mockQuestions[0].options[0].text));
    await user.press(screen.getByText('Next →'));

    // Question 2
    expect(await screen.findByText('Questions 2 of 2')).toBeOnTheScreen();
    expect(progressBarFill.props.style).toContainEqual(expect.objectContaining({ width: '100%' }));
  });
});
