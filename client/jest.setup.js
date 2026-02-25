global.IS_REACT_ACT_ENVIRONMENT = true;

import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';
import 'whatwg-fetch';

process.env.GEMINI_API_KEY = 'test-key';

// Ensure TextEncoder/Decoder are available (required by MSW 2)
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock react-native-vector-icons
const mockIcon = (name) => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  const Icon = (props) => {
    return React.createElement(View, { testID: props.testID, accessibilityLabel: props.accessibilityLabel }, React.createElement(Text, null, name));
  };
  Icon.Button = (props) => {
    return React.createElement(TouchableOpacity, {
        testID: props.testID,
        accessibilityLabel: props.accessibilityLabel,
        onPress: props.onPress
    }, React.createElement(Text, null, name));
  };
  Icon.loadFont = () => Promise.resolve();
  Icon.getImageSource = () => Promise.resolve({});
  return Icon;
};

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => mockIcon('MaterialCommunityIcons'));
jest.mock('react-native-vector-icons/Ionicons', () => mockIcon('Ionicons'));
jest.mock('react-native-vector-icons/Feather', () => mockIcon('Feather'));
jest.mock('react-native-vector-icons/MaterialIcons', () => mockIcon('MaterialIcons'));
jest.mock('react-native-vector-icons/FontAwesome', () => mockIcon('FontAwesome'));

// Mock react-native core
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  // InteractionManager mock
  const mockIM = {
    runAfterInteractions: jest.fn(cb => {
        if (cb) {
            const p = Promise.resolve();
            cb();
            return { then: (onF) => p.then(onF), done: jest.fn() };
        }
        return { then: (onF) => Promise.resolve().then(onF), done: jest.fn() };
    }),
    createInteractionHandle: jest.fn(() => 1),
    clearInteractionHandle: jest.fn(),
    setDeadline: jest.fn(),
  };

  Object.defineProperty(RN, 'InteractionManager', {
    get: () => mockIM,
    configurable: true,
  });

  return RN;
});

jest.mock('react-native/src/private/animated/NativeAnimatedHelper');

// Mock react-native-ui-lib
jest.mock('react-native-ui-lib', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  const Button = (props) => React.createElement(TouchableOpacity, props, React.createElement(Text, null, props.label || props.children));
  Button.sizes = {
    xSmall: 'xSmall',
    small: 'small',
    medium: 'medium',
    large: 'large',
  };
  return {
    View,
    Text,
    Button,
    Avatar: (props) => React.createElement(View, props),
    Image: (props) => React.createElement(View, props),
    CircularProgressBar: (props) => React.createElement(View, props),
    Colors: { white: '#fff', black: '#000', grey: '#888', blue: '#00f', yellow: '#ff0' },
    Typography: {},
    Spacings: {},
  };
});
