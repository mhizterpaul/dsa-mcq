/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import Mediator from './src/mediator';
import { metricsService } from './src/analytics/services/metricsService';

interface AppProps {
  startTime: number;
}

function App({ startTime }: AppProps) {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const endTime = performance.now();
    const startupTime = endTime - startTime;
    metricsService.logStartupTime(startupTime);
  }, [startTime]);

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Mediator />
    </>
  );
}

export default App;
