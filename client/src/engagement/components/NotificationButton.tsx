import React from 'react';
import { Button, View } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { EngagementRootState } from '../store/store';
import { setHasNewNotifications } from '../store/notification.slice';

const NEON = '#EFFF3C';
const GRAY = '#2A2C2E';

const NotificationButton = () => {
  const dispatch = useDispatch();
  const hasNewNotifications = useSelector((state: EngagementRootState) => state.notifications.hasNewNotifications);

  const handlePress = () => {
    console.log('Opening notifications');
    dispatch(setHasNewNotifications(false));
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
