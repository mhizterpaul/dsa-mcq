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
      {/*
        // Add navigation backbutton
        // Ensure to include bottom navigation
      */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16, // Corresponds to padding-page
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GoalScreen;