import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../mediator/store/store';
import { addAnomaly } from '../../analytics/store/anomalies.slice';
import { addDevOpsMetric } from '../../analytics/store/devOpsMetrics.slice';
import { addEngagementKPI } from '../../analytics/store/engagementKPIs.slice';
import { addInsight } from '../../analytics/store/insights.slice';

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
