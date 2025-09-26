import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { EngagementRootState } from '../../engagement/store/store';
import { setDailyQuiz } from '../../engagement/store/globalEngagement.slice';
import { DailyQuiz } from '../../engagement/store/primitives/globalEngagement';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = { DailyQuiz: undefined; };
type NavigationProp = StackNavigationProp<RootStackParamList, 'DailyQuiz'>;

interface DailyQuizBannerProps {
    navigation: NavigationProp;
}

const DailyQuizBanner: React.FC<DailyQuizBannerProps> = ({ navigation }) => {
  const dailyQuiz = useSelector((state: EngagementRootState) => state.globalEngagement.engagement.dailyQuiz);
  const dispatch = useDispatch();

  const handleAddDummyData = () => {
    const dummyQuiz: DailyQuiz = {
      title: 'Daily Quiz',
      description: 'Join a quiz to win diamonds',
      quizId: 'quiz1',
    };
    dispatch(setDailyQuiz(dummyQuiz));
  };

  useEffect(() => {
    handleAddDummyData();
  }, [dispatch]);

  const handleJoinQuiz = () => {
    navigation.navigate('DailyQuiz');
  };

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View>
          <Text style={styles.title}>{dailyQuiz?.title}</Text>
          <Text style={styles.description}>{dailyQuiz?.description}</Text>
          <Button
            mode="contained"
            onPress={handleJoinQuiz}
            style={styles.button}
            labelStyle={styles.buttonLabel}
            compact
          >
            Join a quiz
          </Button>
        </View>
        <Icon name="head-question-outline" size={48} color="white" />
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFB74D', // bg-orange20
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
  title: {
    fontSize: 18, // text70b
    fontWeight: 'bold', // text70b
    color: 'white',
  },
  description: {
    fontSize: 14, // text80
    color: 'white',
  },
  button: {
    backgroundColor: '#F57C00', // bg-orange50
    borderRadius: 12, // br12
    marginTop: 10, // marginT-10
    alignSelf: 'flex-start',
  },
  buttonLabel: {
    color: 'white',
  },
});

export default DailyQuizBanner;