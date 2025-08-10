import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { EngagementKPI } from '../interface';

const engagementKPIsAdapter = createEntityAdapter<EngagementKPI>({
  selectId: (kpi) => kpi.id,
});

const engagementKPIsSlice = createSlice({
  name: 'engagementKPIs',
  initialState: engagementKPIsAdapter.getInitialState(),
  reducers: {
    addEngagementKPI: engagementKPIsAdapter.addOne,
    addEngagementKPIs: engagementKPIsAdapter.addMany,
    updateEngagementKPI: engagementKPIsAdapter.updateOne,
    removeEngagementKPI: engagementKPIsAdapter.removeOne,
    setEngagementKPIs: engagementKPIsAdapter.setAll,
  },
});

export const {
  addEngagementKPI,
  addEngagementKPIs,
  updateEngagementKPI,
  removeEngagementKPI,
  setEngagementKPIs,
} = engagementKPIsSlice.actions;

export default engagementKPIsSlice.reducer;
