import React, { useState } from 'react';
import { View, Text, Button } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useSelector, useDispatch } from 'react-redux';
import { UserRootState } from '../store';
import { setUserProfile } from '../store/userProfile.slice';
import { UserProfile, UserGoal } from '../store/primitives/UserProfile';

const NEON = '#EFFF3C';
const DARK = '#181A1B';

const goalOptions: UserGoal[] = [
  'Improve speed',
  'Master weak topics',
  'Consistency streak',
];

const GoalSetter = () => {
  const [showOptions, setShowOptions] = useState(false);
  const profile = useSelector((state: UserRootState) => state.profile.profile);
  const dispatch = useDispatch();

  const handleSetTarget = () => {
    setShowOptions(true);
  };

  const handleAddGoal = (goal: UserGoal) => {
    if (profile) {
      const newProfile = { ...profile };
      newProfile.goals.push(goal);
      dispatch(setUserProfile(newProfile));
    }
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
          {goalOptions.map((goal, index) => (
            <GoalOption
              key={index}
              icon="check-circle"
              label={goal}
              onPress={() => handleAddGoal(goal)}
            />
          ))}
        </View>
      )}
      <Button
        label="Continue"
        labelStyle={{color: 'black', fontWeight: 'bold'}}
        iconSource={() => <Feather name="arrow-right" size={20} color="black" />}
        iconOnRight
        backgroundColor="#ADFF2F"
        style={{borderRadius: 15, padding: 15, width: '100%', position: 'absolute', bottom: 40, alignSelf: 'center'}}
      />
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