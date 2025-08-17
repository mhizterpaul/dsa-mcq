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
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = { DailyQuiz: undefined; };
type NavigationProp = StackNavigationProp<RootStackParamList, 'DailyQuiz'>;

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
  renderUserScore(screen: string, score: number): React.ReactElement;
  renderWeeklyKingOfQuiz(screen: string): React.ReactElement;
  renderDailyQuizBanner(screen: string, navigation: NavigationProp): React.ReactElement;
}

export class EngagementComponent implements IEngagementComponent {
    async hydrate(dispatch: AppDispatch) {
        try {
            const weeklyKing = await engagementService.getWeeklyKing();
            dispatch(setWeeklyKingOfQuiz(weeklyKing));
        } catch (error) {
            console.error('Failed to hydrate engagement component:', error);
        }
    }

    loadGamificationState() {
        console.log("Loading gamification state...");
    }

    scheduleReminders() {
        console.log("Scheduling reminders...");
    }

    renderLeaderboard(screen: string): React.ReactElement {
        return <Leaderboard />;
    }

    renderAchievements(screen: string, navigation: any): React.ReactElement {
        return <AchievementsView navigation={navigation} />;
    }

    renderGoalSetter(screen: string, onSetTarget: () => void): React.ReactElement {
        return <GoalSetter onSetTarget={onSetTarget} />;
    }

    renderReminders(screen: string): React.ReactElement {
        return <Reminders />;
    }

    renderMotivationCard(screen: string): React.ReactElement {
        return <MotivationCard />;
    }

    renderNotificationButton(screen: string, onPress: () => void): React.ReactElement {
        return <NotificationButton onPress={onPress} />;
    }

    renderUserScore(screen: string): React.ReactElement {
        return <UserScore />;
    }

    renderWeeklyKingOfQuiz(screen: string): React.ReactElement {
        return <WeeklyKingOfQuiz />;
    }

    renderDailyQuizBanner(screen: string, navigation: NavigationProp): React.ReactElement {
        return <DailyQuizBanner navigation={navigation} />;
    }

    renderLeaderboardView(screen: string): React.ReactElement {
        return <LeaderboardView />;
    }
}
