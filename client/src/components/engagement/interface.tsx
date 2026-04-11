import React from 'react';
import GoalSetter from '../user/components/GoalSetter';
import Reminders from './components/Reminders';
import MotivationCard from './components/MotivationCard';
import NotificationButton from './components/NotificationButton';
import Leaderboard from './components/Leaderboard';
import UserScore from './components/UserScore';
import WeeklyKingOfQuiz from './components/WeeklyKingOfQuiz';
import DailyQuizBanner from '../learning/components/DailyQuizBanner';
import AchievementsView from './screens/AchievementsView';
import LeaderboardView from './components/LeaderboardView';
import engagementService from './services/engagementService';
import { setWeeklyKingOfQuiz } from './store/globalEngagement.slice';
import { AppDispatch } from '../mediator/store';
import { EngagementComponentImpl } from './EngagementComponentImpl';

export interface IEngagementComponent {
  hydrate(dispatch: AppDispatch): Promise<void>;
  loadGamificationState(): void;
  scheduleReminders(): void;
  renderLeaderboard(screen: string): React.ReactElement;
  renderAchievements(screen: string, navigation: any): React.ReactElement;
  renderLeaderboardView(screen: string): React.ReactElement;
  renderGoalSetter(screen: string, onSetTarget: () => void): React.ReactElement;
  renderReminders(screen: string): React.ReactElement;
  renderMotivationCard(screen: string): React.ReactElement;
  renderNotificationButton(screen: string, onPress: () => void): React.ReactElement;
  renderUserScore(screen: string): React.ReactElement;
  renderWeeklyKingOfQuiz(screen: string, navigation: any): React.ReactElement;
  renderDailyQuizBanner(screen: string, navigation: any): React.ReactElement;
  getUserMetrics(userId: string): Promise<any>;
  fetchBadgesForSession(sessionId: string): Promise<any[]>;
}

export class EngagementComponent extends EngagementComponentImpl implements IEngagementComponent {
    renderGoalSetter(screen: string, onSetTarget: () => void): React.ReactElement {
        return <GoalSetter onSetTarget={onSetTarget} />;
    }
}
