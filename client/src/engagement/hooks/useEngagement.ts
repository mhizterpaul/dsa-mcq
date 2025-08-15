import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../mediator/store';
import { addNotification, markAsRead } from '../store/notification.slice';
import { setUserEngagement, updateStreak, addXp } from '../store/userEngagement.slice';

export const useEngagement = () => {
  const dispatch = useDispatch();

  const engagementState = useSelector((state: RootState) => state.engagement);

  return {
    engagementState,
    actions: {
      addNotification: (notification: any) => dispatch(addNotification(notification)),
      markAsRead: (notificationId: string) => dispatch(markAsRead({ id: notificationId })),
      setUserEngagement: (engagement: any) => dispatch(setUserEngagement(engagement)),
      updateStreak: (data: any) => dispatch(updateStreak(data)),
      addXp: (data: any) => dispatch(addXp(data)),
    },
  };
};
