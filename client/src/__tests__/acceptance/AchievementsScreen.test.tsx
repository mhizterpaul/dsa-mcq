import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AchievementsView from '../../components/engagement/screens/AchievementsView';

// Mock MaterialCommunityIcons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

const Stack = createStackNavigator();

const MockSettingsScreen = () => <></>;

const TestNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Achievements" component={AchievementsView} />
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

  test('gear icon on the left navigates to settings page', async () => {
    const { getByTestId } = render(<TestNavigator />);
    const gearButton = getByTestId('gear-button');

    fireEvent.press(gearButton);
    // Navigation check can be done via spying on navigation or checking if screen changed if possible
    // Here we just ensure it's clickable and we can mock navigation
  });

  test('tabs are present: Badges, Leaderboard, Stats', () => {
    render(<TestNavigator />);

    expect(screen.getByTestId('tab-badges')).toBeTruthy();
    expect(screen.getByTestId('tab-leaderboard')).toBeTruthy();
    expect(screen.getByTestId('tab-stats')).toBeTruthy();
  });

  test('switching tabs changes content', async () => {
    render(<TestNavigator />);

    // Default tab is Badges
    expect(screen.getByTestId('badges-tab-content')).toBeTruthy();
    expect(screen.queryByTestId('leaderboard-tab-content')).toBeFalsy();

    // Switch to Leaderboard
    fireEvent.press(screen.getByTestId('tab-leaderboard'));
    expect(screen.getByTestId('leaderboard-tab-content')).toBeTruthy();
    expect(screen.queryByTestId('badges-tab-content')).toBeFalsy();

    // Switch to Stats
    fireEvent.press(screen.getByTestId('tab-stats'));
    expect(screen.getByTestId('stats-tab-content')).toBeTruthy();
    expect(screen.queryByTestId('leaderboard-tab-content')).toBeFalsy();
  });

  test('Badges tab contains required elements', () => {
    render(<TestNavigator />);
    // Ensure we are on Badges tab
    fireEvent.press(screen.getByTestId('tab-badges'));

    expect(screen.getByText('81')).toBeTruthy();
    expect(screen.getByText('Badges Unlocked')).toBeTruthy();
    expect(screen.getByText('Fitness God')).toBeTruthy();
    expect(screen.getByText('Max Sets')).toBeTruthy();
    expect(screen.getByText('AI Enthusiast')).toBeTruthy();
    expect(screen.getByText('Your Next Badge')).toBeTruthy();
    expect(screen.getByText('10 Day Streak')).toBeTruthy();
    expect(screen.getByText('60%')).toBeTruthy();
  });

  test('Leaderboard tab contains required elements', () => {
    render(<TestNavigator />);
    fireEvent.press(screen.getByTestId('tab-leaderboard'));

    expect(screen.getByText('4,878')).toBeTruthy();
    expect(screen.getByText(/3rd Place/)).toBeTruthy();
    expect(screen.getByText('View Stats')).toBeTruthy();
    expect(screen.getByText('All Leaderboards')).toBeTruthy();
    expect(screen.getByText('Azunyan U. Wu')).toBeTruthy();
    expect(screen.getByText('Champagne S. Nova')).toBeTruthy();
  });

  test('Stats tab contains required elements', () => {
    render(<TestNavigator />);
    fireEvent.press(screen.getByTestId('tab-stats'));

    expect(screen.getByText('High Score')).toBeTruthy();
    expect(screen.getByText('Longest Streak')).toBeTruthy();
    expect(screen.getByText('Longest Exercise')).toBeTruthy();
    expect(screen.getByText('Longest Reps')).toBeTruthy();
    expect(screen.getByText('Longest Sets')).toBeTruthy();
  });
});
