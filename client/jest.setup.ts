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

// Comprehensive mock for the core Animated library
jest.mock('react-native/Libraries/Animated/Animated', () => {
  const ActualAnimated = jest.requireActual(
    'react-native/Libraries/Animated/Animated',
  );
  const addListener = () => 'listener-id';
  const removeListener = () => {};
  const removeAllListeners = () => {};

  return {
    ...ActualAnimated,
    Value: jest.fn().mockImplementation(() => ({
      __getValue: jest.fn(() => 0),
      setValue: jest.fn(),
      setOffset: jest.fn(),
      addListener: jest.fn(addListener),
      removeListener: jest.fn(removeListener),
      removeAllListeners: jest.fn(removeAllListeners),
      interpolate: jest.fn(() => 0),
    })),
    timing: (value, config) => ({
      start: (callback) => {
        value.setValue(config.toValue);
        if (callback) {
          callback({ finished: true });
        }
      },
      stop: () => {},
    }),
    spring: (value, config) => ({
      start: (callback) => {
        value.setValue(config.toValue);
        if (callback) {
          callback({ finished: true });
        }
      },
      stop: () => {},
    }),
    sequence: (animations) => ({
      start: (callback) => {
        animations.forEach((anim) => anim.start());
        if (callback) {
          callback({ finished: true });
        }
      },
      stop: () => {},
    }),
    parallel: (animations) => ({
      start: (callback) => {
        animations.forEach((anim) => anim.start());
        if (callback) {
          callback({ finished: true });
        }
      },
      stop: () => {},
    }),
    event: jest.fn(() => () => {}),
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
    getRandomValues: (arr) => require('crypto').randomBytes(arr.length),
  };
}

// Ensure global.window is defined (some libs expect it)
if (typeof global.window === 'undefined') {
  global.window = global;
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
      Navigator: ({ children }) =>
        React.createElement(React.Fragment, null, children),
      Screen: ({ children }) =>
        React.createElement(React.Fragment, null, children),
    }),
  };
});