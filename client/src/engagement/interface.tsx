import React from 'react';
import GoalSetter from './components/GoalSetter';
import Reminders from './components/Reminders';
import MotivationCard from './components/MotivationCard';
import NotificationButton from './components/NotificationButton';
import Leaderboard from './components/Leaderboard';
import UserScore from './components/UserScore';
import WeeklyKingOfQuiz from './components/WeeklyKingOfQuiz';
import DailyQuizBanner from './components/DailyQuizBanner';

export interface IEngagementComponent {
  loadGamificationState(): void;
  scheduleReminders(): void;
  renderLeaderboardView(screen: string): React.ReactElement;
  renderAchievements(screen: string): void;
  renderGoalSetterView(screen: string, onSetTarget: () => void): React.ReactElement;
  renderReminderList(screen: string): React.ReactElement;
  renderCard(screen: string): React.ReactElement;
  renderButton(screen: string, onPress: () => void): React.ReactElement;
  renderPill(screen: string, score: number): React.ReactElement;
}

export class EngagementComponent implements IEngagementComponent {
    loadGamificationState() {
        console.log("Loading gamification state...");
    }

    scheduleReminders() {
        console.log("Scheduling reminders...");
    }

    renderLeaderboardView(screen: string): React.ReactElement {
        return <Leaderboard />;
    }

    renderAchievements(screen: string) {
        console.log("Rendering achievements...");
    }

    renderGoalSetterView(screen: string, onSetTarget: () => void): React.ReactElement {
        return <GoalSetter onSetTarget={onSetTarget} />;
    }

    renderReminderList(screen: string): React.ReactElement {
        return <Reminders />;
    }

    renderCard(screen: string): React.ReactElement {
        if (screen === "HomeScreen_WeeklyKingOfQuiz") {
            return <WeeklyKingOfQuiz />;
        }
        if (screen === "HomeScreen_DailyQuizBanner") {
            return <DailyQuizBanner />;
        }
        return <MotivationCard />;
    }

    renderButton(screen: string, onPress: () => void): React.ReactElement {
        return <NotificationButton onPress={onPress} />;
    }

    renderPill(screen: string, score: number): React.ReactElement {
        return <UserScore score={score} />;
    }
}
