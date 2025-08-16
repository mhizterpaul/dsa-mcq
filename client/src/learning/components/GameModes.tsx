import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { LearningRootState } from '../store';

const GameModes = () => {
    const gameModes = useSelector((state: LearningRootState) => state.gameModes.modes);

    const handlePress = (modeName: string) => {
        console.log('Selected game mode:', modeName);
    }

  return (
    <View row marginT-22 marginH-18 centerV>
        {gameModes.map((mode) => (
            <TouchableOpacity key={mode.id} flex height={74} br20 marginR-10 center style={{backgroundColor: mode.color, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4}} onPress={() => handlePress(mode.name)}>
                <Icon name={mode.icon} size={28} color="#fff" />
                <Text white text80b marginT-6>{mode.name}</Text>
            </TouchableOpacity>
        ))}
      <TouchableOpacity width={36} height={74} br20 center bg-white style={{elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4}} onPress={() => handlePress('More')}>
        <Icon name="chevron-right" size={28} color="#FF7A3C" />
      </TouchableOpacity>
    </View>
  );
};

export default GameModes;
