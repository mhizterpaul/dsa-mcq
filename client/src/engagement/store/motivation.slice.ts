import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MotivationState {
  messages: string[];
  currentMessage: string;
}

const initialState: MotivationState = {
  messages: [
    'Keep going! Every quiz makes you better!',
    "Don't give up! You're making great progress!",
    'Believe in yourself! You can do it!',
    'The more you learn, the more you earn!',
  ],
  currentMessage: 'Keep going! Every quiz makes you better!',
};

const motivationSlice = createSlice({
  name: 'motivation',
  initialState,
  reducers: {
    setRandomMessage: (state) => {
      const randomIndex = Math.floor(Math.random() * state.messages.length);
      state.currentMessage = state.messages[randomIndex];
    },
  },
});

export const { setRandomMessage } = motivationSlice.actions;
export default motivationSlice.reducer;
