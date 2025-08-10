import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Anomaly } from '../interface';

const anomaliesAdapter = createEntityAdapter<Anomaly>({
  selectId: (anomaly) => anomaly.id,
});

const anomaliesSlice = createSlice({
  name: 'anomalies',
  initialState: anomaliesAdapter.getInitialState(),
  reducers: {
    addAnomaly: anomaliesAdapter.addOne,
    addAnomalies: anomaliesAdapter.addMany,
    updateAnomaly: anomaliesAdapter.updateOne,
    removeAnomaly: anomaliesAdapter.removeOne,
    setAnomalies: anomaliesAdapter.setAll,
  },
});

export const {
  addAnomaly,
  addAnomalies,
  updateAnomaly,
  removeAnomaly,
  setAnomalies,
} = anomaliesSlice.actions;

export default anomaliesSlice.reducer;
