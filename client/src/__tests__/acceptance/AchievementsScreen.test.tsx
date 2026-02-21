import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { render, screen, fireEvent } from '@testing-library/react-native';
import AchievementsView, { AchievementsData } from '../../components/engagement/screens/AchievementsView';

// Mock MaterialCommunityIcons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

const Stack = createStackNavigator();

const mockAchievementsData: AchievementsData = {
  badges: {
    totalUnlocked: 81,
    list: [
      { id: 1, title: 'Fitness God', date: 'Feb 23, 2025', icon: 'dumbbell' },
      { id: 2, title: 'Max Sets', date: 'Feb 23, 2025', icon: 'text' },
      { id: 3, title: 'AI Enthusiast', date: 'Feb 23, 2025', icon: 'robot' }
    ],
    nextBadge: [
      { title: '10 Day Streak', description: 'Open app for 10 days', progress: 60 },
      { title: '5,000 Calorie Burn', description: 'Burn 5K Calories total', progress: 32 }
    ]
  },
  leaderboard: {
    score: 4878,
    rank: 3,
    competitors: [
      { id: 1, name: 'Azunyan U. Wu', score: 118487, level: 10, badgeText: '80' },
      { id: 2, name: 'Champagne S. Nova', score: 58123, level: 8, badgeIcon: 'dumbbell' }
    ]
  },
  stats: {
    highScore: 980,
    longestStreak: '14',
    longestExercise: '60',
    longestReps: '120',
    longestSets: '20'
  }
};

const MockSettingsScreen = () => <></>;

const TestNavigator = ({ data = mockAchievementsData }: { data?: AchievementsData }) => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Achievements">
        {(props) => <AchievementsView {...props} data={data} />}
      </Stack.Screen>
      <Stack.Screen name="Settings" component={MockSettingsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('AchievementsScreen Acceptance Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders title block with Achievements title, gear icon and back button', () => {
    render(<TestNavigator />);

    expect(screen.getByText('Achievements')).toBeTruthy();
    expect(screen.getByTestId('gear-button')).toBeTruthy();
    expect(screen.getByTestId('back-button')).toBeTruthy();
  });

  test('Badges tab is active by default', async () => {
    render(<TestNavigator />);

    const badgesTab = screen.getByTestId('tab-badges');
    expect(badgesTab.props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('badges-tab-content')).toBeTruthy();
  });

  test('Badges tab reflects dummy badge data correctly', async () => {
    render(<TestNavigator />);

    // Already on Badges tab by default
    expect(screen.getByText('81')).toBeTruthy();
    expect(screen.getByText('Fitness God')).toBeTruthy();
    expect(screen.getByText('Max Sets')).toBeTruthy();
    expect(screen.getByText('AI Enthusiast')).toBeTruthy();
    expect(screen.getByText('10 Day Streak')).toBeTruthy();
    expect(screen.getByText('60%')).toBeTruthy();
  });

  test('Leaderboard tab reflects correct ranking and score', async () => {
    render(<TestNavigator />);

    fireEvent.press(screen.getByTestId('tab-leaderboard'));

    const leaderboardTab = screen.getByTestId('tab-leaderboard');
    expect(leaderboardTab.props.accessibilityState.selected).toBe(true);

    // Score is 4878, should be formatted with locale (if implemented that way)
    // In my implementation I used toLocaleString()
    expect(screen.getByText('4,878')).toBeTruthy();
    expect(screen.getByText(/3rd Place/)).toBeTruthy();
    expect(screen.getByText('Azunyan U. Wu')).toBeTruthy();
    expect(screen.getByText('Champagne S. Nova')).toBeTruthy();
    expect(screen.getByText('118,487pts • Lvl 10')).toBeTruthy();
  });

  test('Stats tab reflects statistical values from dummy data', async () => {
    render(<TestNavigator />);

    fireEvent.press(screen.getByTestId('tab-stats'));

    const statsTab = screen.getByTestId('tab-stats');
    expect(statsTab.props.accessibilityState.selected).toBe(true);

    expect(screen.getAllByText('High Score').length).toBeGreaterThanOrEqual(1);
    // In Stats tab, I have two "High Score" texts, one is header, one is label.
    // And the value 980.
    expect(screen.getByText('980')).toBeTruthy();
    expect(screen.getByText('14')).toBeTruthy();
    expect(screen.getByText('60')).toBeTruthy();
    expect(screen.getByText('120')).toBeTruthy();
    expect(screen.getByText('20')).toBeTruthy();
  });

  test('only one tab can be active at a time', async () => {
    render(<TestNavigator />);

    fireEvent.press(screen.getByTestId('tab-leaderboard'));

    expect(screen.getByTestId('tab-leaderboard').props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('tab-badges').props.accessibilityState.selected).toBe(false);
    expect(screen.getByTestId('tab-stats').props.accessibilityState.selected).toBe(false);
  });

  test('rank formatting logic renders ordinal correctly', async () => {
    const customData = {
        ...mockAchievementsData,
        leaderboard: {
            ...mockAchievementsData.leaderboard,
            rank: 1
        }
    };
    render(<TestNavigator data={customData} />);

    fireEvent.press(screen.getByTestId('tab-leaderboard'));
    expect(screen.getByText(/1st Place/)).toBeTruthy();
  });
});
