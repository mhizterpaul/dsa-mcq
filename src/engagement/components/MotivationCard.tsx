import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NEON = '#EFFF3C';
const DARK = '#181A1B';

const MotivationCard = () => {
  return (
    <View style={styles.motivationCard}>
      <Icon
        name="star-circle"
        size={28}
        color={DARK}
        style={styles.motivationIcon}
      />
      <Text style={styles.motivationText}>
        Keep going! Every quiz makes you better!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  motivationCard: {
    width: '90%',
    backgroundColor: NEON,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    marginBottom: 18,
    shadowColor: NEON,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  motivationIcon: {
    marginRight: 12,
  },
  motivationText: {
    color: DARK,
    fontWeight: 'bold',
    fontSize: 15,
    flex: 1,
  },
});

export default MotivationCard;
