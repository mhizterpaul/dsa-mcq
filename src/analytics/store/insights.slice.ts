import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Insight } from '../interface';

const insightsAdapter = createEntityAdapter<Insight>({
  selectId: (insight) => insight.id,
});

const insightsSlice = createSlice({
  name: 'insights',
  initialState: insightsAdapter.getInitialState(),
  reducers: {
    addInsight: insightsAdapter.addOne,
    addInsights: insightsAdapter.addMany,
    updateInsight: insightsAdapter.updateOne,
    removeInsight: insightsAdapter.removeOne,
    setInsights: insightsAdapter.setAll,
  },
});

export const {
  addInsight,
  addInsights,
  updateInsight,
  removeInsight,
  setInsights,
} = insightsSlice.actions;

export default insightsSlice.reducer;
