import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store'; // Assuming a root store will be created
import {
  addAnomaly,
  addDevOpsMetric,
  addEngagementKPI,
  addInsight,
} from '../store';

export const useAnalytics = () => {
  const dispatch = useDispatch();

  const analyticsState = useSelector((state: RootState) => state.analytics);

  return {
    analyticsState,
    actions: {
      addAnomaly: (anomaly: any) => dispatch(addAnomaly(anomaly)),
      addDevOpsMetric: (metric: any) => dispatch(addDevOpsMetric(metric)),
      addEngagementKPI: (kpi: any) => dispatch(addEngagementKPI(kpi)),
      addInsight: (insight: any) => dispatch(addInsight(insight)),
    },
  };
};
