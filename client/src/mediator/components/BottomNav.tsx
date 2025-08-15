import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BottomNav = ({ navigation, activeScreen }: { navigation: any, activeScreen: string }) => {
  return (
    <View row bg-white br20 marginH-18 marginB-12 paddingV-8 style={{elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4}}>
      <TouchableOpacity flex center onPress={() => navigation.navigate('Home')}>
        <Icon name="home" size={24} color={activeScreen === 'Home' ? '#FF7A3C' : '#B0B0B0'} />
        <Text text90 color={activeScreen === 'Home' ? '#FF7A3C' : '#B0B0B0'} style={{fontWeight: '600', marginTop: 2}}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity flex center>
        <Icon name="bookmark" size={24} color={activeScreen === 'Bookmark' ? '#FF7A3C' : '#B0B0B0'} />
        <Text text90 color={activeScreen === 'Bookmark' ? '#FF7A3C' : '#B0B0B0'} style={{fontWeight: '600', marginTop: 2}}>Bookmark</Text>
      </TouchableOpacity>
      <TouchableOpacity flex center onPress={() => navigation.navigate('Leaderboard')}>
        <Icon name="trophy" size={24} color={activeScreen === 'Leaderboard' ? '#FF7A3C' : '#B0B0B0'} />
        <Text text90 color={activeScreen === 'Leaderboard' ? '#FF7A3C' : '#B0B0B0'} style={{fontWeight: '600', marginTop: 2}}>Leaderboard</Text>
      </TouchableOpacity>
      <TouchableOpacity flex center>
        <Icon name="account-circle" size={24} color={activeScreen === 'Profile' ? '#FF7A3C' : '#B0B0B0'} />
        <Text text90 color={activeScreen === 'Profile' ? '#FF7A3C' : '#B0B0B0'} style={{fontWeight: '600', marginTop: 2}}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomNav;
