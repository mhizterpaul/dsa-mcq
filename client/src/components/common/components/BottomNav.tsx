import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple, Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

const BottomNav = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const activeScreen = route.name;

  const navItems = [
    { name: 'Home', icon: 'home', navigateTo: 'Home' },
    { name: 'Bookmark', icon: 'bookmark', navigateTo: 'Bookmark' },
    { name: 'Achievement', icon: 'seal', navigateTo: 'Achievement' },
    { name: 'Profile', icon: 'account-circle', navigateTo: 'Profile' },
  ];

  return (
    <Surface style={styles.container}>
      {navItems.map((item) => {
        const isActive = activeScreen === item.name;
        const color = isActive ? '#FF7A3C' : '#B0B0B0';

        return (
          <TouchableRipple
            key={item.name}
            onPress={() => navigation.navigate(item.navigateTo as never)}
            style={styles.navItem}
            rippleColor="rgba(0, 0, 0, .32)"
            accessibilityLabel={item.name}
            testID={item.name === 'Achievement' ? 'banner-achievement' : undefined}
          >
            <View style={styles.navItemContent}>
              <Icon name={item.icon} size={24} color={color} />
              <Text style={[styles.navItemText, { color }]}>{item.name}</Text>
            </View>
          </TouchableRipple>
        );
      })}
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 18,
    marginBottom: 12,
    paddingVertical: 8,
    elevation: 4, // More pronounced shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    justifyContent: 'space-around',
  },
  navItem: {
    flex: 1,
    borderRadius: 15,
  },
  navItemContent: {
    alignItems: 'center',
  },
  navItemText: {
    fontSize: 12, // text90
    fontWeight: '600',
    marginTop: 2,
  },
});

export default BottomNav;