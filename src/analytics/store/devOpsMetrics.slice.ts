import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { DevOpsMetric } from '../interface';

const devOpsMetricsAdapter = createEntityAdapter<DevOpsMetric>({
  selectId: (metric) => metric.id,
});

const devOpsMetricsSlice = createSlice({
  name: 'devOpsMetrics',
  initialState: devOpsMetricsAdapter.getInitialState(),
  reducers: {
    addDevOpsMetric: (state, action: PayloadAction<{ id: string; value: number }>) => {
      const { id, value } = action.payload;
      const newMetric = new DevOpsMetric(id, value);
      devOpsMetricsAdapter.addOne(state, { ...newMetric });
    },
  },
});

export const { addDevOpsMetric } = devOpsMetricsSlice.actions;

export default devOpsMetricsSlice.reducer;
