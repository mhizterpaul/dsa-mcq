import React from 'react';
import GoalSetter from './components/GoalSetter';
import Reminders from './components/Reminders';
import MotivationCard from './components/MotivationCard';
import NotificationButton from './components/NotificationButton';
import Leaderboard from './components/Leaderboard';
import UserScore from './components/UserScore';
import PromoBanner from '../mediator/components/PromoBanner';

export interface IEngagementComponent {
  loadGamificationState(): void;
  scheduleReminders(): void;
  renderLeaderboard(): React.ReactElement;
  renderAchievements(): void;
  renderGoalSetter(onSetTarget: () => void): React.ReactElement;
  renderReminders(): React.ReactElement;
  renderMotivationCard(): React.ReactElement;
  renderNotificationButton(onPress: () => void): React.ReactElement;
  renderUserScore(score: number): React.ReactElement;
  renderPromoBanner(): React.ReactElement;
}

export class EngagementComponent implements IEngagementComponent {
    loadGamificationState() {
        console.log("Loading gamification state...");
    }

    scheduleReminders() {
        console.log("Scheduling reminders...");
    }

    renderLeaderboard(): React.ReactElement {
        return <Leaderboard />;
    }

    renderAchievements() {
        console.log("Rendering achievements...");
    }

    renderGoalSetter(onSetTarget: () => void): React.ReactElement {
        return <GoalSetter onSetTarget={onSetTarget} />;
    }

    renderReminders(): React.ReactElement {
        return <Reminders />;
    }

    renderMotivationCard(): React.ReactElement {
        return <MotivationCard />;
    }

    renderNotificationButton(onPress: () => void): React.ReactElement {
        return <NotificationButton onPress={onPress} />;
    }

    renderUserScore(score: number): React.ReactElement {
        return <UserScore score={score} />;
    }

    renderPromoBanner(): React.ReactElement {
        return <PromoBanner />;
    }
}
