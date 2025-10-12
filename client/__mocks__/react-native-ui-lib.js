import React from 'react';
const uilib = jest.requireActual('react-native-ui-lib');

module.exports = {
  ...uilib,
  View: (props) => <div {...props} />,
  Text: (props) => <p {...props} />,
  Button: (props) => <button {...props} />,
  Image: (props) => <img {...props} />,
  Avatar: (props) => <div {...props} />,
};