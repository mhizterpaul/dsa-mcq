import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { Anomaly } from '../interface';

const anomaliesAdapter = createEntityAdapter<Anomaly>({
  selectId: (anomaly) => anomaly.id,
});

const anomaliesSlice = createSlice({
  name: 'anomalies',
  initialState: anomaliesAdapter.getInitialState(),
  reducers: {
    addAnomaly: (state, action: PayloadAction<{ id: string; metricId: string; type: 'performance' | 'engagement'; deviation: number }>) => {
      const { id, metricId, type, deviation } = action.payload;
      const newAnomaly = new Anomaly(id, metricId, type, deviation);
      anomaliesAdapter.addOne(state, { ...newAnomaly });
    },
  },
});

export const { addAnomaly } = anomaliesSlice.actions;

export default anomaliesSlice.reducer;
