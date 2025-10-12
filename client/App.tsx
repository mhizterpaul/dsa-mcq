/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, Linking } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import Mediator from './src/index';
import { metricsService } from './src/components/analytics/services/metricsService';
import store, { AppDispatch } from './src/store';
import { loginWithTwitter } from './src/components/user/store/user.slice';

interface AppProps {
  startTime: number;
}

function App({ startTime }: AppProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    const endTime = performance.now();
    const startupTime = endTime - startTime;
    metricsService.logStartupTime(startupTime);

    const handleDeepLink = (event: { url: string }) => {
      if (event.url && event.url.includes('auth/callback?')) {
        dispatch(loginWithTwitter({ url: event.url }));
      }
    };

    Linking.addEventListener('url', handleDeepLink);

    return () => {
      Linking.removeAllListeners('url');
    };
  }, [startTime, dispatch]);

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Mediator />
    </>
  );
}

const AppWithStore = (props: AppProps) => (
  <Provider store={store}>
    <App {...props} />
  </Provider>
);

export default AppWithStore;