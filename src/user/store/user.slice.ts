import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../interface';

interface UserState {
  currentUser: User | null;
}

const initialState: UserState = {
  currentUser: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    updateCurrentUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    logout: (state) => {
      state.currentUser = null;
    },
  },
});

export const {
  setCurrentUser,
  updateCurrentUser,
  logout,
} = userSlice.actions;

export default userSlice.reducer;
