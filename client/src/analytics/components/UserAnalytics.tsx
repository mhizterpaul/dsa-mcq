import React from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, Card, ProgressBar } from 'react-native-ui-lib';
import { ScrollView } from 'react-native';

const analyticsData = [
  {
    category: 'Data Structures',
    performance: 75,
    level: 'Intermediate',
    personality: 'Analytical',
  },
  {
    category: 'Algorithms',
    performance: 60,
    level: 'Beginner',
    personality: 'Problem Solver',
  },
  {
    category: 'System Design',
    performance: 85,
    level: 'Advanced',
    personality: 'Architect',
  },
];

const UserAnalytics = () => {
  return (
    <View flex bg-grey80 padding-page>
      <Text text40b marginB-20>Your Analytics</Text>
      <ScrollView>
        {analyticsData.map((item, index) => (
          <Card key={index} marginB-20 padding-20>
            <Text text60b marginB-10>{item.category}</Text>
            <View row spread centerV>
              <Text text80>Performance</Text>
              <Text text80b>{item.performance}%</Text>
            </View>
            <ProgressBar
              progress={item.performance}
              progressColor={'#4CAF50'}
              style={styles.progressBar}
            />
            <View row spread centerV marginT-10>
              <Text text80>Level</Text>
              <Text text80b>{item.level}</Text>
            </View>
            <View row spread centerV marginT-10>
              <Text text80>Personality</Text>
              <Text text80b>{item.personality}</Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  progressBar: {
    height: 10,
    marginTop: 5,
  },
});

export default UserAnalytics;
