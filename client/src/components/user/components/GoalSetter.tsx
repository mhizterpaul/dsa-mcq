import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useSelector, useDispatch } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { setUserProfile } from '../store/userProfile.slice';
import {
    UserProfile,
    GoalType,
    PerformanceGoal,
    PreferredTimeBlock,
    QuizSchedule
} from '../store/primitives/UserProfile';
import { HabitPlanGenerator } from '../services/habitPlanService';
import mediatorService from '../../../services/mediatorService';

const NEON = '#EFFF3C';
const DARK = '#121212';
const GRAY = '#1E1E1E';
const LIGHT_GRAY = '#666';

interface GoalSetterProps {
  navigation: StackNavigationProp<any>;
}

const StyledButton = ({ label, onPress, testID, disabled }: { label: string; onPress: () => void; testID?: string; disabled?: boolean }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.customButton, disabled && { opacity: 0.5 }]}
    testID={testID}
    disabled={disabled}
  >
    <View style={styles.buttonCheckCircle}>
        <Feather name="check" size={14} color="black" />
    </View>
    <Text style={styles.buttonText}>{label}</Text>
    <View style={styles.buttonChevrons}>
        <Feather name="chevrons-right" size={20} color={LIGHT_GRAY} />
    </View>
  </TouchableOpacity>
);

const GoalSetter = ({ navigation }: GoalSetterProps) => {
  const dispatch = useDispatch();

  const profile = useSelector((state: any) => state.user?.profile?.profile);
  const currentUser = useSelector((state: any) => state.user?.user?.currentUser);

  const [engagementMetrics, setEngagementMetrics] = useState<any>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
        if (currentUser?.id) {
            const metrics = await mediatorService.getUserProgress(currentUser.id);
            setEngagementMetrics(metrics);
        }
    };
    fetchMetrics();
  }, [currentUser]);

  const [step, setStep] = useState(0);

  // Goal State
  const [goalType, setGoalType] = useState<GoalType>(profile?.activePerformanceGoal?.type || GoalType.LEADERBOARD_PERCENTILE);
  const [targetMetric, setTargetMetric] = useState<string>(profile?.activePerformanceGoal?.targetMetric?.toString() || '10');
  const [deadline, setDeadline] = useState<string>(profile?.activePerformanceGoal?.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  // Preferred Time State
  const [selectedTime, setSelectedTime] = useState(profile?.preferredQuizTime || '08:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(profile?.gamingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [showDaySelector, setShowDaySelector] = useState(false);

  // Generated Plan
  const [generatedSchedule, setGeneratedSchedule] = useState<QuizSchedule | null>(profile?.quizSchedule || null);
  const [isEditMode, setIsEditMode] = useState(profile?.isGoalSet || false);

  const times = ['06:00', '07:00', '08:00', '09:00', '10:00'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const goalTypes = [
    { type: GoalType.LEADERBOARD_PERCENTILE, label: 'Top Percentile', icon: 'award' },
    { type: GoalType.INTUITION_GAIN, label: 'Problem Intuition', icon: 'zap' },
    { type: GoalType.INTERVIEW_PREP, label: 'Interview Prep', icon: 'briefcase' },
    { type: GoalType.COURSE_PASS, label: 'Course Pass', icon: 'book' },
    { type: GoalType.COMPETITIVE_PROGRAMMING, label: 'Competitive Prog', icon: 'code' },
  ];

  const isPercentileValid = useMemo(() => {
    if (goalType !== GoalType.LEADERBOARD_PERCENTILE) return true;
    const val = parseInt(targetMetric);
    return !isNaN(val) && val >= 1 && val <= 100;
  }, [goalType, targetMetric]);

  // Progress Calculation using retrieved engagement data via Mediator
  const progressPercentage = useMemo(() => {
    if (!engagementMetrics) return 0;

    switch (goalType) {
        case GoalType.LEADERBOARD_PERCENTILE:
            const target = parseInt(targetMetric) || 10;
            const current = engagementMetrics.rank || profile?.globalRanking || 100;
            if (current <= target) return 100;
            const start = 100;
            return Math.min(100, Math.max(0, Math.round(((start - current) / (start - target)) * 100)));

        case GoalType.INTUITION_GAIN:
            return Math.round((engagementMetrics.attendance ?? 0) * 100);

        case GoalType.INTERVIEW_PREP:
        case GoalType.COURSE_PASS:
        case GoalType.COMPETITIVE_PROGRAMMING:
            const targetXP = 5000;
            const currentXP = engagementMetrics.xp ?? profile?.totalXP ?? 0;
            return Math.min(100, Math.round((currentXP / targetXP) * 100));

        default:
            return 0;
    }
  }, [engagementMetrics, profile, goalType, targetMetric]);

  const handleContinue = () => {
    if (step === 1) {
        if (!isPercentileValid) return;
        setStep(2);
    } else if (step === 2) {
        generatePlan();
        setStep(3);
    } else if (step === 0) {
        setStep(1);
    } else {
        handleComplete();
    }
  };

  const generatePlan = () => {
    try {
        if (!profile) return;

        const performanceGoal: PerformanceGoal = {
            type: goalType,
            targetMetric: goalType === GoalType.LEADERBOARD_PERCENTILE ? parseInt(targetMetric) : targetMetric,
            deadline: deadline
        };

        const [hour, minute] = selectedTime.split(':').map(Number);
        const startTime = `${(hour - 1).toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        const timeBlocks: PreferredTimeBlock[] = selectedDays.map(day => ({
            day: day === 'Mon' ? 'Monday' : day === 'Tue' ? 'Tuesday' : day === 'Wed' ? 'Wednesday' : day === 'Thu' ? 'Thursday' : day === 'Fri' ? 'Friday' : day === 'Sat' ? 'Saturday' : 'Sunday',
            start: startTime,
            end: endTime
        }));

        const schedule = HabitPlanGenerator.generateSchedule(performanceGoal, timeBlocks, profile);
        setGeneratedSchedule(schedule);
    } catch (error: any) {
        Alert.alert('Infeasible Goal', error.message);
        throw error;
    }
  };

  const handleComplete = () => {
    if (profile && generatedSchedule) {
      const updatedProfile: UserProfile = {
        ...profile,
        preferredQuizTime: selectedTime,
        performanceTarget: goalType,
        habitPlan: generatedSchedule.sessions.slice(0, 3).map(s => `${s.date} ${s.time} - ${s.difficulty}`),
        gamingDays: selectedDays,
        isGoalSet: true,
        activePerformanceGoal: {
            type: goalType,
            targetMetric: goalType === GoalType.LEADERBOARD_PERCENTILE ? parseInt(targetMetric) : targetMetric,
            deadline: deadline
        },
        quizSchedule: generatedSchedule,
      };

      dispatch(setUserProfile(updatedProfile));
      setIsEditMode(true);
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  };

  const toggleDay = (day: string) => {
    const newDays = selectedDays.includes(day)
        ? selectedDays.filter(d => d !== day)
        : [...selectedDays, day];
    setSelectedDays(newDays);
  };

  useEffect(() => {
    if (step === 3 && selectedDays.length > 0) {
        try {
            generatePlan();
        } catch(e) {}
    }
  }, [selectedDays, step]);

  const handleBack = () => {
    if (step > 0) {
        setStep(step - 1);
    } else {
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
      <Text style={styles.stepTitle}>Your Wake Time?</Text>
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
      <Text style={styles.stepTitle}>Your Goal Target?</Text>
      <View style={styles.targetList}>
        {goalTypes.map((g) => (
          <TouchableOpacity
            key={g.type}
            style={[styles.targetCard, goalType === g.type && styles.selectedCard]}
            onPress={() => setGoalType(g.type)}
            testID={`goal-type-${g.type}`}
          >
            <View style={styles.targetCardInner}>
                <View style={[styles.targetIconCircle, goalType === g.type && { backgroundColor: DARK }]}>
                    <Feather name={g.icon} size={18} color={goalType === g.type ? NEON : 'white'} />
                </View>
                <Text style={[styles.targetText, goalType === g.type && styles.selectedText]}>{g.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {goalType === GoalType.LEADERBOARD_PERCENTILE && (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Target Percentile (e.g. 10 for Top 10%)</Text>
            <TextInput
                mode="outlined"
                value={targetMetric}
                onChangeText={setTargetMetric}
                keyboardType="numeric"
                style={styles.textInput}
                textColor="white"
                theme={{ colors: { primary: NEON, outline: GRAY } }}
                testID="percentile-input"
                error={!isPercentileValid && targetMetric.length > 0}
            />
            {!isPercentileValid && targetMetric.length > 0 && (
                <Text style={{ color: 'red', fontSize: 12 }}>Please enter a value between 1 and 100</Text>
            )}
        </View>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
        <View style={styles.iconCircle}>
            <Feather name="calendar" size={24} color="white" />
        </View>
        <Text style={styles.stepTitle}>Set Your Deadline</Text>
        <TextInput
            mode="outlined"
            value={deadline}
            onChangeText={setDeadline}
            placeholder="YYYY-MM-DD"
            style={styles.textInput}
            textColor="white"
            theme={{ colors: { primary: NEON, outline: GRAY } }}
            testID="deadline-input"
        />
        <Text style={styles.helperText}>Format: YYYY-MM-DD</Text>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity
        style={styles.iconCircle}
        onPress={() => setShowDaySelector(!showDaySelector)}
        testID="summary-calendar-icon"
      >
        <Feather name="calendar" size={24} color="white" />
      </TouchableOpacity>

      <Text style={styles.stepTitle}>Create Habit Plan</Text>

      {showDaySelector ? (
        <View style={styles.daySelectorSummary}>
            <Text style={styles.daySelectorTitle}>Modify Gaming Days</Text>
            <View style={styles.daySelector}>
                {dayNames.map(day => (
                    <TouchableOpacity
                        key={day}
                        style={[styles.dayButton, selectedDays.includes(day) && styles.selectedDayButton]}
                        onPress={() => toggleDay(day)}
                        testID={`summary-day-option-${day}`}
                    >
                        <Text style={[styles.dayText, selectedDays.includes(day) && styles.selectedDayText]}>{day}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <TouchableOpacity onPress={() => setShowDaySelector(false)}>
                <Text style={{ color: NEON, marginTop: 10, fontWeight: 'bold' }}>Done</Text>
            </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.summaryContent}>
            <View style={styles.progressCircleContainer}>
                <View style={[styles.progressCircleInner, { borderTopColor: NEON, borderRightColor: NEON, borderBottomColor: progressPercentage > 50 ? NEON : GRAY, borderLeftColor: progressPercentage > 75 ? NEON : GRAY }]}>
                    <Text style={styles.progressCircleText} testID="progress-percentage">{progressPercentage}%</Text>
                    <Text style={styles.progressSubText}>Habit</Text>
                </View>
            </View>

            <Text style={styles.planStatusText}>
                {generatedSchedule?.sessions.length} sessions generated.
            </Text>

            <ScrollView style={styles.miniScheduleScroll}>
                {generatedSchedule?.sessions.slice(0, 3).map((session, index) => (
                <View key={index} style={styles.miniHabitItem}>
                    <View style={styles.miniHabitIcon}>
                        <Feather name="zap" size={14} color="white" />
                    </View>
                    <Text style={styles.miniHabitText}>{session.date} @ {session.time}</Text>
                </View>
                ))}
            </ScrollView>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} testID="back-button">
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

      <View style={{ flex: 1 }}>
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </View>

      <View style={styles.footer}>
        <StyledButton
          label={step === 3 ? 'Complete' : (isEditMode ? 'Edit' : 'Continue')}
          onPress={handleContinue}
          testID="continue-button"
          disabled={step === 1 && !isPercentileValid}
        />
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
  stepContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
    textAlign: 'center',
  },
  daySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dayButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: GRAY,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  selectedDayButton: {
    backgroundColor: NEON,
  },
  dayText: {
    color: 'white',
    fontSize: 12,
  },
  selectedDayText: {
    color: DARK,
    fontWeight: 'bold',
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
    borderRadius: 30,
  },
  timeText: {
    fontSize: 28,
    color: 'rgba(255, 255, 255, 0.3)',
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
    padding: 15,
    marginBottom: 12,
  },
  selectedCard: {
    backgroundColor: NEON,
  },
  targetCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  targetText: {
    fontSize: 18,
    color: 'white',
  },
  inputContainer: {
    width: '100%',
    marginTop: 20,
  },
  inputLabel: {
    color: LIGHT_GRAY,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: GRAY,
    width: '100%',
  },
  helperText: {
    color: LIGHT_GRAY,
    fontSize: 12,
    marginTop: 8,
  },
  summaryContent: {
    alignItems: 'center',
    width: '100%',
  },
  progressCircleContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 20,
    borderColor: GRAY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  progressCircleInner: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 20,
    borderColor: 'transparent',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  progressCircleText: {
    fontSize: 50,
    fontWeight: '800',
    color: 'white',
    transform: [{ rotate: '45deg' }],
  },
  progressSubText: {
    fontSize: 18,
    color: LIGHT_GRAY,
    transform: [{ rotate: '45deg' }],
  },
  planStatusText: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
  },
  miniScheduleScroll: {
    width: '100%',
    maxHeight: 180,
  },
  miniHabitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GRAY,
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
  },
  miniHabitIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  miniHabitText: {
    color: 'white',
    fontSize: 14,
  },
  daySelectorSummary: {
    width: '100%',
    backgroundColor: GRAY,
    borderRadius: 25,
    padding: 20,
    alignItems: 'center',
  },
  daySelectorTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  customButton: {
    backgroundColor: 'black',
    borderRadius: 35,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonCheckCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  buttonChevrons: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GoalSetter;
