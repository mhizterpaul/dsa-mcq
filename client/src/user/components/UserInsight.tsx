import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, Card, ProgressBar, Button } from 'react-native-ui-lib';
import { ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { UserRootState } from '../store';
import { setUserInsight } from '../store/userInsight.slice';
import { UserInsight } from '../store/primitives/UserInsight';

const UserInsightComponent = () => {
    const insight = useSelector((state: UserRootState) => state.insight.insight);
    const dispatch = useDispatch();

    const handleAddDummyData = () => {
        const dummyInsight = new UserInsight('user1');
        dummyInsight.averageQuizPerformance = 75;
        dummyInsight.thinkingArchetype = 'Analytical';
        dummyInsight.attemptedCategories = [{ category: 'Data Structures', avgPerformance: 75 }];
        dispatch(setUserInsight(dummyInsight));
    };

    useEffect(() => {
        handleAddDummyData();
    }, []);

  if (!insight) {
    return (
        <View center>
            <Text>Loading...</Text>
            <Button label="Add Dummy Data" onPress={handleAddDummyData} />
        </View>
    )
  }

  return (
    <View flex bg-grey80 padding-page>
      <Text text40b marginB-20>Your Analytics</Text>
      <ScrollView>
            <Card marginB-20 padding-20>
              <Text text60b marginB-10>Overall Performance</Text>
              <View row spread centerV>
                <Text text80>Average Performance</Text>
                <Text text80b>{insight.averageQuizPerformance}%</Text>
              </View>
              <ProgressBar
                progress={insight.averageQuizPerformance}
                progressColor={'#4CAF50'}
                style={styles.progressBar}
              />
              <View row spread centerV marginT-10>
                <Text text80>Thinking Archetype</Text>
                <Text text80b>{insight.thinkingArchetype}</Text>
              </View>
            </Card>
            <Card marginB-20 padding-20>
                <Text text60b marginB-10>Category Performance</Text>
                {insight.attemptedCategories.map((item, index) => (
                    <View key={index}>
                        <Text text70b>{item.category}</Text>
                        <ProgressBar
                            progress={item.avgPerformance}
                            progressColor={'#4CAF50'}
                            style={styles.progressBar}
                        />
                    </View>
                ))}
            </Card>
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

export default UserInsightComponent;
