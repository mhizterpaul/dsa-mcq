import React from 'react';
const uilib = jest.requireActual('react-native-ui-lib');

module.exports = {
  ...uilib,
  View: ({onPress, ...props}) => <div onClick={onPress} {...props} />,
  Text: (props) => <p {...props} />,
  Button: ({onPress, ...props}) => <button onClick={onPress} {...props} />,
  Image: (props) => <img {...props} />,
  Avatar: (props) => <div {...props} />,
};
