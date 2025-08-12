import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../mediator/store/store';
import { addAnomaly } from 'store/anomalies.slice';
import { addDevOpsMetric } from 'store/devOpsMetrics.slice';
import { addEngagementKPI } from 'store/engagementKPIs.slice';
import { addInsight } from 'store/insights.slice';

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