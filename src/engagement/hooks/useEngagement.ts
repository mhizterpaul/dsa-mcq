import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store'; // Assuming a root store will be created
import {
  addNotification,
  setUserEngagement,
} from '../store';

export const useEngagement = () => {
  const dispatch = useDispatch();

  const engagementState = useSelector((state: RootState) => state.engagement);

  // Example action dispatcher
  const createNewNotification = (notification: any) => {
    dispatch(addNotification(notification));
  };

  return {
    engagementState,
    actions: {
      addNotification: createNewNotification,
      setUserEngagement: (engagement: any) => dispatch(setUserEngagement(engagement)),
    },
  };
};
