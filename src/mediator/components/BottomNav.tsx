import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BottomNav = ({ navigation, activeScreen }: { navigation: any, activeScreen: string }) => {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
        <Icon name="home" size={24} color={activeScreen === 'Home' ? '#FF7A3C' : '#B0B0B0'} />
        <Text style={[styles.navText, activeScreen === 'Home' && { color: '#FF7A3C' }]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Icon name="bookmark" size={24} color={activeScreen === 'Bookmark' ? '#FF7A3C' : '#B0B0B0'} />
        <Text style={[styles.navText, activeScreen === 'Bookmark' && { color: '#FF7A3C' }]}>Bookmark</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Leaderboard')}>
        <Icon name="trophy" size={24} color={activeScreen === 'Leaderboard' ? '#FF7A3C' : '#B0B0B0'} />
        <Text style={[styles.navText, activeScreen === 'Leaderboard' && { color: '#FF7A3C' }]}>Leaderboard</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Icon name="account-circle" size={24} color={activeScreen === 'Profile' ? '#FF7A3C' : '#B0B0B0'} />
        <Text style={[styles.navText, activeScreen === 'Profile' && { color: '#FF7A3C' }]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 18,
    marginBottom: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 11,
    color: '#B0B0B0',
    fontWeight: '600',
    marginTop: 2,
  },
});

export default BottomNav;
