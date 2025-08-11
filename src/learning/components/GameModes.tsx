import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const GameModes = () => {
  return (
    <View style={styles.modesRow}>
      <TouchableOpacity style={[styles.modeBox, { backgroundColor: '#FF7A3C' }]}>
        <Icon name="plus" size={28} color="#fff" />
        <Text style={styles.modeText}>Create Quiz</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.modeBox, { backgroundColor: '#7B61FF' }]}>
        <Icon name="account" size={28} color="#fff" />
        <Text style={styles.modeText}>Solo Mode</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.modeBox, { backgroundColor: '#2EC4B6' }]}>
        <Icon name="account-group" size={28} color="#fff" />
        <Text style={styles.modeText}>Multiplayer</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.arrowBox}>
        <Icon name="chevron-right" size={28} color="#FF7A3C" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  modesRow: {
    flexDirection: 'row',
    marginTop: 22,
    marginHorizontal: 18,
    alignItems: 'center',
  },
  modeBox: {
    flex: 1,
    height: 74,
    borderRadius: 16,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  arrowBox: {
    width: 36,
    height: 74,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  modeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    marginTop: 6,
  },
});

export default GameModes;
