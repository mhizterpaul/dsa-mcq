import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Menu, IconButton, Divider } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

type MenuKey = 'coinHistory' | 'profileDetails' | 'weeklyGifts' | 'questions';

export type UserProfileSummaryProps = {
  containerStyle?: object;
};

const UserProfileSummary: React.FC<UserProfileSummaryProps> = ({
  containerStyle,
}) => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const menuItems: { key: MenuKey; label: string; icon: string }[] = useMemo(
    () => [
      { key: 'coinHistory', label: 'Coin history', icon: 'cash-outline' },
      { key: 'profileDetails', label: 'Profile details', icon: 'person-outline' },
      { key: 'weeklyGifts', label: 'Weekly gifts', icon: 'gift-outline' },
      { key: 'questions', label: 'Questions?', icon: 'help-circle-outline' },
    ],
    []
  );

  const onSelectMenuItem = (key: MenuKey) => {
    console.log('Selected menu item:', key);
    closeMenu();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <IconButton
            icon="dots-vertical"
            size={18}
            onPress={openMenu}
            style={styles.menuButton}
          />
        }>
        {menuItems.map((item, idx) => (
          <View key={item.key}>
            <Menu.Item
              onPress={() => onSelectMenuItem(item.key)}
              title={item.label}
              leadingIcon={() => <Ionicons name={item.icon as any} size={16} color="#111" />}
              titleStyle={styles.menuItemText}
            />
            {idx < menuItems.length - 1 && <Divider />}
          </View>
        ))}
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F2F3F5',
    margin: 0,
  },
  menuItemText: {
    color: '#212121', // color_grey10
    fontSize: 16, // text70
  },
});

export default UserProfileSummary;