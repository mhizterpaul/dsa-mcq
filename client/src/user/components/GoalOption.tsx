import React from 'react';
import { Button, View, Text } from 'react-native-ui-lib';
import Feather from 'react-native-vector-icons/Feather';

const GoalOption = ({ icon, label }: { icon: string, label: string }) => {
  return (
    <Button
      marginB-15
      style={{borderRadius: 15, padding: 15, width: '100%'}}
      backgroundColor="#222"
    >
      <View row centerV>
          <Feather name={icon} size={20} color="white" />
          <Text white marginL-15>{label}</Text>
      </View>
    </Button>
  );
};

export default GoalOption;
