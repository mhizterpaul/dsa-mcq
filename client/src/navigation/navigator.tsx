import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import WelcomeScreen from '../Welcome';
import HomeScreen from '../screens';
import AuthScreen from '../screens/AuthScreen';
import DailyQuizScreen from '../screens/DailyQuizScreen';
import AchievementScreen from '../screens/AchievementScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import BookmarkScreen from '../screens/BookmarkScreen';
import QuizScreen from '../screens/QuizScreen';
import SessionSummaryScreen from '../screens/SessionSummaryScreen';
import DailyQuizSummaryScreen from '../screens/DailyQuizSummaryScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerificationCodeForm from '../screens/VerificationCodeForm';
import GoalScreen from '../screens/GoalScreen';

const Stack = createStackNavigator();

interface NavigatorProps {
  initialRouteName: 'Welcome' | 'Home';
}

const AppNavigator: React.FC<NavigatorProps> = ({ initialRouteName }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="DailyQuiz" component={DailyQuizScreen} />
        <Stack.Screen name="Achievement" component={AchievementScreen} />
        <Stack.Screen name="Profile" component={UserProfileScreen} />
        <Stack.Screen name="Bookmark" component={BookmarkScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="SessionSummary" component={SessionSummaryScreen} />
        <Stack.Screen name="DailyQuizSummary" component={DailyQuizSummaryScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="VerifyCodeScreen" component={VerificationCodeForm} />
        <Stack.Screen name="Goal" component={GoalScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
