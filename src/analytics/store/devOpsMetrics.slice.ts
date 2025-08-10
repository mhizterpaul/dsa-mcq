import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { DevOpsMetric } from '../interface';

const devOpsMetricsAdapter = createEntityAdapter<DevOpsMetric>({
  selectId: (metric) => metric.id,
});

const devOpsMetricsSlice = createSlice({
  name: 'devOpsMetrics',
  initialState: devOpsMetricsAdapter.getInitialState(),
  reducers: {
    addDevOpsMetric: devOpsMetricsAdapter.addOne,
    addDevOpsMetrics: devOpsMetricsAdapter.addMany,
    updateDevOpsMetric: devOpsMetricsAdapter.updateOne,
    removeDevOpsMetric: devOpsMetricsAdapter.removeOne,
    setDevOpsMetrics: devOpsMetricsAdapter.setAll,
  },
});

export const {
  addDevOpsMetric,
  addDevOpsMetrics,
  updateDevOpsMetric,
  removeDevOpsMetric,
  setDevOpsMetrics,
} = devOpsMetricsSlice.actions;

export default devOpsMetricsSlice.reducer;
