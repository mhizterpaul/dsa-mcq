import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { Insight } from './primitives/Insight';

const insightsAdapter = createEntityAdapter<Insight>({
  selectId: (insight) => insight.id,
});

const insightsSlice = createSlice({
  name: 'insights',
  initialState: insightsAdapter.getInitialState(),
  reducers: {
    addInsight: (state, action: PayloadAction<{ id: string; anomalyId: string; recommendation: string }>) => {
      const { id, anomalyId, recommendation } = action.payload;
      const newInsight = new Insight(id, anomalyId, recommendation);
      insightsAdapter.addOne(state, { ...newInsight });
    },
  },
});

export const { addInsight } = insightsSlice.actions;

export default insightsSlice.reducer;
