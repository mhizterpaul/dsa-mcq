import React from 'react';
const uilib = jest.requireActual('react-native-ui-lib');

const MockButton = ({onPress, ...props}) => <button onClick={onPress} {...props} />;
MockButton.sizes = {
  xSmall: 'xSmall',
  small: 'small',
  medium: 'medium',
  large: 'large',
};

module.exports = {
  ...uilib,
  View: ({onPress, ...props}) => <div onClick={onPress} {...props} />,
  Text: (props) => <p {...props} />,
  Button: MockButton,
  Image: (props) => <img {...props} />,
  Avatar: (props) => <div {...props} />,
};
