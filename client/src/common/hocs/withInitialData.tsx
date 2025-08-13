import React, { useEffect, useState } from 'react';
import { sqliteService } from '../services/sqliteService';
import { syncService } from '../services/syncService';

// Import all stores and hydrate actions
import learningStore from '../../learning/store/store';
import { hydrateCategories } from '../../learning/store/category.slice';
import { hydrateLearningSession } from '../../learning/store/learningSession.slice';
import { hydrateUserQuestionData } from '../../learning/store/userQuestionData.slice';

import engagementStore from '../../engagement/store/store';
import { hydrateNotifications } from '../../engagement/store/notification.slice';
import { hydrateUserEngagements } from '../../engagement/store/userEngagement.slice';

const learningHydrationActions = [hydrateCategories, hydrateLearningSession, hydrateUserQuestionData];
const engagementHydrationActions = [hydrateNotifications, hydrateUserEngagements];

// Generic HOC factory
const createDataWrapper = (
  actions: any[],
  store: any,
  domainName: string,
) => <P extends object>(
  WrappedComponent: React.ComponentType<P>,
): React.FC<P> => {
  const ComponentWithData: React.FC<P> = (props) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const initialize = async () => {
        try {
          console.log(`[HOC] Initializing ${domainName} data...`);
          await sqliteService.init();

          const dispatch = store.dispatch as typeof store.dispatch;
          for (const actionCreator of actions) {
            await dispatch(actionCreator());
          }

          console.log(`[HOC] ${domainName} state hydrated.`);
          syncService.performSync();

        } catch (error) {
          console.error(`[HOC] Failed to initialize ${domainName} data:`, error);
        } finally {
          setIsLoading(false);
        }
      };

      initialize();
    }, []);

    if (isLoading) return null;
    return <WrappedComponent {...props} />;
  };

  return React.memo(ComponentWithData);
};

// Export specific HOCs for each domain
export const withLearningData = createDataWrapper(learningHydrationActions, learningStore, 'learning');
export const withEngagementData = createDataWrapper(engagementHydrationActions, engagementStore, 'engagement');
