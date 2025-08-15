import React from 'react';
import { View, Text } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const UserScore = ({ score }: { score: number }) => {
  return (
    <View row centerV bg-grey10 br12 paddingH-12 paddingV-6>
      <Icon name="diamond" size={18} color="#fff" />
      <Text white text80b marginL-6>{score}</Text>
    </View>
  );
};

export default UserScore;
