import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../mediator/store/store';
import {
  setCurrentUser,
  updatePreference,
  updateMasteryLevel,
  logout,
} from '../store/user.slice';

export const useUser = () => {
  const dispatch = useDispatch();

  const userState = useSelector((state: RootState) => state.user);

  return {
    userState,
    actions: {
      setCurrentUser: (user: any) => dispatch(setCurrentUser(user)),
      updatePreference: (difficulty: 'easy' | 'medium' | 'hard') => dispatch(updatePreference(difficulty)),
      updateMasteryLevel: (data: { categoryId: string; score: number }) => dispatch(updateMasteryLevel(data)),
      logout: () => dispatch(logout()),
    },
  };
};
