import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const RecentQuizzes = () => {
  return (
    <View style={styles.recentRow}>
      <Text style={styles.sectionTitle}>Recent Quiz</Text>
      <TouchableOpacity>
        <Text style={styles.seeAll}>See All</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 18,
    marginTop: 28,
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  seeAll: {
    color: '#FF7A3C',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

export default RecentQuizzes;
