import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store'; // Assuming a root store will be created
import {
  setCurrentUser,
  updateCurrentUser,
  logout,
} from '../store';

export const useUser = () => {
  const dispatch = useDispatch();

  const userState = useSelector((state: RootState) => state.user);

  return {
    userState,
    actions: {
      setCurrentUser: (user: any) => dispatch(setCurrentUser(user)),
      updateCurrentUser: (updates: any) => dispatch(updateCurrentUser(updates)),
      logout: () => dispatch(logout()),
    },
  };
};
