import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Badge, IconButton } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { EngagementRootState } from '../store/store';
import { markAsReadDb } from '../store/notification.slice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NEON = '#EFFF3C';

const NotificationButton = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: EngagementRootState) => Object.values(state.notifications.entities));
  const hasNewNotifications = notifications.some(n => !n.isRead);

  const handlePress = () => {
    console.log('Opening notifications');
    notifications.forEach(n => {
        if (!n.isRead) {
            dispatch(markAsReadDb(n.id));
        }
    });
  };

  return (
    <View>
      <IconButton
        icon={() => <Icon name="bell-outline" size={26} color={NEON} />}
        onPress={handlePress}
        style={styles.button}
      />
      {hasNewNotifications && (
        <Badge style={styles.badge} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#2A2C2E',
        borderRadius: 20,
        padding: 6,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
    },
});

export default NotificationButton;