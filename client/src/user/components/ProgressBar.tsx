import React from 'react';
import { View } from 'react-native-ui-lib';
import { useSelector } from 'react-redux';
import { UserRootState } from '../store';

const ProgressBar = () => {
  const goals = useSelector((state: UserRootState) => state.profile.profile?.goals);

  if (!goals || goals.length === 0) {
    return (
      <View row centerV spread marginB-40>
        <View height={4} bg-dark70 flex br10 />
        <View height={4} bg-dark70 flex marginR-2 br10 />
        <View height={4} bg-dark70 flex marginR-2 br10 />
        <View height={4} bg-dark70 flex marginR-2 br10 />
      </View>
    );
  }

  const completedGoals = goals.filter((goal) => goal.completed).length;
  const progress = (completedGoals / goals.length) * 100;

  return (
    <View row centerV spread marginB-40>
      {Array.from({ length: goals.length }).map((_, index) => (
        <View
          key={index}
          height={4}
          bg={index < completedGoals ? 'green30' : 'dark70'}
          flex
          marginR-2
          br10
        />
      ))}
    </View>
  );
};

export default ProgressBar;
