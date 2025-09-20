import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';
import 'whatwg-fetch';
import { TextEncoder, TextDecoder } from 'util';
import React from 'react';

// Polyfill TextEncoder / TextDecoder for MSW & fetch
global.TextEncoder = global.TextEncoder || TextEncoder;
global.TextDecoder = global.TextDecoder || TextDecoder;

// Polyfill minimal crypto for libraries that need it
if (!global.crypto) {
  global.crypto = {
    getRandomValues: (arr: Uint8Array) =>
      require('crypto').randomBytes(arr.length),
  } as Crypto;
}

// Ensure global.window is defined (some libs expect it)
if (typeof global.window === 'undefined') {
  global.window = global as any;
}

// ---- Navigation Mocks ----
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
    useRoute: () => ({ params: {} }),
  };
});

jest.mock('@react-navigation/stack', () => {
  const React = require('react');
  return {
    createStackNavigator: () => ({
      Navigator: ({ children }: any) => React.createElement(React.Fragment, null, children),
      Screen: ({ children }: any) => React.createElement(React.Fragment, null, children),
    }),
  };
});

// ---- Animated Mock ----
// Prevent annoying warnings from NativeAnimatedHelper
jest.mock('react-native/Libraries/Animated/Animated', () => {
  const ActualAnimated = jest.requireActual(
    'react-native/Libraries/Animated/Animated'
  );
  return {
    ...ActualAnimated,
    timing: () => ({ start: jest.fn() }),
  };
});
