import * as React from 'react';
import { Text, View } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/native';
import { render, screen, userEvent, act, waitFor, fireEvent, within } from '@testing-library/react-native';

import { configureStore } from '@reduxjs/toolkit';
import type { PreloadedState } from '@reduxjs/toolkit';

import rootReducer from '../../src/store/rootReducer';
import { initialGlobalEngagement } from '../../src/components/engagement/store/primitives/globalEngagement';
import { recentQuizzesAdapter } from '../../src/components/learning/store/recentQuizzes.slice';
import IndexScreen from '../../src/screens/index';
import { AppStore, RootState } from '../../src/store';

// --- MSW Server Setup ---
const mockUser = { id: '1', fullName: 'Test User', username: 'testuser', email: 'test@example.com' };
const server = setupServer(
  http.get('http://localhost:3000/api/user/profile-summary', () => {
    return HttpResponse.json({
      user: mockUser,
      stats: { xp: 100, rank: 1 },
    });
  }),
  http.get('http://localhost:3000/api/engagement/score', () => {
    return HttpResponse.json({ score: 1500 });
  }),
  http.get('http://localhost:3000/api/engagement/weekly-king', () => {
    return HttpResponse.json({ user: { name: 'Weekly King' } });
  }),
  http.get('http://localhost:3000/api/engagement/daily-quiz', () => {
    return HttpResponse.json({ available: true });
  }),
  http.get('http://localhost:3000/api/learning/featured-categories', () => {
    return HttpResponse.json([{ id: '1', name: 'Category 1' }]);
  }),
  http.get('http://localhost:3000/api/learning/recent-quizzes', () => {
    return HttpResponse.json([{ id: '1', name: 'Recent Quiz 1' }]);
  }),
  http.get('http://localhost:3000/api/engagement/weekly-king/leaderboard', () =>
    HttpResponse.json([{ id: 'w1', name: 'Weekly King', score: 200 }])
  ),
  http.post('http://localhost:3000/api/auth/logout', () => {
    return HttpResponse.json({ message: 'Logged out' });
  }),
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});
afterAll(() => server.close());

jest.mock('../../src/components/learning/services/feedbackService', () => ({
  __esModule: true,
  default: { getFeedback: jest.fn(async () => ({ feedback: 'Mock feedback' })) },
  getFeedback: jest.fn(async () => ({ feedback: 'Mock feedback' })),
}));

jest.mock('../../src/components/learning/services/learningService', () => ({
    startNewSession: jest.fn().mockResolvedValue({ questionIds: ['1', '2', '3'] }),
    getFeaturedCategories: jest.fn().mockResolvedValue([]),
}));
process.env.GEMINI_API_KEY = 'test';

jest.useFakeTimers();
jest.spyOn(global, 'requestAnimationFrame').mockImplementation(cb => setTimeout(cb, 0));


// --- Navigation Test Setup ---
const Stack = createStackNavigator();
const AuthScreen = () => <View><Text>Auth Screen</Text></View>;
const LeaderboardScreen = () => <View testID="weeklyLeaderboard"><Text>LB</Text></View>;
const QuizScreen = () => <View testID="quizPage"><Text>Quiz</Text></View>;
const HistoryScreen = () => <View testID="historyPage"><Text>History</Text></View>;
const DailyQuizScreen = () => <View testID="dailyQuizPage"><Text>Daily Quiz</Text></View>;


const TestNavigator = ({ initialRouteName = 'Index' }) => (
  <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Index" component={IndexScreen} />
    <Stack.Screen name="Auth" component={AuthScreen} />
    <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
    <Stack.Screen name="Quiz" component={QuizScreen} />
    <Stack.Screen name="History" component={HistoryScreen} />
    <Stack.Screen name="DailyQuiz" component={DailyQuizScreen} />
  </Stack.Navigator>
);

// --- Redux Store + Render Helper ---
let store: AppStore;
const renderWithProviders = (
  preloadedState?: PreloadedState<RootState>,
  initialRouteName: 'Index' | 'Auth' = 'Index'
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
          <NavigationContainer>
            <TestNavigator initialRouteName={initialRouteName} />
          </NavigationContainer>
        </PaperProvider>
      </Provider>
    ),
  };
};

const renderIndex = async (preloadedState: PreloadedState<RootState>) => {
  const utils = renderWithProviders(preloadedState);
  // wait for UI to fetch and render (profile summary etc.)
  await waitFor(() => expect(screen.getByText('Hello, Test User')).toBeTruthy(), { timeout: 3000 });
  // allow animations to settle
  act(() => { jest.runAllTimers(); });
  return utils;
};


describe('IndexScreen E2E', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  });

  describe('when user is not logged in', () => {
    test('redirects to auth screen', async () => {
      const preloadedState: PreloadedState<RootState> = {
        user: { currentUser: null, loading: false, error: null },
        engagement: {
          userEngagement: {},
          notifications: [],
          globalEngagement: {
            engagement: initialGlobalEngagement,
            loading: false,
            error: null,
          },
        },
        learning: {
          categories: { ids: [], entities: {}, loading: 'idle' },
          questions: { ids: [], entities: {} },
          userQuestionData: { ids: [], entities: {} },
          learningSession: {
            questions: [],
            currentQuestionIndex: 0,
            score: 0,
            isFinished: false,
          },
          recentQuizzes: recentQuizzesAdapter.getInitialState(),
        },
      };
      const { queryByText } = renderWithProviders(preloadedState);
      // more robust: assert Auth screen exists
      await waitFor(() => expect(queryByText('Auth Screen')).toBeTruthy());
    });
  });

  describe('when user is logged in', () => {
    const preloadedState: PreloadedState<RootState> = {
      user: {
        currentUser: { ...mockUser, xp: 100 },
        loading: false,
        error: null,
      },
      engagement: {
        userEngagement: {},
        notifications: [],
        globalEngagement: {
          engagement: {
            ...initialGlobalEngagement,
            weeklyKingOfQuiz: { name: 'Weekly King', avatar: '', score: 0 },
            dailyQuiz: {
              title: 'Daily Quiz',
              description: 'Join a quiz to win diamonds',
              quizId: 'quiz1',
            },
          },
          loading: false,
          error: null,
        },
      },
      learning: {
        categories: { ids: [], entities: {}, loading: 'idle' },
        questions: { ids: [], entities: {} },
        userQuestionData: { ids: [], entities: {} },
        recentQuizzes: {
            ids: ['1'],
            entities: {
                '1': { id: '1', name: 'Recent Quiz 1', score: 8, totalQuestions: 10, completedAt: new Date().toISOString() }
            },
        },
        learningSession: {
          questions: [],
          currentQuestionIndex: 0,
          score: 0,
          isFinished: false,
        },
      },
    };

    test('greeting on top-right, xp on top-left, avatar visible', async () => {
      await renderIndex(preloadedState);
      const topLeft = screen.getByTestId('topLeft');
      const topRight = screen.getByTestId('topRight');
      expect(topLeft).toBeTruthy();
      expect(topRight).toBeTruthy();
      expect(within(topRight).getByText('Hello, Test User')).toBeTruthy();
      expect(within(topRight).getByTestId('userAvatar')).toBeTruthy();
    });

    test('weekly king opens leaderboard on press', async () => {
      await renderIndex(preloadedState);
      const weekly = await screen.findByTestId('weeklyKing');
      fireEvent.press(weekly);
      // Leaderboard screen should be shown (ensure your TestNavigator has a Leaderboard screen)
      expect(await screen.findByTestId('weeklyLeaderboard')).toBeTruthy();
    });

    test('three banners present and start quiz opens quiz screen', async () => {
      await renderIndex(preloadedState);
      expect(screen.getByTestId('banner-start-quiz')).toBeTruthy();
      expect(screen.getByTestId('banner-leaderboard')).toBeTruthy();
      expect(screen.getByTestId('banner-achievement')).toBeTruthy();

      const startQuizButton = screen.getByTestId('banner-start-quiz');
      fireEvent.press(startQuizButton);
      expect(await screen.findByTestId('quizPage')).toBeTruthy();
    });

    test('daily quiz join opens quiz', async () => {
      await renderIndex(preloadedState);
      const join = screen.getByTestId('dailyQuizJoin');
      fireEvent.press(join);
      expect(await screen.findByTestId('dailyQuizPage')).toBeTruthy();
    });

    test('recent quiz click opens history page', async () => {
      await renderIndex(preloadedState);
      const recent = await screen.findByTestId('recent-1');
      fireEvent.press(recent);
      expect(await screen.findByTestId('historyPage')).toBeTruthy();
    });

    test('bottom nav displays Home/Bookmark/Profile', async () => {
      await renderIndex(preloadedState);
      expect(screen.getByLabelText('Home')).toBeTruthy();
      expect(screen.getByLabelText('Bookmark')).toBeTruthy();
      expect(screen.getByLabelText('Profile')).toBeTruthy();
    });

    test('handles API failure for profile summary', async () => {
      server.use(
        http.get('http://localhost:3000/api/user/profile-summary', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      renderWithProviders(preloadedState);

      // The user should be logged out and redirected to the Auth screen.
      await waitFor(() => {
        expect(screen.getByText('Auth Screen')).toBeTruthy();
      });
    });
  });
});