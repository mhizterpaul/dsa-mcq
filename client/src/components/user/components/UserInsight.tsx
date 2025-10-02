import React, { useEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Card, Title, Paragraph, ProgressBar, Colors, Text, Button, ActivityIndicator } from 'react-native-paper';
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
        <View style={styles.centered}>
            <ActivityIndicator animating={true} />
            <Button onPress={handleAddDummyData}>Add Dummy Data</Button>
        </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Your Analytics</Title>
        <Card style={styles.card}>
            <Card.Content>
                <Title>Overall Performance</Title>
                <View style={styles.row}>
                    <Text>Average Performance</Text>
                    <Text style={styles.bold}>{insight.averageQuizPerformance}%</Text>
                </View>
                <ProgressBar progress={insight.averageQuizPerformance / 100} color={Colors.green500} style={styles.progressBar} />
                <View style={styles.row}>
                    <Text>Thinking Archetype</Text>
                    <Text style={styles.bold}>{insight.thinkingArchetype}</Text>
                </View>
            </Card.Content>
        </Card>
        <Card style={styles.card}>
            <Card.Content>
                <Title>Category Performance</Title>
                {insight.attemptedCategories.map((item, index) => (
                    <View key={index} style={styles.categoryItem}>
                        <Text style={styles.bold}>{item.category}</Text>
                        <ProgressBar progress={item.avgPerformance / 100} color={Colors.blue500} style={styles.progressBar} />
                    </View>
                ))}
            </Card.Content>
        </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
  },
  card: {
    marginBottom: 20,
  },
  row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
  },
  progressBar: {
    height: 10,
    marginTop: 5,
  },
  bold: {
      fontWeight: 'bold',
  },
  categoryItem: {
      marginBottom: 10,
  }
});

export default UserInsightComponent;