import React, { useState } from 'react';
import { View, Text, Button } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useDispatch } from 'react-redux';
import { addGoal } from '../store/user.slice';

const NEON = '#EFFF3C';
const DARK = '#181A1B';

const goalOptions = [
  { id: '1', text: 'Complete 5 quizzes this week', icon: 'check-circle' },
  { id: '2', text: 'Achieve a 90% score on a quiz', icon: 'star' },
  { id: '3', text: 'Master a new category', icon: 'award' },
];

const GoalSetter = () => {
  const [showOptions, setShowOptions] = useState(false);
  const dispatch = useDispatch();

  const handleSetTarget = () => {
    setShowOptions(true);
  };

  const handleAddGoal = (goal: { id: string; text: string }) => {
    dispatch(addGoal(goal));
    setShowOptions(false);
  };

  return (
    <View center bg-grey20 br20 padding-18 marginB-18 style={{width: '90%'}}>
      <Text white text70b marginB-10>Set Your Next Goal</Text>
      {!showOptions && (
        <Button
          label="Set Target"
          iconSource={() => <Icon name="target" size={20} color={DARK} />}
          onPress={handleSetTarget}
          backgroundColor={NEON}
          color={DARK}
          br12
          paddingH-18
          paddingV-8
          marginT-4
        />
      )}
      {showOptions && (
        <View>
          {goalOptions.map((goal) => (
            <GoalOption
              key={goal.id}
              icon={goal.icon}
              label={goal.text}
              onPress={() => handleAddGoal(goal)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const GoalOption = ({ icon, label, onPress }: { icon: string, label: string, onPress: () => void }) => {
  return (
    <Button
      marginB-15
      style={{borderRadius: 15, padding: 15, width: '100%'}}
      backgroundColor="#222"
      onPress={onPress}
    >
      <View row centerV>
          <Feather name={icon} size={20} color="white" />
          <Text white marginL-15>{label}</Text>
      </View>
    </Button>
  );
};

export default GoalSetter;