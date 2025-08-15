import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { withEngagementData } from '../../common/hocs/withInitialData';

const AchievementsScreen = () => {
  // This component would display a list of achievements
  // based on the data loaded from the engagement store.
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Achievements</Text>
      <Text>(A list of user achievements would be displayed here.)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

// Wrap the component with the HOC to load engagement data
export default withEngagementData(AchievementsScreen);
