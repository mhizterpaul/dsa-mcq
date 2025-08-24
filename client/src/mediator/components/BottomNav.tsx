import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

const BottomNav = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const activeScreen = route.name;

  return (
    <View row bg-white br20 marginH-18 marginB-12 paddingV-8 style={{elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4}}>
      <TouchableOpacity flex center onPress={() => navigation.navigate('Home')}>
        <Icon name="home" size={24} color={activeScreen === 'Home' ? '#FF7A3C' : '#B0B0B0'} />
        <Text text90 color={activeScreen === 'Home' ? '#FF7A3C' : '#B0B0B0'} style={{fontWeight: '600', marginTop: 2}}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity flex center onPress={() => navigation.navigate('Bookmark')}>
        <Icon name="bookmark" size={24} color={activeScreen === 'Bookmark' ? '#FF7A3C' : '#B0B0B0'} />
        <Text text90 color={activeScreen === 'Bookmark' ? '#FF7A3C' : '#B0B0B0'} style={{fontWeight: '600', marginTop: 2}}>Bookmark</Text>
      </TouchableOpacity>
      <TouchableOpacity flex center onPress={() => navigation.navigate('Achievement')}>
        <Icon name="seal" size={24} color={activeScreen === 'Achievement' ? '#FF7A3C' : '#B0B0B0'} />
        <Text text90 color={activeScreen === 'Achievement' ? '#FF7A3C' : '#B0B0B0'} style={{fontWeight: '600', marginTop: 2}}>Achievement</Text>
      </TouchableOpacity>
      <TouchableOpacity flex center onPress={() => navigation.navigate('Profile')}>
        <Icon name="account-circle" size={24} color={activeScreen === 'Profile' ? '#FF7A3C' : '#B0B0B0'} />
        <Text text90 color={activeScreen === 'Profile' ? '#FF7A3C' : '#B0B0B0'} style={{fontWeight: '600', marginTop: 2}}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomNav;
