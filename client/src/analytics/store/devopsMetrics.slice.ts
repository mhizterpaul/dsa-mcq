import { createSlice, createEntityAdapter, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { DevOpsMetric } from './primitives/DevOpsMetric';
import { sqliteService } from '../../common/services/sqliteService';

export const hydrateDevOpsMetrics = createAsyncThunk<DevOpsMetric[]>(
    'devopsMetrics/hydrate',
    async () => {
        const metrics = await sqliteService.getAll('devops_metrics');
        // The payload field needs to be parsed from JSON
        return metrics.map(m => ({ ...m, payload: JSON.parse(m.payload) })) as DevOpsMetric[];
    }
);

const devopsMetricsAdapter = createEntityAdapter<DevOpsMetric>({
  selectId: (metric) => metric.id,
});

const devopsMetricsSlice = createSlice({
  name: 'devopsMetrics',
  initialState: devopsMetricsAdapter.getInitialState(),
  reducers: {
    addMetric: devopsMetricsAdapter.addOne,
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateDevOpsMetrics.fulfilled, (state, action) => {
        devopsMetricsAdapter.setAll(state, action.payload);
    });
  },
});

export const { addMetric } = devopsMetricsSlice.actions;
export default devopsMetricsSlice.reducer;
