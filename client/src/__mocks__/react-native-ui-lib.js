import React from 'react';
import { View as RNView, Text as RNText, TouchableOpacity, Image as RNImage } from 'react-native';

const MockButton = ({ label, onPress, children, ...props }) => (
  <TouchableOpacity onPress={onPress} {...props}>
    <RNText>{label || children}</RNText>
  </TouchableOpacity>
);

MockButton.sizes = {
  xSmall: 'xSmall',
  small: 'small',
  medium: 'medium',
  large: 'large',
};

export const View = RNView;
export const Text = RNText;
export const Button = MockButton;
export const Image = RNImage;
export const Avatar = (props) => <RNView {...props} />;
export const CircularProgressBar = (props) => <RNView {...props} />;
export const Colors = { white: '#fff', black: '#000', grey: '#888', blue: '#00f', yellow: '#ff0' };
export const Typography = {};
export const Spacings = {};

export default {
    View,
    Text,
    Button,
    Image,
    Avatar,
    CircularProgressBar,
    Colors,
    Typography,
    Spacings
};
