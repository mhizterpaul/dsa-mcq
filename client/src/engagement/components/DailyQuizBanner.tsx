import React from 'react';
import { View, Text, Button } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { EngagementRootState } from '../store/store';

const DailyQuizBanner = () => {
  const dailyQuiz = useSelector((state: EngagementRootState) => state.dailyQuiz);

  const handleJoinQuiz = () => {
    console.log('Joining quiz:', dailyQuiz.quizId);
  };

  return (
    <View row spread centerV bg-orange20 br20 marginH-18 marginT-18 padding-18>
      <View>
        <Text text70b>{dailyQuiz.title}</Text>
        <Text text80>{dailyQuiz.description}</Text>
        <Button label="Join a quiz" bg-orange50 br12 size={Button.sizes.small} marginT-10 onPress={handleJoinQuiz} />
      </View>
      <Icon name="head-question-outline" size={48} color="white" />
    </View>
  );
};

export default DailyQuizBanner;
