import { UserEngagement } from '../store/primitives/UserEngagement';
import { addNotification } from '../store/notification.slice';
import { AppDispatch } from '../../mediator/store';

const scheduleReminder = (
  dispatch: AppDispatch,
  userId: string,
  nextSessionTime: number,
  leadTime: number,
) => {
  const sendAt = nextSessionTime - leadTime;
  const now = Date.now();

  if (sendAt > now) {
    setTimeout(() => {
      dispatch(
        addNotification({
          id: `reminder-${userId}-${Date.now()}`,
          userId,
          message: 'Your next learning session is about to start!',
          type: 'reminder',
          sendAt: Date.now(),
        }),
      );
    }, sendAt - now);
  }
};

const generateNudgeForMissedSession = (
    userEngagement: UserEngagement,
): { message: string; type: 'nudge' } | null => {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const fortyEightHours = 48 * 60 * 60 * 1000;

    if (userEngagement.last_session_timestamp && Date.now() - userEngagement.last_session_timestamp > twentyFourHours && Date.now() - userEngagement.last_session_timestamp < fortyEightHours) {
        return {
            message: "You missed yesterday's session. Keep your streak going today!",
            type: 'nudge',
        };
    }
    return null;
}

const checkXpMilestone = (
  userEngagement: UserEngagement,
  levelThreshold: number = 1000,
): boolean => {
  return levelThreshold - userEngagement.xp_progress <= 50;
};

const checkStreakMilestone = (
  userEngagement: UserEngagement,
): boolean => {
  const milestones = [7, 30, 100];
  return milestones.includes(userEngagement.streak_length);
};
