import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useSelector, useDispatch } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { UserRootState } from '../store';
import { setUserProfile } from '../store/userProfile.slice';
import { UserProfile } from '../store/primitives/UserProfile';

const NEON = '#EFFF3C';
const DARK = '#121212';
const GRAY = '#1E1E1E';
const LIGHT_GRAY = '#B0B0B0';

interface GoalSetterProps {
  navigation: StackNavigationProp<any>;
}

const GoalSetter = ({ navigation }: GoalSetterProps) => {
  const profile = useSelector((state: any) => (state.user?.profile?.profile || state.profile?.profile));
  const dispatch = useDispatch();

  const [step, setStep] = useState(0);
  const [selectedTime, setSelectedTime] = useState(profile?.preferredQuizTime || '08:00');
  const [selectedTarget, setSelectedTarget] = useState(profile?.performanceTarget || '');
  const [gamingDays, setGamingDays] = useState<string[]>(profile?.gamingDays || []);
  const [isEditMode, setIsEditMode] = useState(profile?.isGoalSet || false);

  const times = ['06:00', '07:00', '08:00', '09:00', '10:00'];
  const targets = [
    { id: '1', label: 'Master Algorithms', icon: 'trending-up' },
    { id: '2', label: 'Consistent Learner', icon: 'calendar-check' },
    { id: '3', label: 'Top 10% Rank', icon: 'award' },
  ];
  const habitPlans = [
    { id: '1', label: 'Daily 10 MCQs', icon: 'book-open' },
    { id: '2', label: 'Review Weak Topics', icon: 'refresh-cw' },
    { id: '3', label: 'Compete in Daily Quiz', icon: 'users' },
  ];

  const totalSteps = 4;
  const progress = (step + 1) / totalSteps;

  const handleContinue = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    if (profile) {
      const updatedProfile: UserProfile = {
        ...profile,
        preferredQuizTime: selectedTime,
        performanceTarget: selectedTarget,
        habitPlan: habitPlans.map(h => h.label),
        gamingDays: gamingDays,
        isGoalSet: true,
      };
      dispatch(setUserProfile(updatedProfile));
      setIsEditMode(true);
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  };

  const renderStep0 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconCircle}>
        <Feather name="clock" size={24} color="white" />
      </View>
      <Text style={styles.stepTitle}>Preferred Quiz Time?</Text>
      <View style={styles.timePicker}>
        {times.map((time) => (
          <TouchableOpacity
            key={time}
            style={[styles.timeOption, selectedTime === time && styles.selectedOption]}
            onPress={() => setSelectedTime(time)}
            testID={`time-option-${time}`}
          >
            <Text style={[styles.timeText, selectedTime === time && styles.selectedText]}>{time}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconCircle}>
        <Feather name="target" size={24} color="white" />
      </View>
      <Text style={styles.stepTitle}>Performance Target?</Text>
      <View style={styles.targetList}>
        {targets.map((target) => (
          <TouchableOpacity
            key={target.id}
            style={[styles.targetCard, selectedTarget === target.label && styles.selectedCard]}
            onPress={() => setSelectedTarget(target.label)}
            testID={`target-option-${target.label}`}
          >
            <View style={styles.targetCardInner}>
                <Feather name={target.icon} size={20} color={selectedTarget === target.label ? DARK : 'white'} />
                <Text style={[styles.targetText, selectedTarget === target.label && styles.selectedText]}>{target.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconCircle}>
        <Feather name="list" size={24} color="white" />
      </View>
      <Text style={styles.stepTitle}>Habit Plan</Text>
      <View style={styles.habitList}>
        {habitPlans.map((habit) => (
          <View key={habit.id} style={styles.habitItem}>
            <View style={styles.habitIcon}>
                <Feather name={habit.icon} size={16} color="white" />
            </View>
            <Text style={styles.habitText}>{habit.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity
        style={styles.iconCircle}
        onPress={() => setGamingDays(['Mon', 'Wed', 'Fri'])}
        testID="calendar-icon"
      >
        <Feather name="calendar" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.stepTitle}>Create Habit Plan</Text>
      <View style={styles.progressCircleContainer}>
         <View style={styles.progressCircle}>
            <Text style={styles.progressCircleText}>80%</Text>
            <Text style={styles.progressSubText}>Habit</Text>
         </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} testID="back-button">
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.progressBarWrapper}>
            <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${(step + 1) * 25}%` }]} testID="progress-bar-fill" />
            </View>
            <View style={styles.progressSteps}>
                {[0, 1, 2, 3].map((i) => (
                    <View key={i} style={[styles.stepDot, step >= i && styles.activeStepDot]}>
                        {step > i && <Icon name="check" size={8} color={DARK} />}
                    </View>
                ))}
            </View>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleContinue}
          style={styles.continueButton}
          labelStyle={styles.continueLabel}
          testID="continue-button"
        >
          {step === 3 ? 'Complete' : (isEditMode ? 'Edit' : 'Continue')}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  progressBarWrapper: {
    flex: 1,
    marginHorizontal: 20,
    position: 'relative',
    height: 10,
    justifyContent: 'center',
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: GRAY,
    borderRadius: 2,
    width: '100%',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: NEON,
    borderRadius: 2,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    width: '100%',
    paddingHorizontal: 0,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: GRAY,
    borderWidth: 2,
    borderColor: DARK,
  },
  activeStepDot: {
    backgroundColor: NEON,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  stepContainer: {
    width: '100%',
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: GRAY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
    textAlign: 'center',
  },
  timePicker: {
    width: '100%',
    alignItems: 'center',
  },
  timeOption: {
    width: '100%',
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: NEON,
    borderRadius: 25,
  },
  timeText: {
    fontSize: 24,
    color: LIGHT_GRAY,
  },
  selectedText: {
    color: DARK,
    fontWeight: 'bold',
  },
  targetList: {
    width: '100%',
  },
  targetCard: {
    backgroundColor: GRAY,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
  },
  selectedCard: {
    backgroundColor: NEON,
  },
  targetCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetText: {
    fontSize: 18,
    color: 'white',
    marginLeft: 15,
  },
  habitList: {
    width: '100%',
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GRAY,
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
  },
  habitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  habitText: {
    fontSize: 16,
    color: 'white',
  },
  progressCircleContainer: {
    marginTop: 20,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 15,
    borderColor: GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircle: {
    alignItems: 'center',
  },
  progressCircleText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  progressSubText: {
    fontSize: 18,
    color: LIGHT_GRAY,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: NEON,
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
  },
  continueLabel: {
    color: DARK,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GoalSetter;
