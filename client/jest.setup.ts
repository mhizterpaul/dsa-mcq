import { NativeModules } from 'react-native';

// Mock the specific native module that's causing the crash
NativeModules.StatusBarManager = {
  getHeight: jest.fn(() => 20),
  setColor: jest.fn(),
  setStyle: jest.fn(),
  setNetworkActivityIndicatorVisible: jest.fn(),
  setHidden: jest.fn(),
};

import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';

// Mock for react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Comprehensive mock for the core Animated library
jest.mock('react-native/Libraries/Animated/Animated', () => {
  const ActualAnimated = jest.requireActual('react-native/Libraries/Animated/Animated');
  return {
    ...ActualAnimated,
    Value: jest.fn(() => ({
      __getValue: jest.fn(() => 0),
      setValue: jest.fn(),
      setOffset: jest.fn(),
      addListener: jest.fn(() => 'listener-id'),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      interpolate: jest.fn(() => 0),
    })),
    timing: (value, config) => ({
      start: (callback) => {
        if (callback) {
          callback({ finished: true });
        }
      },
      stop: jest.fn(),
    }),
    spring: (value, config) => ({
      start: (callback) => {
        if (callback) {
          callback({ finished: true });
        }
      },
      stop: jest.fn(),
    }),
  };
});

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
