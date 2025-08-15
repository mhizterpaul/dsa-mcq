import React from 'react';
import { View, Text, Button } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NEON = '#EFFF3C';
const DARK = '#181A1B';
const GRAY = '#2A2C2E';

const GoalSetter = ({ onSetTarget }: { onSetTarget: () => void }) => {
  return (
    <View center bg-grey20 br20 padding-18 marginB-18 style={{width: '90%'}}>
      <Text white text70b marginB-10>Set Your Next Goal</Text>
      <Button
        label="Set Target"
        iconSource={() => <Icon name="target" size={20} color={DARK} />}
        onPress={onSetTarget}
        backgroundColor={NEON}
        color={DARK}
        br12
        paddingH-18
        paddingV-8
        marginT-4
      />
    </View>
  );
};

export default GoalSetter;
