import React from 'react';
import { Button, View } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { EngagementRootState } from '../store/store';
import { markAsReadDb } from '../store/notification.slice';

const NEON = '#EFFF3C';
const GRAY = '#2A2C2E';

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
      <Button
        iconSource={() => <Icon name="bell-outline" size={26} color={NEON} />}
        onPress={handlePress}
        backgroundColor={GRAY}
        br20
        padding-6
      />
      {hasNewNotifications && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: 'red',
          }}
        />
      )}
    </View>
  );
};

export default NotificationButton;
