import React from 'react';
import { View } from 'react-native-ui-lib';

const ProgressBar = () => {
  return (
    <View row centerV spread marginB-40>
      <View height={4} bg-green30 flex marginR-2 br10 />
      <View height={4} bg-green30 flex marginR-2 br10 />
      <View height={4} bg-green30 flex marginR-2 br10 />
      <View height={4} bg-dark70 flex br10 />
    </View>
  );
};

export default ProgressBar;
