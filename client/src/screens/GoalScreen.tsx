import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import GoalSetter from '../components/user/components/GoalSetter';

interface GoalScreenProps {
    navigation: StackNavigationProp<any>;
}

const GoalScreen = ({ navigation }: GoalScreenProps) => {
  return (
    <View style={styles.container}>
      <GoalSetter navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});

export default GoalScreen;
