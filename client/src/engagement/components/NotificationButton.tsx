import React from 'react';
import { Button } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NEON = '#EFFF3C';
const GRAY = '#2A2C2E';

const NotificationButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <Button
      iconSource={() => <Icon name="bell-outline" size={26} color={NEON} />}
      onPress={onPress}
      backgroundColor={GRAY}
      br20
      padding-6
    />
  );
};

export default NotificationButton;
