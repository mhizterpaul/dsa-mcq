import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AppNavigator from './navigation/navigator';
import { UserComponent } from './components/user/interface';
import { LearningComponent } from './components/learning/interface';
import { EngagementComponent } from './components/engagement/interface';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './store';

const Mediator: React.FC = () => {
  const [initialRoute, setInitialRoute] = useState<'Welcome' | 'Home' | null>(null);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    const initialize = async () => {
      const userComponent = new UserComponent();
      const user = await userComponent.hydrateUser();

      if (user) {
        // User exists, hydrate other components and go to Home
        const learningComponent = new LearningComponent();
        const engagementComponent = new EngagementComponent();

        await Promise.all([
            learningComponent.hydrate(dispatch),
            engagementComponent.hydrate(dispatch),
        ]);

        setInitialRoute('Home');
      } else {
        // No user found, go to Welcome screen
        setInitialRoute('Welcome');
      }
    };

    initialize();
  }, [dispatch]);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <AppNavigator initialRouteName={initialRoute} />;
};

export default Mediator;
