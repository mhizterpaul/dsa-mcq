import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const GameModes = () => {
  return (
    <View row marginT-22 marginH-18 centerV>
      <TouchableOpacity flex height={74} br20 marginR-10 center bg-orange30 style={{elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4}}>
        <Icon name="plus" size={28} color="#fff" />
        <Text white text80b marginT-6>Create Quiz</Text>
      </TouchableOpacity>
      <TouchableOpacity flex height={74} br20 marginR-10 center bg-purple30 style={{elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4}}>
        <Icon name="account" size={28} color="#fff" />
        <Text white text80b marginT-6>Solo Mode</Text>
      </TouchableOpacity>
      <TouchableOpacity width={36} height={74} br20 center bg-white style={{elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4}}>
        <Icon name="chevron-right" size={28} color="#FF7A3C" />
      </TouchableOpacity>
    </View>
  );
};

export default GameModes;
