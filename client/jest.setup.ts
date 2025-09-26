import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';
import 'whatwg-fetch';
import { TextEncoder, TextDecoder } from 'util';
import { NativeModules, Platform, LayoutAnimation } from 'react-native';

// ---- Polyfills ----
global.TextEncoder = global.TextEncoder || TextEncoder;
global.TextDecoder = global.TextDecoder || TextDecoder;

if (!global.crypto) {
  global.crypto = {
    getRandomValues: (arr: Uint8Array) =>
      require('crypto').randomBytes(arr.length),
  } as Crypto;
}

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

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: (props: any) => props.children,
    Screen: (props: any) => props.children,
  }),
}));

// ---- Animated Mocks ----
jest.mock('react-native/Libraries/Animated/Animated', () => {
  const ActualAnimated = jest.requireActual(
    'react-native/Libraries/Animated/Animated'
  );

  class AnimatedValue {
    _value: any;
    constructor(value: any) { this._value = value; }
    setValue = jest.fn();
    addListener = jest.fn();
    removeListener = jest.fn();
    removeAllListeners = jest.fn();
    interpolate = jest.fn(() => new AnimatedValue(0));
  }

  return {
    ...ActualAnimated,
    Value: AnimatedValue,
    timing: () => ({ start: jest.fn() }),
    spring: () => ({ start: jest.fn() }),
    decay: () => ({ start: jest.fn() }),
  };
});

// ---- LayoutAnimation Mock ----
jest.mock('react-native/Libraries/LayoutAnimation/LayoutAnimation', () => ({
  configureNext: jest.fn(),
  create: jest.fn(),
  Types: { easeInEaseOut: 'easeInEaseOut' },
  Properties: { opacity: 'opacity', scaleXY: 'scaleXY' },
}));

// ---- TouchableOpacity Stub ----
jest.mock(
  'react-native/Libraries/Components/Touchable/TouchableOpacity',
  () => ({ children }: any) => children
);

// ---- Optional NativeModules Mocks ----
NativeModules.SomeNativeModule = NativeModules.SomeNativeModule || {
  doSomething: jest.fn(),
};

// ---- Platform defaults ----
Platform.OS = 'android';
Platform.Version = 31;
