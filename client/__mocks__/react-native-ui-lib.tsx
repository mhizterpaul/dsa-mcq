// client/__mocks__/react-native-ui-lib.tsx
import React from 'react';
import { Text as RNText, View as RNView, TouchableOpacity, TextInput } from 'react-native';

const passthrough = (Component: any) => ({ children, ...props }: any) => (
  <Component {...props}>{children}</Component>
);

// Mocked components that accept shorthand props but ignore them
export const Button = ({ label, onPress, testID, ...props }: any) => (
  <TouchableOpacity onPress={onPress} testID={testID || label} {...props}>
    <RNText>{label}</RNText>
  </TouchableOpacity>
);

export const TextField = passthrough(TextInput);
export const Checkbox = passthrough(RNView);
export const View = passthrough(RNView);
export const Text = passthrough(RNText);

