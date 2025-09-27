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

// ---- Animated Mocks ----
jest.mock('react-native/src/private/animated/NativeAnimatedHelper', () => ({
  API: {},
  addWhitelistedNativeProps: jest.fn(),
  addWhitelistedUIProps: jest.fn(),
  validateTransform: jest.fn(),
  validateStyles: jest.fn(),
  validateInterpolation: jest.fn(),
  generateNewNodeTag: jest.fn(() => 1),
  generateNewAnimationId: jest.fn(() => 1),
  assertNativeAnimatedModule: jest.fn(),
  shouldUseNativeDriver: jest.fn(() => false),
}));


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


// ---- Platform defaults ----
Platform.OS = 'android';
Platform.Version = 31;
