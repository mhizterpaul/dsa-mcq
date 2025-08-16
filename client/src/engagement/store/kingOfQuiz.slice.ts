import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { KingOfQuiz } from './primitives/KingOfQuiz';

interface KingOfQuizState {
  king: KingOfQuiz | null;
}

const initialState: KingOfQuizState = {
  king: null,
};

const kingOfQuizSlice = createSlice({
  name: 'kingOfQuiz',
  initialState,
  reducers: {
    setKingOfQuiz: (state, action: PayloadAction<KingOfQuiz>) => {
      state.king = action.payload;
    },
  },
});

export const { setKingOfQuiz } = kingOfQuizSlice.actions;
export default kingOfQuizSlice.reducer;
