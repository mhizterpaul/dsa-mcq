import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from './primitives/UserProfile';

interface UserProfileState {
  profile: UserProfile | null;
}

const initialState: UserProfileState = {
  profile: null,
};

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    setUserProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
  },
});

export const { setUserProfile } = userProfileSlice.actions;
export default userProfileSlice.reducer;
