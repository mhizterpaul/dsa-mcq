import React from 'react';
import { Button } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NEON = '#EFFF3C';
const DARK = '#181A1B';

const StartQuizButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <Button
      label="Take Quiz Now"
      iconSource={() => <Icon name="arrow-right" size={22} color={DARK} />}
      iconOnRight
      onPress={onPress}
      backgroundColor={NEON}
      color={DARK}
      br20
      paddingV-16
      paddingH-32
      marginT-10
      marginB-24
    />
  );
};

export default StartQuizButton;
