import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useSelector, useDispatch } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
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

interface GoalSetterProps {
    navigation: StackNavigationProp<any>;
}

const GoalOption = ({ icon, label, onPress }: { icon: string, label: string, onPress: () => void }) => {
  return (
    <Button
      mode="contained"
      onPress={onPress}
      style={styles.goalOptionButton}
      contentStyle={styles.goalOptionContent}
    >
      <View style={styles.goalOptionInnerView}>
        <Feather name={icon} size={20} color="white" />
        <Text style={styles.goalOptionText}>{label}</Text>
      </View>
    </Button>
  );
};


const GoalSetter = ({ navigation }: GoalSetterProps) => {
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

  const handleContinue = () => {
    if (navigation.canGoBack()) {
        navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Your Next Goal</Text>
      {!showOptions && (
        <Button
          mode="contained"
          icon={() => <Icon name="target" size={20} color={DARK} />}
          onPress={handleSetTarget}
          style={styles.setTargetButton}
          labelStyle={styles.setTargetLabel}
        >
          Set Target
        </Button>
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
        mode="contained"
        onPress={handleContinue}
        icon={() => <Feather name="arrow-right" size={20} color="black" />}
        contentStyle={{ flexDirection: 'row-reverse' }}
        style={styles.continueButton}
        labelStyle={styles.continueLabel}
      >
        Continue
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#333', // bg-grey20
    borderRadius: 20, // br20
    padding: 18, // padding-18
    marginBottom: 18, // marginB-18
    width: '90%',
    alignSelf: 'center',
  },
  title: {
    color: 'white',
    fontSize: 18, // text70b
    fontWeight: 'bold', // text70b
    marginBottom: 10, // marginB-10
  },
  setTargetButton: {
    backgroundColor: NEON,
    borderRadius: 12, // br12
    marginTop: 4, // marginT-4
  },
  setTargetLabel: {
    color: DARK,
  },
  continueButton: {
    backgroundColor: '#ADFF2F',
    borderRadius: 15,
    width: '100%',
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    padding: 5,
  },
  continueLabel: {
    color: 'black',
    fontWeight: 'bold',
  },
  goalOptionButton: {
    marginBottom: 15,
    borderRadius: 15,
    backgroundColor: '#222',
    width: '100%',
  },
  goalOptionContent: {
    padding: 8,
    justifyContent: 'flex-start'
  },
  goalOptionInnerView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalOptionText: {
    color: 'white',
    marginLeft: 15,
  }
});

export default GoalSetter;