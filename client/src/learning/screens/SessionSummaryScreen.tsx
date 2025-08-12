import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { withLearningData } from '../../common/hocs/withInitialData';

const SessionSummaryScreen = () => {
  // In a real implementation, this component would use hooks
  // to access the session summary data from the Redux store.
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session Summary</Text>
      <Text>(A summary of the user's performance would be displayed here.)</Text>
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

// Wrap the component with the HOC to load learning data
export default withLearningData(SessionSummaryScreen);
