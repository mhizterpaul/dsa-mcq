import * as React from 'react';
import { View, Text } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/native';
import { render, screen, userEvent, waitFor, fireEvent, within, act } from '@testing-library/react-native';

import { configureStore } from '@reduxjs/toolkit';
import type { PreloadedState } from '@reduxjs/toolkit';

import rootReducer from '../../store/rootReducer';
import BookmarkScreen from '../../screens/BookmarkScreen';
import { AppStore, RootState } from '../../store';
import { UserProfile, QuestionResponse } from '../../components/user/store/primitives/UserProfile';
import { toggleBookmark } from '../../components/user/store/userProfile.slice';

jest.mock('react-native-vector-icons/Feather', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

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
    const { ids } = (await request.json()) as { ids: number[] };
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

// --- Navigation Test Setup ---
const Stack = createStackNavigator();

const TestNavigator = () => (
  <NavigationContainer
    initialState={{
      index: 1,
      routes: [
        { name: 'Home' },
        { name: 'Bookmark' },
      ],
    }}
  >
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={() => <View><Text testID="home-screen">Home</Text></View>} />
      <Stack.Screen name="Bookmark" component={BookmarkScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

// --- Redux Store + Render Helper ---
let store: AppStore;
const renderWithProviders = (
  preloadedState?: PreloadedState<RootState>
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
          <TestNavigator />
        </PaperProvider>
      </Provider>
    ),
  };
};

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

// --- Scenario Builder ---
const givenBookmarks = (...bookmarks: any[]) => renderWithProviders(getInitialState(bookmarks));

describe('BookmarkScreen Acceptance Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  test('renders header and title correctly', async () => {
    givenBookmarks();
    expect(screen.getByTestId('back-button')).toBeOnTheScreen();
    expect(screen.getByTestId('screen-title')).toHaveTextContent('Bookmarks');
  });

  test('back button returns user to previous screen', async () => {
    givenBookmarks();

    await screen.findByTestId('screen-title');

    fireEvent.press(screen.getByTestId('back-button'));

    await waitFor(() =>
      expect(screen.getByTestId('home-screen')).toBeOnTheScreen()
    );
  });

  test('back button pops only one level', async () => {
    givenBookmarks();

    await screen.findByTestId('screen-title');

    fireEvent.press(screen.getByTestId('back-button'));

    await screen.findByTestId('home-screen');

    // Ensure we did not navigate further back
    expect(screen.queryByTestId('screen-title')).not.toBeOnTheScreen();
  });

  test('back button does not crash if pressed twice quickly', async () => {
    givenBookmarks();

    await screen.findByTestId('screen-title');

    const backButton = screen.getByTestId('back-button');
    fireEvent.press(backButton);
    // Second press might happen while unmounting, we just want to ensure no crash
    try {
        fireEvent.press(backButton);
    } catch (e) {
        // Ignore if already unmounted
    }

    await screen.findByTestId('home-screen');
  });

  test('displays bookmarked items', async () => {
    givenBookmarks(
        { questionId: '1', mostRecentAnswer: 'User Interface', isCorrect: true, difficultyLevel: 'easy', feedback: null },
        { questionId: '2', mostRecentAnswer: 'Typography', isCorrect: true, difficultyLevel: 'easy', feedback: null }
    );

    expect(await screen.findByText(/What does UI stand for/)).toBeOnTheScreen();
    expect(screen.getByText(/Which aspect of UI design/)).toBeOnTheScreen();
  });

  test('shows empty state when no bookmarks exist', async () => {
    givenBookmarks();

    expect(await screen.findByText(/no bookmarks yet/i)).toBeOnTheScreen();
  });

  test('searching bookmarks filters the list', async () => {
    givenBookmarks(
        { questionId: '1', mostRecentAnswer: 'User Interface', isCorrect: true, difficultyLevel: 'easy', feedback: null },
        { questionId: '2', mostRecentAnswer: 'Typography', isCorrect: true, difficultyLevel: 'easy', feedback: null }
    );

    await screen.findByText(/What does UI stand for/);

    const searchBar = screen.getByTestId('search-bar');
    await user.type(searchBar, 'aspect');

    expect(screen.queryByText(/What does UI stand for/)).not.toBeOnTheScreen();
    expect(screen.getByText(/Which aspect of UI design/)).toBeOnTheScreen();
  });

  test('clearing search restores full bookmark list', async () => {
    givenBookmarks(
        { questionId: '1', mostRecentAnswer: 'User Interface', isCorrect: true, difficultyLevel: 'easy', feedback: null },
        { questionId: '2', mostRecentAnswer: 'Typography', isCorrect: true, difficultyLevel: 'easy', feedback: null }
    );

    await screen.findByText(/What does UI stand for/);

    const searchBar = screen.getByTestId('search-bar');

    await user.type(searchBar, 'aspect');

    expect(screen.queryByText(/What does UI stand for/)).not.toBeOnTheScreen();

    await user.clear(searchBar);

    expect(await screen.findByText(/What does UI stand for/)).toBeOnTheScreen();
    expect(screen.getByText(/Which aspect of UI design/)).toBeOnTheScreen();
  });

  test('toggling expansion shows question details and last selection', async () => {
    givenBookmarks(
        { questionId: '1', mostRecentAnswer: 'User Interface', isCorrect: true, difficultyLevel: 'easy', feedback: null }
    );

    await screen.findByTestId('bookmark-item-1');

    // Not expanded yet
    expect(screen.queryByTestId('expanded-view-1')).not.toBeOnTheScreen();

    // Tap to expand
    await user.press(screen.getByTestId('bookmark-item-1'));

    expect(await screen.findByTestId('expanded-view-1')).toBeOnTheScreen();
    expect(screen.getByText('User Integration')).toBeOnTheScreen();
    expect(screen.getByText('User Interface')).toBeOnTheScreen();

    const selectedOption = screen.getByTestId('option-1-1'); // User Interface is index 1
    expect(within(selectedOption).getByTestId('status-icon')).toBeOnTheScreen();
  });

  test('expanding one bookmark does not expand others', async () => {
    givenBookmarks(
        { questionId: '1', mostRecentAnswer: 'User Interface', isCorrect: true, difficultyLevel: 'easy', feedback: null },
        { questionId: '2', mostRecentAnswer: 'Typography', isCorrect: true, difficultyLevel: 'easy', feedback: null }
    );

    await screen.findByTestId('bookmark-item-1');

    await user.press(screen.getByTestId('bookmark-item-1'));

    expect(await screen.findByTestId('expanded-view-1')).toBeOnTheScreen();
    expect(screen.queryByTestId('expanded-view-2')).not.toBeOnTheScreen();
  });

  test('tapping expanded item collapses it', async () => {
    givenBookmarks(
        { questionId: '1', mostRecentAnswer: 'User Interface', isCorrect: true, difficultyLevel: 'easy', feedback: null }
    );

    await screen.findByTestId('bookmark-item-1');

    await user.press(screen.getByTestId('bookmark-item-1'));
    expect(await screen.findByTestId('expanded-view-1')).toBeOnTheScreen();

    await user.press(screen.getByTestId('bookmark-item-1'));

    await waitFor(() =>
      expect(screen.queryByTestId('expanded-view-1')).not.toBeOnTheScreen()
    );
  });

  test('expanded view retains user last selected option', async () => {
    givenBookmarks(
        { questionId: '1', mostRecentAnswer: 'User Interface', isCorrect: true, difficultyLevel: 'easy', feedback: null }
    );

    await screen.findByTestId('bookmark-item-1');

    await user.press(screen.getByTestId('bookmark-item-1'));

    const selectedOption = await screen.findByTestId('option-1-1');
    expect(within(selectedOption).getByTestId('status-icon')).toBeOnTheScreen();
  });

  test('removes item if unbookmarked while expanded', async () => {
    const bookmark = { questionId: '1', mostRecentAnswer: 'User Interface', isCorrect: true, difficultyLevel: 'easy', feedback: null };
    givenBookmarks(bookmark);

    await screen.findByTestId('bookmark-item-1');

    await user.press(screen.getByTestId('bookmark-item-1'));
    expect(await screen.findByTestId('expanded-view-1')).toBeOnTheScreen();

    act(() => {
        store.dispatch(toggleBookmark(bookmark as any));
    });

    await waitFor(() =>
      expect(screen.queryByTestId('bookmark-item-1')).not.toBeOnTheScreen()
    );
  });

  test('three dots menu is present on collapsed view', async () => {
    givenBookmarks(
        { questionId: '1', mostRecentAnswer: 'User Interface', isCorrect: true, difficultyLevel: 'easy', feedback: null }
    );

    await screen.findByTestId('three-dots-1');
  });

  test('handles API failure gracefully', async () => {
    server.use(
      http.post('http://localhost:3000/api/learning/questions', () =>
        HttpResponse.error()
      )
    );

    givenBookmarks(
        { questionId: '1', mostRecentAnswer: 'User Interface', isCorrect: true, difficultyLevel: 'easy', feedback: null }
    );

    expect(await screen.findByText(/failed to load bookmarks/i)).toBeOnTheScreen();
    expect(screen.queryByTestId('bookmark-item-1')).not.toBeOnTheScreen();
  });

  test('bookmark list updates when store changes', async () => {
    givenBookmarks(
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

    act(() => {
        store.dispatch(toggleBookmark(newBookmark as any));
    });

    await waitFor(() =>
      expect(screen.getByText(/Which aspect of UI design/)).toBeOnTheScreen()
    );

    const state = store.getState();
    expect(state.profile.profile.bookmarks).toHaveLength(2);

    // Test idempotency
    act(() => {
        store.dispatch(toggleBookmark(newBookmark as any)); // Should remove it
    });
    act(() => {
        store.dispatch(toggleBookmark(newBookmark as any)); // Should add it back
    });

    await waitFor(() =>
      expect(screen.getByText(/Which aspect of UI design/)).toBeOnTheScreen()
    );
    expect(store.getState().profile.profile.bookmarks).toHaveLength(2);
  });

  test('renders large bookmark list without crashing', async () => {
    const bookmarks = Array.from({ length: 50 }, (_, i) => ({
        questionId: String(i + 1),
        mostRecentAnswer: 'User Interface',
        isCorrect: true,
        difficultyLevel: 'easy',
        feedback: null
    }));

    givenBookmarks(...bookmarks);

    await screen.findByTestId('bookmark-item-1');
    // For FlatList, we might only see the first few items in test env due to virtualization
    expect(screen.getByText(/Bookmarks \(50\)/)).toBeOnTheScreen();
  });
});
