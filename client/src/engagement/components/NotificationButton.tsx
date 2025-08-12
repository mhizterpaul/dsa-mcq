import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NEON = '#EFFF3C';
const GRAY = '#2A2C2E';

const NotificationButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.notifBtn} onPress={onPress}>
      <Icon name="bell-outline" size={26} color={NEON} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  notifBtn: {
    backgroundColor: GRAY,
    borderRadius: 18,
    padding: 6,
  },
});

export default NotificationButton;
