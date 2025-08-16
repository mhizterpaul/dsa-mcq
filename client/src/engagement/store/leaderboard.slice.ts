import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { Player } from './primitives/Player';

const leaderboardAdapter = createEntityAdapter<Player>();

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState: leaderboardAdapter.getInitialState(),
  reducers: {
    setLeaderboard: leaderboardAdapter.setAll,
  },
});

export const { setLeaderboard } = leaderboardSlice.actions;

export default leaderboardSlice.reducer;
