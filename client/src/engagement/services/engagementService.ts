import { UserEngagement } from '../store/primitives/UserEngagement';
import { AppDispatch } from '../../mediator/store';

const API_BASE_URL = 'http://localhost:3000/api';

export interface WeeklyKing {
  userId: string;
  name: string;
  score: number;
  avatarUrl?: string;
}

const getWeeklyKing = async (): Promise<WeeklyKing> => {
    const response = await fetch(`${API_BASE_URL}/engagement/weekly-king`);
    if (!response.ok) {
        throw new Error('Failed to fetch weekly king');
    }
    return await response.json();
};

export const notificationScheduler = ():void => {
  //logic for scheduling user notification
  //runnable in the background
  //dispatch actions to update user engagement state
  console.log('Notification scheduler running...');
}

const engagementService = {
    getWeeklyKing,
    notificationScheduler,
};

export default engagementService;
