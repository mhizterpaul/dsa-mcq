import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Avatar, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = { Leaderboard: undefined; };
type NavigationProp = StackNavigationProp<RootStackParamList, 'Leaderboard'>;

interface WeeklyKingOfQuizProps {
    navigation: NavigationProp;
}

const WeeklyKingOfQuiz: React.FC<WeeklyKingOfQuizProps> = ({ navigation }) => {
  const king = useSelector((state: RootState) => state.engagement.globalEngagement.engagement.weeklyKingOfQuiz);

  if (!king) {
    return (
        <View style={styles.loadingContainer}>
            <Text>Loading...</Text>
        </View>
    )
  }

  const handlePress = () => {
    navigation.navigate('Leaderboard');
  };

  return (
    <Card style={styles.card} testID="weeklyKing" onPress={handlePress}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>This week's</Text>
          <Text style={styles.subtitle}>King of the Quiz</Text>
        </View>
        <View style={styles.kingInfoContainer}>
          <Avatar.Image size={60} source={{uri: king.avatar}} />
          <Text style={styles.kingName}>{king.name}</Text>
          <View style={styles.scoreContainer}>
              <Icon name="diamond" size={14} color="#FFBE0B" />
              <Text style={styles.scoreText}>{king.score} diamonds</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 18,
  },
  card: {
    backgroundColor: '#9B59B6', // bg-purple20
    borderRadius: 20, // br20
    marginHorizontal: 18, // marginH-18
    marginTop: 18, // marginT-18
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18, // padding-18
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 18, // text70b
    fontWeight: 'bold', // text70b
  },
  subtitle: {
    color: 'white',
    fontSize: 24, // text60b
    fontWeight: 'bold', // text60b
  },
  kingInfoContainer: {
    alignItems: 'center',
  },
  kingName: {
    color: 'white',
    fontSize: 14, // text80b
    fontWeight: 'bold', // text80b
    marginTop: 4, // marginT-4
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 14, // text80b
    fontWeight: 'bold',
    color: '#FFBE0B', // color-yellow30
    marginLeft: 4, // marginL-4
  },
});

export default WeeklyKingOfQuiz;