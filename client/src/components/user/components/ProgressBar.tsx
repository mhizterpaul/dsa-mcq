import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ProgressBar as PaperProgressBar, Colors } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { UserRootState } from '../store';

const ProgressBar = () => {
  const goals = useSelector((state: UserRootState) => state.profile.profile?.goals);

  if (!goals || goals.length === 0) {
    // Render a default state if there are no goals
    return (
      <View style={styles.container}>
        <PaperProgressBar progress={0} color={Colors.grey300} style={styles.progressBar} />
      </View>
    );
  }

  const completedGoals = goals.filter((goal) => goal.completed).length;
  const progress = goals.length > 0 ? completedGoals / goals.length : 0;

  return (
    <View style={styles.container}>
      <PaperProgressBar progress={progress} color={Colors.green500} style={styles.progressBar} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 40,
    paddingHorizontal: 20,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
});

export default ProgressBar;