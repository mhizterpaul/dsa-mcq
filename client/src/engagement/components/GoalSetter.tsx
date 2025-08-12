import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NEON = '#EFFF3C';
const DARK = '#181A1B';
const GRAY = '#2A2C2E';

const GoalSetter = ({ onSetTarget }: { onSetTarget: () => void }) => {
  return (
    <View style={styles.goalSection}>
      <Text style={styles.goalTitle}>Set Your Next Goal</Text>
      <TouchableOpacity style={styles.goalBtn} onPress={onSetTarget}>
        <Icon name="target" size={20} color={DARK} />
        <Text style={styles.goalBtnText}>Set Target</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  goalSection: {
    width: '90%',
    backgroundColor: GRAY,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    marginBottom: 18,
  },
  goalTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 10,
  },
  goalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEON,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginTop: 4,
  },
  goalBtnText: {
    color: DARK,
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
});

export default GoalSetter;
