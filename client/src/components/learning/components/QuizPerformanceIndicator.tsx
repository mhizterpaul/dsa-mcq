import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { LearningRootState } from '../store';

const NEON = '#EFFF3C';
const CIRCLE_SIZE = 160;
const ARC_THICKNESS = 18;

const QuizPerformanceIndicator = () => {
  const { score, activeQuizId, quizzes } = useSelector((state: LearningRootState) => state.quiz);
  const activeQuiz = activeQuizId ? quizzes[activeQuizId] : null;
  const totalQuestions = activeQuiz ? activeQuiz.questions.length : 0;
  const performance = totalQuestions > 0 ? score / totalQuestions : 0;

  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <View
          style={[
            styles.progressArc,
            { transform: [{ rotate: `${performance * 360 - 90}deg` }] },
          ]}
        />
        <Text style={styles.percentage}>{Math.round(performance * 100)}%</Text>
        <Text style={styles.label}>Quiz Performance</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 18,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: ARC_THICKNESS,
    borderColor: '#333',
    opacity: 0.4
  },
  progressArc: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: ARC_THICKNESS,
    borderColor: NEON,
    borderTopColor: NEON,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    opacity: 0.9,
  },
  percentage: {
    color: NEON,
    fontSize: 30,
    fontWeight: 'bold',
  },
  label: {
    color: 'white',
    fontSize: 16,
    opacity: 0.7,
  },
});

export default QuizPerformanceIndicator;