/**
 * @format
 */
const startTime = performance.now();

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';
import { metricsService } from './src/analytics/services/metricsService';
import { applyFetchWrapper } from './src/common/services/fetchWrapper';

// Apply all instrumentation
applyFetchWrapper();
setJSExceptionHandler((error, isFatal) => {
    console.error('Caught JS Exception:', error, isFatal);
    metricsService.logCrash(error, isFatal ? 'critical' : 'high');
}, true);

setNativeExceptionHandler((exceptionString) => {
    console.error('Caught Native Exception:', exceptionString);
    metricsService.logCrash(new Error(exceptionString), 'critical');
});

// Pass the start time to the App component as a prop
const AppWithProps = () => <App startTime={startTime} />;

AppRegistry.registerComponent(appName, () => AppWithProps);
