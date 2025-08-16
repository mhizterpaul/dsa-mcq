import React, { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, TouchableOpacity, Card } from 'react-native-ui-lib';
import Ionicons from 'react-native-vector-icons/Ionicons';

type MenuKey = 'coinHistory' | 'profileDetails' | 'weeklyGifts' | 'questions';

export type UserProfileSummaryProps = {
  containerStyle?: object;
  dropdownOffsetY?: number;
};

const UserProfileSummary: React.FC<UserProfileSummaryProps> = ({
  containerStyle,
  dropdownOffsetY = 8,
}) => {
  const [visible, setVisible] = useState(false);

  const menuItems: { key: MenuKey; label: string; icon: string }[] = useMemo(
    () => [
      { key: 'coinHistory', label: 'Coin history', icon: 'cash-outline' },
      { key: 'profileDetails', label: 'Profile details', icon: 'person-outline' },
      { key: 'weeklyGifts', label: 'Weekly gifts', icon: 'gift-outline' },
      { key: 'questions', label: 'Questions?', icon: 'help-circle-outline' },
    ],
    []
  );

  const onOpen = () => setVisible(true);
  const onClose = () => setVisible(false);

  const onSelectMenuItem = (key: MenuKey) => {
    console.log('Selected menu item:', key);
    onClose();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        accessibilityLabel="Open profile menu"
        onPress={onOpen}
        style={styles.menuButton}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="ellipsis-vertical" size={18} color="#111" />
      </TouchableOpacity>

      {visible && (
        <Card style={[styles.dropdown, { top: 28 + dropdownOffsetY, right: 0 }]}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => onSelectMenuItem(item.key)}
              style={[styles.menuItem, idx < menuItems.length - 1 && styles.menuItemDivider]}
              activeOpacity={0.8}
            >
              <Ionicons name={item.icon as any} size={16} color="#111" style={{ marginRight: 8 }} />
              <Text text70 color_grey10>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'relative' },
  menuButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F3F5',
    marginLeft: 8,
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 4,
    minWidth: 170,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  menuItemDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
});

export default UserProfileSummary;
