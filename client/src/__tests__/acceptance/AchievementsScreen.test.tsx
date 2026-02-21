import * as React from 'react';
import { View, Text } from 'react-native';
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

const MockSettingsScreen = () => (
    <View>
        <Text>Settings Page</Text>
    </View>
);

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

  test('gear icon navigates to settings page', async () => {
    render(<TestNavigator />);
    fireEvent.press(screen.getByTestId('gear-button'));
    expect(await screen.findByText('Settings Page')).toBeTruthy();
  });

  test('Badges tab is active by default', async () => {
    render(<TestNavigator />);

    const badgesTab = screen.getByTestId('tab-badges');
    expect(badgesTab.props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('badges-tab-content')).toBeTruthy();
  });

  test('inactive tab content is not rendered', () => {
    render(<TestNavigator />);

    // Default is badges
    expect(screen.queryByTestId('leaderboard-tab-content')).toBeNull();
    expect(screen.queryByTestId('stats-tab-content')).toBeNull();

    fireEvent.press(screen.getByTestId('tab-leaderboard'));

    expect(screen.queryByTestId('badges-tab-content')).toBeNull();
  });

  test('Badges tab reflects dummy badge data correctly', async () => {
    render(<TestNavigator />);

    expect(screen.getByText(mockAchievementsData.badges.totalUnlocked.toString())).toBeTruthy();
    expect(screen.getByText('Fitness God')).toBeTruthy();
    expect(screen.getByText('Max Sets')).toBeTruthy();
    expect(screen.getByText('AI Enthusiast')).toBeTruthy();
  });

  test('all next badges render correctly', () => {
    render(<TestNavigator />);

    expect(screen.getByText('10 Day Streak')).toBeTruthy();
    expect(screen.getByText('5,000 Calorie Burn')).toBeTruthy();
    expect(screen.getByText('60%')).toBeTruthy();
    expect(screen.getByText('32%')).toBeTruthy();
  });

  test('Leaderboard tab reflects correct ranking and score', async () => {
    render(<TestNavigator />);

    fireEvent.press(screen.getByTestId('tab-leaderboard'));

    const leaderboardTab = screen.getByTestId('tab-leaderboard');
    expect(leaderboardTab.props.accessibilityState.selected).toBe(true);

    expect(screen.getByText(mockAchievementsData.leaderboard.score.toLocaleString())).toBeTruthy();
    expect(screen.getByText(/3rd Place/)).toBeTruthy();
    expect(screen.getByText('Azunyan U. Wu')).toBeTruthy();
    expect(screen.getByText('Champagne S. Nova')).toBeTruthy();
  });

  test('Stats tab reflects statistical values from dummy data', async () => {
    render(<TestNavigator />);

    fireEvent.press(screen.getByTestId('tab-stats'));

    const statsTab = screen.getByTestId('tab-stats');
    expect(statsTab.props.accessibilityState.selected).toBe(true);

    expect(screen.getAllByText('High Score').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(mockAchievementsData.stats.highScore.toString())).toBeTruthy();
    expect(screen.getByText(mockAchievementsData.stats.longestStreak.toString())).toBeTruthy();
    expect(screen.getByText(mockAchievementsData.stats.longestExercise.toString())).toBeTruthy();
    expect(screen.getByText(mockAchievementsData.stats.longestReps.toString())).toBeTruthy();
    expect(screen.getByText(mockAchievementsData.stats.longestSets.toString())).toBeTruthy();
  });

  test('only one tab can be active at a time', async () => {
    render(<TestNavigator />);

    fireEvent.press(screen.getByTestId('tab-leaderboard'));

    expect(screen.getByTestId('tab-leaderboard').props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('tab-badges').props.accessibilityState.selected).toBe(false);
    expect(screen.getByTestId('tab-stats').props.accessibilityState.selected).toBe(false);
  });

  test('ordinal formatting handles edge cases correctly', () => {
    const edgeCases = [
        { rank: 1, expected: '1st' },
        { rank: 2, expected: '2nd' },
        { rank: 3, expected: '3rd' },
        { rank: 4, expected: '4th' },
        { rank: 11, expected: '11th' },
        { rank: 12, expected: '12th' },
        { rank: 13, expected: '13th' },
        { rank: 21, expected: '21st' },
        { rank: 101, expected: '101st' },
        { rank: 111, expected: '111th' }
    ];

    edgeCases.forEach(({ rank, expected }) => {
        const customData = {
            ...mockAchievementsData,
            leaderboard: {
                ...mockAchievementsData.leaderboard,
                rank
            }
        };
        const { unmount } = render(<TestNavigator data={customData} />);
        fireEvent.press(screen.getByTestId('tab-leaderboard'));
        expect(screen.getByText(new RegExp(`${expected} Place`))).toBeTruthy();
        unmount();
    });
  });

  test('renders gracefully when no badges unlocked', () => {
    const emptyData: AchievementsData = {
      ...mockAchievementsData,
      badges: {
        ...mockAchievementsData.badges,
        totalUnlocked: 0,
        list: [],
        nextBadge: []
      }
    };

    render(<TestNavigator data={emptyData} />);

    expect(screen.getByText('0')).toBeTruthy();
    expect(screen.queryByText('Fitness God')).toBeNull();
  });

  test('updates when data prop changes', () => {
    const { rerender } = render(<TestNavigator />);

    const updatedData: AchievementsData = {
      ...mockAchievementsData,
      badges: {
        ...mockAchievementsData.badges,
        totalUnlocked: 82
      }
    };

    rerender(<TestNavigator data={updatedData} />);

    expect(screen.getByText('82')).toBeTruthy();
  });
});
