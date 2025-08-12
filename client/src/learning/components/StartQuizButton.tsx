import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NEON = '#EFFF3C';
const DARK = '#181A1B';

const StartQuizButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <Text style={styles.actionBtnText}>Take Quiz Now</Text>
      <Icon name="arrow-right" size={22} color={DARK} style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEON,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  actionBtnText: {
    color: DARK,
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
});

export default StartQuizButton;
