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

  const MockView = (props) => {
      const { useNativeDriver, ...rest } = props;
      return React.createElement(View, rest);
  };

  const Button = (props) => React.createElement(TouchableOpacity, props, React.createElement(Text, null, props.label || props.children));
  Button.sizes = {
    xSmall: 'xSmall',
    small: 'small',
    medium: 'medium',
    large: 'large',
  };
  return {
    View: MockView,
    Text,
    Button,
    Avatar: (props) => React.createElement(View, { ...props, testID: props.testID || 'user-avatar' }),
    Image: (props) => React.createElement(View, props),
    CircularProgressBar: (props) => React.createElement(View, props),
    Colors: {
        white: '#fff', black: '#000', grey: '#888', blue: '#00f', yellow: '#ff0',
        grey10: '#212121', grey80: '#F2F3F5', red10: '#B00020', red80: '#FFEBEE'
    },
    Typography: {
        text60b: { fontSize: 20, fontWeight: 'bold' },
        text70b: { fontSize: 18, fontWeight: 'bold' },
        text80: { fontSize: 16 },
        text80b: { fontSize: 16, fontWeight: 'bold' },
        text90: { fontSize: 14 },
        text100b: { fontSize: 12, fontWeight: 'bold' },
    },
    Spacings: {
        'paddingH-20': 20, 'paddingV-10': 10, 'marginB-20': 20, 'marginT-40': 40,
        'padding-15': 15, 'marginL-10': 10, 'marginT-10': 10, 'marginB-16': 16,
        'paddingV-15': 15, 'padding-20': 20, 'marginB-15': 15, 'marginT-20': 20
    },
  };
});
