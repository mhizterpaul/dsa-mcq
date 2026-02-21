import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile, QuestionResponse } from './primitives/UserProfile';

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
    toggleBookmark: (state, action: PayloadAction<QuestionResponse>) => {
      if (state.profile) {
        const index = state.profile.bookmarks.findIndex(b => b.questionId === action.payload.questionId);
        if (index >= 0) {
          state.profile.bookmarks.splice(index, 1);
        } else {
          state.profile.bookmarks.push(action.payload);
        }
      }
    },
  },
});

export const { setUserProfile, toggleBookmark } = userProfileSlice.actions;
export default userProfileSlice.reducer;
