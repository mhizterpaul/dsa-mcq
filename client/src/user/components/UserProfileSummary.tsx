import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type MenuKey = 'coinHistory' | 'profileDetails' | 'weeklyGifts' | 'questions';

export type UserProfileSummaryProps = {
  visible: boolean;
  onOpen: () => void;
  onClose?: () => void;
  onSelectMenuItem?: (key: MenuKey) => void;
  containerStyle?: object;
  dropdownOffsetY?: number;
};

const UserProfileSummary: React.FC<UserProfileSummaryProps> = ({
  visible,
  onOpen,
  onClose,
  onSelectMenuItem,
  containerStyle,
  dropdownOffsetY = 8,
}) => {

  const menuItems: { key: MenuKey; label: string; icon: string }[] = useMemo(
    () => [
      { key: 'coinHistory', label: 'Coin history', icon: 'cash-outline' },
      { key: 'profileDetails', label: 'Profile details', icon: 'person-outline' },
      { key: 'weeklyGifts', label: 'Weekly gifts', icon: 'gift-outline' },
      { key: 'questions', label: 'Questions?', icon: 'help-circle-outline' },
    ],
    []
  );

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
        <View style={[styles.dropdown, { top: 28 + dropdownOffsetY, right: 0 }]}> 
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => {
                onSelectMenuItem?.(item.key);
                onClose?.();
              }}
              style={[styles.menuItem, idx < menuItems.length - 1 && styles.menuItemDivider]}
              activeOpacity={0.8}
            >
              <Ionicons name={item.icon as any} size={16} color="#111" style={{ marginRight: 8 }} />
              <Text style={styles.menuItemText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    top: 36,
    right: 0,
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
  menuItemText: { color: '#111', fontSize: 14, fontWeight: '600' },
});

export default UserProfileSummary;
