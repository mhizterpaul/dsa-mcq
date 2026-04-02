// @ts-ignore
global.IS_REACT_ACT_ENVIRONMENT = true;

import * as React from 'react';
import { View, Text } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, userEvent, waitFor, within, act } from '@testing-library/react-native';

import { configureStore } from '@reduxjs/toolkit';
import type { PreloadedState } from '@reduxjs/toolkit';

import rootReducer from '../../store/rootReducer';
import BookmarkScreen from '../../screens/BookmarkScreen';
import { AppStore, RootState } from '../../store';
import { toggleBookmark } from '../../components/user/store/userProfile.slice';

// --- Mock Data ---
const mockQuestions = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    question: i === 0 ? "What does UI stand for in the context of design?" :
              i === 1 ? "Which aspect of UI design focuses on visual elements?" :
              `Question ${i + 1}`,
    category: "design",
    options: [
      { text: "User Integration", isCorrect: false },
      { text: "User Interface", isCorrect: true },
      { text: "Universal Interaction", isCorrect: false },
      { text: "User Involvement", isCorrect: false },
    ],
}));

// --- MSW Server Setup ---
const server = setupServer(
  http.post('http://localhost:3000/api/learning/questions', async ({ request }) => {
    const body = await request.json() as { ids: any[] };
    const ids = body.ids.map(id => Number(id));
    const filtered = mockQuestions.filter(q => ids.includes(q.id));
    return HttpResponse.json(filtered);
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
const mockGoBack = jest.fn();

const renderWithProviders = async (
  preloadedState?: PreloadedState<RootState>
) => {
  store = configureStore({
    reducer: rootReducer,
    preloadedState,
  });

  const navigationMock = { goBack: mockGoBack, navigate: jest.fn(), canGoBack: () => true };

  const renderResult = await render(
    <Provider store={store}>
      <PaperProvider>
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Bookmark">
                    {(props) => <BookmarkScreen {...props} navigation={{...props.navigation, ...navigationMock} as any} />}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </Provider>
  );

  // allow animations to settle
  await act(async () => { jest.runAllTimers(); });

  return {
    store,
    ...renderResult,
  };
};

let store: AppStore;

const getInitialState = (bookmarks: any[] = []): PreloadedState<RootState> => {
    return {
        user: {
            currentUser: { id: 'user1', fullName: 'Test User', email: 'test@example.com' },
            loading: false,
            error: null,
        },
        profile: {
            profile: {
                userId: 'user1',
                bookmarks,
                goals: [],
                totalXP: 0,
                correctAnswers: 0,
                completedQuizzes: 0,
                globalRanking: 0,
                highestAchievement: null,
                settings: { theme: 'system', notificationsEnabled: true, language: 'en', soundEffects: true }
            }
        }
    } as any;
};

const givenBookmarks = async (...bookmarks: any[]) => await renderWithProviders(getInitialState(bookmarks));

describe('BookmarkScreen Acceptance Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockGoBack.mockClear();
  });

  test('renders header and title correctly', async () => {
    await givenBookmarks();
    expect(screen.getByTestId('back-button')).toBeOnTheScreen();
    expect(screen.getByTestId('screen-title')).toHaveTextContent('Bookmarks');
  });

  test('back button calls navigation.goBack()', async () => {
    await givenBookmarks();
    await user.press(screen.getByTestId('back-button'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  test('displays bookmarked items', async () => {
    await givenBookmarks(
        { questionId: '1', mostRecentAnswer: 'User Interface', isCorrect: true, difficultyLevel: 'easy', feedback: null },
        { questionId: '2', mostRecentAnswer: 'Typography', isCorrect: true, difficultyLevel: 'easy', feedback: null }
    );

    expect(await screen.findByText(/What does UI stand for/)).toBeOnTheScreen();
    expect(screen.getByText(/Which aspect of UI design/)).toBeOnTheScreen();
  });

  test('shows empty state when no bookmarks exist', async () => {
    await givenBookmarks();
    expect(await screen.findByText(/No bookmarks yet/)).toBeOnTheScreen();
  });

  test('searching bookmarks filters the list', async () => {
    await givenBookmarks(
        { questionId: '1', mostRecentAnswer: 'User Interface', isCorrect: true, difficultyLevel: 'easy', feedback: null },
        { questionId: '2', mostRecentAnswer: 'Typography', isCorrect: true, difficultyLevel: 'easy', feedback: null }
    );

    await screen.findByText(/What does UI stand for/);

    const searchBar = screen.getByTestId('search-bar');
    await user.type(searchBar, 'aspect');

    await waitFor(() => {
        expect(screen.queryByText(/What does UI stand for/)).not.toBeOnTheScreen();
    });
    expect(screen.getByText(/Which aspect of UI design/)).toBeOnTheScreen();
  });

  test('clearing search restores full bookmark list', async () => {
    await givenBookmarks(
        { questionId: '1', mostRecentAnswer: 'User Interface', isCorrect: true, difficultyLevel: 'easy', feedback: null },
        { questionId: '2', mostRecentAnswer: 'Typography', isCorrect: true, difficultyLevel: 'easy', feedback: null }
    );

    await screen.findByText(/What does UI stand for/);
    const searchBar = screen.getByTestId('search-bar');

    await user.type(searchBar, 'aspect');
    await waitFor(() => expect(screen.queryByText(/What does UI stand for/)).not.toBeOnTheScreen());

    await user.clear(searchBar);
    expect(await screen.findByText(/What does UI stand for/)).toBeOnTheScreen();
    expect(screen.getByText(/Which aspect of UI design/)).toBeOnTheScreen();
  });

  test('toggling expansion shows question details and last selection', async () => {
    await givenBookmarks(
        { questionId: '1', mostRecentAnswer: 'User Interface', isCorrect: true, difficultyLevel: 'easy', feedback: null }
    );

    const item = await screen.findByTestId('bookmark-item-1');
    expect(screen.queryByTestId('expanded-view-1')).not.toBeOnTheScreen();

    await user.press(item);
    expect(await screen.findByTestId('expanded-view-1')).toBeOnTheScreen();
    expect(screen.getByText('User Integration')).toBeOnTheScreen();
    expect(screen.getByText('User Interface')).toBeOnTheScreen();

    const selectedOption = screen.getByTestId('option-1-1');
    expect(within(selectedOption).getByTestId('status-icon')).toBeOnTheScreen();
  });

  test('expanding one bookmark does not expand others', async () => {
    await givenBookmarks(
        { questionId: '1', mostRecentAnswer: 'User Interface', isCorrect: true, difficultyLevel: 'easy', feedback: null },
        { questionId: '2', mostRecentAnswer: 'Typography', isCorrect: true, difficultyLevel: 'easy', feedback: null }
    );

    await user.press(await screen.findByTestId('bookmark-item-1'));
    expect(await screen.findByTestId('expanded-view-1')).toBeOnTheScreen();
    expect(screen.queryByTestId('expanded-view-2')).not.toBeOnTheScreen();
  });

  test('tapping expanded item collapses it', async () => {
    await givenBookmarks(
        { questionId: '1', mostRecentAnswer: 'User Interface', isCorrect: true, difficultyLevel: 'easy', feedback: null }
    );

    const item = await screen.findByTestId('bookmark-item-1');
    await user.press(item);
    expect(await screen.findByTestId('expanded-view-1')).toBeOnTheScreen();

    await user.press(item);
    await waitFor(() => expect(screen.queryByTestId('expanded-view-1')).not.toBeOnTheScreen());
  });

  test('removes item if unbookmarked while expanded', async () => {
    const bookmark = { questionId: '1', mostRecentAnswer: 'User Interface', isCorrect: true, difficultyLevel: 'easy', feedback: null };
    await givenBookmarks(bookmark);

    await user.press(await screen.findByTestId('bookmark-item-1'));
    expect(await screen.findByTestId('expanded-view-1')).toBeOnTheScreen();

    await act(async () => {
        store.dispatch(toggleBookmark(bookmark as any));
    });

    await waitFor(() => expect(screen.queryByTestId('bookmark-item-1')).not.toBeOnTheScreen());
  });

  test('handles API failure gracefully', async () => {
    server.use(
      http.post('http://localhost:3000/api/learning/questions', () => HttpResponse.error())
    );

    await givenBookmarks({ questionId: '1', mostRecentAnswer: 'User Interface', isCorrect: true, difficultyLevel: 'easy', feedback: null });

    expect(await screen.findByText(/Failed to load bookmarks/)).toBeOnTheScreen();
  });

  test('bookmark list updates when store changes', async () => {
    await givenBookmarks(
        { questionId: '1', mostRecentAnswer: 'User Interface', isCorrect: true, difficultyLevel: 'easy', feedback: null }
    );

    await screen.findByText(/What does UI stand for/);

    const newBookmark = {
      questionId: '2',
      mostRecentAnswer: 'Typography',
      isCorrect: true,
      difficultyLevel: 'easy',
      feedback: null
    };

    await act(async () => {
        store.dispatch(toggleBookmark(newBookmark as any));
    });

    expect(await screen.findByText(/Which aspect of UI design/)).toBeOnTheScreen();
  });

  test('renders large bookmark list without crashing', async () => {
    const bookmarks = Array.from({ length: 50 }, (_, i) => ({
        questionId: String(i + 1),
        mostRecentAnswer: 'User Interface',
        isCorrect: true,
        difficultyLevel: 'easy',
        feedback: null
    }));

    await givenBookmarks(...bookmarks);
    expect(await screen.findByTestId('bookmark-item-1')).toBeOnTheScreen();
    expect(screen.getByText(/Bookmarks \(50\)/)).toBeOnTheScreen();
  });
});
