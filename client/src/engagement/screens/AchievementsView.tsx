import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native-ui-lib';
import { useSelector, useDispatch } from 'react-redux';
import { EngagementRootState } from '../store/store';
import { addAchievement, setUserEngagementDb } from '../store/userEngagement.slice';
import { Achievement } from '../store/primitives/UserEngagement';

const AchievementsView = () => {
  const achievements = useSelector((state: EngagementRootState) => state.userEngagement.engagements[userId]?.achievements);
  const dispatch = useDispatch();

  const handleAddDummyData = () => {
    dispatch(setUserEngagementDb(userId));
    const dummyAchievement: Achievement = {
      id: `ach_${Date.now()}`,
      name: 'First Quiz Completed',
      description: 'You completed your first quiz!',
      achieved: true,
    };
    dispatch(addAchievement({ userId, achievement: dummyAchievement }));
  };

  useEffect(() => {
    handleAddDummyData();
  }, []);

  return (
    <View flex center>
      <Text text50b marginB-20>Achievements</Text>
      {achievements && achievements.map((achievement) => (
        <View key={achievement.id} marginB-10>
          <Text text70>{achievement.name}</Text>
          <Text text80>{achievement.description}</Text>
        </View>
      ))}
      <Button label="Add Dummy Achievement" onPress={handleAddDummyData} />
    </View>
  );
};

export default AchievementsView;
