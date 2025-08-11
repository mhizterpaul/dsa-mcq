import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from './primitives/User';
import * as userService from '../services/userService';

interface UserState {
  currentUser: User | null;
}

const initialState: UserState = {
  currentUser: null,
};

export const loginUser = createAsyncThunk(
    'user/login',
    async ({ username, password }: any) => {
        const response = await userService.login(username, password);
        return response;
    }
);

export const registerUser = createAsyncThunk(
    'user/register',
    async ({ username, email, password }: any) => {
        const response = await userService.register(username, email, password);
        return response;
    }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<{ id: string; username: string; email: string }>) => {
      const { id, username, email } = action.payload;
      const newUser = new User(id, username, email);
      state.currentUser = { ...newUser };
    },
    updatePreference: (state, action: PayloadAction<'easy' | 'medium' | 'hard'>) => {
      if (state.currentUser) {
        const userInstance = Object.assign(new User(state.currentUser.id, state.currentUser.username, state.currentUser.email), state.currentUser);
        userInstance.updatePreference(action.payload);
        state.currentUser = { ...userInstance };
      }
    },
    updateMasteryLevel: (state, action: PayloadAction<{ categoryId: string; score: number }>) => {
        if (state.currentUser) {
            const { categoryId, score } = action.payload;
            const userInstance = Object.assign(new User(state.currentUser.id, state.currentUser.username, state.currentUser.email), state.currentUser);
            userInstance.updateMasteryLevel(categoryId, score);
            state.currentUser = { ...userInstance };
        }
    },
    logout: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.currentUser = action.payload.user;
    });
  },
});

export const {
  setCurrentUser,
  updatePreference,
  updateMasteryLevel,
  logout,
} = userSlice.actions;

export default userSlice.reducer;
