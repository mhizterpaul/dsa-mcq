import React from 'react';
import { View, Text, Button } from 'react-native-ui-lib';
import { useSelector, useDispatch } from 'react-redux';
import { EngagementRootState } from '../store/store';
import { addAchievement } from '../store/achievements.slice';
import { Achievement } from '../store/primitives/Achievement';

const AchievementsView = () => {
  const achievements = useSelector((state: EngagementRootState) => state.achievements.entities);
  const dispatch = useDispatch();

  const handleAddAchievement = () => {
    const newAchievement: Achievement = {
      id: `ach_${Date.now()}`,
      name: 'First Quiz Completed',
      description: 'You completed your first quiz!',
      achieved: true,
    };
    dispatch(addAchievement(newAchievement));
  };

  return (
    <View flex center>
      <Text text50b marginB-20>Achievements</Text>
      {Object.values(achievements).map((achievement) => (
        <View key={achievement.id} marginB-10>
          <Text text70>{achievement.name}</Text>
          <Text text80>{achievement.description}</Text>
        </View>
      ))}
      <Button label="Add Dummy Achievement" onPress={handleAddAchievement} />
    </View>
  );
};

export default AchievementsView;
