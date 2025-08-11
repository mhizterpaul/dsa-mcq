import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const UserScore = ({ score }: { score: number }) => {
  return (
    <View style={styles.scoreBox}>
      <Icon name="diamond" size={18} color="#fff" />
      <Text style={styles.scoreText}>{score}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22223B',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 60,
    justifyContent: 'center',
  },
  scoreText: { color: '#fff', fontWeight: 'bold', marginLeft: 6, fontSize: 15 },
});

export default UserScore;
