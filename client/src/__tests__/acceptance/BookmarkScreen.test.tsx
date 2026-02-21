import * as React from 'react';
import { View, Text } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/native';
import { render, screen, userEvent, waitFor, fireEvent, within } from '@testing-library/react-native';

import { configureStore } from '@reduxjs/toolkit';
import type { PreloadedState } from '@reduxjs/toolkit';

import rootReducer from '../../store/rootReducer';
import BookmarkScreen from '../../screens/BookmarkScreen';
import { AppStore, RootState } from '../../store';
import { UserProfile, QuestionResponse } from '../../components/user/store/primitives/UserProfile';

jest.mock('react-native-vector-icons/Feather', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// --- Mock Data ---
const mockQuestions = [
  {
    id: 1,
    question: "What does UI stand for in the context of design?",
    category: "design",
    options: [
      { text: "User Integration", isCorrect: false },
      { text: "User Interface", isCorrect: true },
      { text: "Universal Interaction", isCorrect: false },
      { text: "User Involvement", isCorrect: false },
    ],
  },
  {
    id: 2,
    question: "Which aspect of UI design focuses on visual elements?",
    category: "design",
    options: [
      { text: "Typography", isCorrect: true },
      { text: "Logic", isCorrect: false },
    ],
  },
];

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

describe('BookmarkScreen Acceptance Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  const getInitialState = (bookmarks: QuestionResponse[] = []): PreloadedState<RootState> => {
    const profile = new UserProfile('user1');
    profile.bookmarks = bookmarks;

    return {
        user: {
            currentUser: { id: 'user1', fullName: 'Test User', email: 'test@example.com' },
            loading: false,
            error: null,
        },
        profile: {
            profile: JSON.parse(JSON.stringify(profile)) // Ensure it's a plain object
        }
    } as any;
  };

  test('renders header and title correctly', async () => {
    renderWithProviders(getInitialState());
    expect(screen.getByTestId('back-button')).toBeOnTheScreen();
    expect(screen.getByTestId('screen-title')).toHaveTextContent('Bookmarks');
  });

  test('back button returns user to previous screen', async () => {
    renderWithProviders(getInitialState());

    // Should be on Bookmark screen due to initialState
    await waitFor(() => expect(screen.getByTestId('screen-title')).toBeOnTheScreen());

    fireEvent.press(screen.getByTestId('back-button'));

    await waitFor(() =>
      expect(screen.getByTestId('home-screen')).toBeOnTheScreen()
    );
  });

  test('displays bookmarked items', async () => {
    const bookmarks = [
        new QuestionResponse('1', 'User Interface', true, 'easy'),
        new QuestionResponse('2', 'Typography', true, 'easy')
    ];
    renderWithProviders(getInitialState(bookmarks));

    await waitFor(() => expect(screen.getByText(/What does UI stand for/)).toBeOnTheScreen());
    expect(screen.getByText(/Which aspect of UI design/)).toBeOnTheScreen();
  });

  test('shows empty state when no bookmarks exist', async () => {
    renderWithProviders(getInitialState([]));

    expect(await screen.findByText(/no bookmarks yet/i)).toBeOnTheScreen();
  });

  test('searching bookmarks filters the list', async () => {
    const bookmarks = [
        new QuestionResponse('1', 'User Interface', true, 'easy'),
        new QuestionResponse('2', 'Typography', true, 'easy')
    ];
    renderWithProviders(getInitialState(bookmarks));

    await waitFor(() => expect(screen.getByText(/What does UI stand for/)).toBeOnTheScreen());

    const searchBar = screen.getByTestId('search-bar');
    await user.type(searchBar, 'aspect');

    expect(screen.queryByText(/What does UI stand for/)).not.toBeOnTheScreen();
    expect(screen.getByText(/Which aspect of UI design/)).toBeOnTheScreen();
  });

  test('toggling expansion shows question details and last selection', async () => {
    const bookmarks = [
        new QuestionResponse('1', 'User Interface', true, 'easy')
    ];
    renderWithProviders(getInitialState(bookmarks));

    await waitFor(() => expect(screen.getByTestId('bookmark-item-0')).toBeOnTheScreen());

    // Not expanded yet
    expect(screen.queryByTestId('expanded-view-0')).not.toBeOnTheScreen();

    // Tap to expand
    await user.press(screen.getByTestId('bookmark-item-0'));

    expect(await screen.findByTestId('expanded-view-0')).toBeOnTheScreen();
    expect(screen.getByText('User Integration')).toBeOnTheScreen();
    expect(screen.getByText('User Interface')).toBeOnTheScreen();

    const selectedOption = screen.getByTestId('option-0-1'); // User Interface is index 1
    expect(within(selectedOption).getByTestId('status-icon')).toBeDefined();
  });

  test('tapping expanded item collapses it', async () => {
    const bookmarks = [
      new QuestionResponse('1', 'User Interface', true, 'easy')
    ];

    renderWithProviders(getInitialState(bookmarks));

    await waitFor(() => expect(screen.getByTestId('bookmark-item-0')).toBeOnTheScreen());

    await user.press(screen.getByTestId('bookmark-item-0'));
    expect(await screen.findByTestId('expanded-view-0')).toBeOnTheScreen();

    await user.press(screen.getByTestId('bookmark-item-0'));

    await waitFor(() =>
      expect(screen.queryByTestId('expanded-view-0')).not.toBeOnTheScreen()
    );
  });

  test('expanded view retains user last selected option', async () => {
    const bookmarks = [
      new QuestionResponse('1', 'User Interface', true, 'easy')
    ];

    renderWithProviders(getInitialState(bookmarks));

    await waitFor(() => expect(screen.getByTestId('bookmark-item-0')).toBeOnTheScreen());

    await user.press(screen.getByTestId('bookmark-item-0'));

    const selectedOption = await screen.findByTestId('option-0-1');
    expect(within(selectedOption).getByTestId('status-icon')).toBeOnTheScreen();
  });

  test('three dots menu is present on collapsed view', async () => {
    const bookmarks = [
        new QuestionResponse('1', 'User Interface', true, 'easy')
    ];
    renderWithProviders(getInitialState(bookmarks));

    await waitFor(() => expect(screen.getByTestId('three-dots-0')).toBeOnTheScreen());
  });
});
