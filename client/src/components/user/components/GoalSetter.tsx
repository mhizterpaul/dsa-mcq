import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, ProgressBar } from 'react-native-paper';
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

// Reusable option button
const GoalOption = ({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) => (
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

interface GoalSetterProps {
  navigation: StackNavigationProp<any>;
}

const GoalSetter = ({ navigation }: GoalSetterProps) => {
  const [showOptions, setShowOptions] = useState(false);
  const profile = useSelector((state: UserRootState) => state.profile.profile);
  const dispatch = useDispatch();

  const goals = profile?.goals || [];
  const completedGoals = goals.filter((goal: any) => goal.completed).length;
  const progress = goals.length > 0 ? completedGoals / goals.length : 0;

  const handleSetTarget = () => setShowOptions(true);

  const handleAddGoal = (goal: UserGoal) => {
    if (profile) {
      const newProfile: UserProfile = { ...profile, goals: [...profile.goals, { label: goal, completed: false }] };
      dispatch(setUserProfile(newProfile));
    }
    setShowOptions(false);
  };

  const handleContinue = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="target" size={24} color="white" />
        <Text style={styles.headerTitle}>Set Your Next Goal</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Bar (same style as verification screen) */}
      <ProgressBar
        progress={progress}
        color={goals.length === 0 ? '#ccc' : '#00B5D8'}
        style={styles.progressBar}
      />
      <Text style={styles.progressLabel}>
        {completedGoals} / {goals.length} goals completed
      </Text>

      {/* Actions */}
      {!showOptions && (
        <Button
          mode="contained"
          icon={() => <Icon name="plus-circle-outline" size={20} color={DARK} />}
          onPress={handleSetTarget}
          style={styles.setTargetButton}
          labelStyle={styles.setTargetLabel}
        >
          Set Target
        </Button>
      )}

      {showOptions && (
        <View style={{ marginTop: 20, width: '100%' }}>
          {goalOptions.map((goal, index) => (
            <GoalOption key={index} icon="check-circle" label={goal} onPress={() => handleAddGoal(goal)} />
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
    flex: 1,
    backgroundColor: '#333',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSpacer: {
    width: 24,
  },
  progressBar: {
    height: 6,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#444',
  },
  progressLabel: {
    color: 'white',
    fontSize: 12,
    marginBottom: 24,
    textAlign: 'center',
  },
  setTargetButton: {
    backgroundColor: NEON,
    borderRadius: 12,
    marginTop: 10,
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
    justifyContent: 'flex-start',
  },
  goalOptionInnerView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalOptionText: {
    color: 'white',
    marginLeft: 15,
  },
});

export default GoalSetter;
