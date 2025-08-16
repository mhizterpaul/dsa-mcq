import React from 'react';
import { StyleSheet } from 'react-native';
import { View, Text } from 'react-native-ui-lib';
import { useSelector } from 'react-redux';
import { LearningRootState } from '../store';

const NEON = '#EFFF3C';
const DARK = '#181A1B';
const GRAY = '#2A2C2E';
const CIRCLE_SIZE = 160;
const ARC_THICKNESS = 18;

const QuizPerformanceIndicator = () => {
  const { score, activeQuizId, quizzes } = useSelector((state: LearningRootState) => state.quiz);
  const activeQuiz = activeQuizId ? quizzes[activeQuizId] : null;
  const totalQuestions = activeQuiz ? activeQuiz.questions.length : 0;
  const performance = totalQuestions > 0 ? score / totalQuestions : 0;

  return (
    <View center marginT-10 marginB-18>
      <View width={CIRCLE_SIZE} height={CIRCLE_SIZE} br100 bg-grey20 center style={{position: 'relative'}}>
        <View absF width={CIRCLE_SIZE} height={CIRCLE_SIZE} br100 style={{borderWidth: ARC_THICKNESS, borderColor: '#333', opacity: 0.4}} />
        <View
          style={[
            styles.progressArc,
            { transform: [{ rotate: `${performance * 360 - 90}deg` }] },
          ]}
        />
        <Text color={NEON} text30b>{Math.round(performance * 100)}%</Text>
        <Text white text70 style={{opacity: 0.7}}>Quiz Performance</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressArc: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: ARC_THICKNESS,
    borderColor: NEON,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    opacity: 0.9,
  },
});

export default QuizPerformanceIndicator;
