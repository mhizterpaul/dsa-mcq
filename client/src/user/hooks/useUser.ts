import { useSelector, useDispatch } from 'react-redux';
import  {UserRootState}  from '../store';
import {
  setCurrentUser,
  updatePreference,
  updateMasteryLevel,
  logout,
} from '../store/user.slice';

export const useUser = () => {
  const dispatch = useDispatch();

  const userState = useSelector((state: UserRootState) => state.user);

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
