import React, { useEffect } from 'react';
import { View, Text, Avatar, Button } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { EngagementRootState } from '../store/store';
import { setWeeklyKingOfQuiz } from '../store/globalEngagement.slice';
import { KingOfQuiz } from '../store/primitives/globalEngagement';

const WeeklyKingOfQuiz = () => {
  const king = useSelector((state: EngagementRootState) => state.globalEngagement.engagement.weeklyKingOfQuiz);
  const dispatch = useDispatch();

  const handleAddDummyData = () => {
    const dummyKing: KingOfQuiz = {
      name: 'Moktum Talukdar',
      avatar: 'https://randomuser.me/api/portraits/men/35.jpg',
      score: 12000,
    };
    dispatch(setWeeklyKingOfQuiz(dummyKing));
  };

  useEffect(() => {
    handleAddDummyData();
  }, []);

  if (!king) {
    return (
        <View center>
            <Text>Loading...</Text>
            <Button label="Add Dummy Data" onPress={handleAddDummyData} />
        </View>
    )
  }

  return (
    <View row spread centerV bg-purple20 br20 marginH-18 marginT-18 padding-18>
      <View>
        <Text white text70b>This week's</Text>
        <Text white text60b>King of the Quiz</Text>
      </View>
      <View center>
        <Avatar size={60} source={{uri: king.avatar}} />
        <Text white text80b marginT-4>{king.name}</Text>
        <View row centerV>
            <Icon name="diamond" size={14} color="#FFBE0B" />
            <Text text80b color-yellow30 marginL-4>{king.score} diamonds</Text>
        </View>
      </View>
    </View>
  );
};

export default WeeklyKingOfQuiz;
