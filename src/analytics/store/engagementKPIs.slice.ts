import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { EngagementKPI } from '../interface';

const engagementKPIsAdapter = createEntityAdapter<EngagementKPI>({
  selectId: (kpi) => kpi.id,
});

const engagementKPIsSlice = createSlice({
  name: 'engagementKPIs',
  initialState: engagementKPIsAdapter.getInitialState(),
  reducers: {
    addEngagementKPI: (state, action: PayloadAction<{ id: string; value: number }>) => {
        const { id, value } = action.payload;
        const newKPI = new EngagementKPI(id, value);
        engagementKPIsAdapter.addOne(state, { ...newKPI });
    },
  },
});

export const { addEngagementKPI } = engagementKPIsSlice.actions;

export default engagementKPIsSlice.reducer;
