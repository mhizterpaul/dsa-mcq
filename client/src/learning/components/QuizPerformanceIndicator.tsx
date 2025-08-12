import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NEON = '#EFFF3C';
const DARK = '#181A1B';
const GRAY = '#2A2C2E';
const CIRCLE_SIZE = 160;
const ARC_THICKNESS = 18;

const QuizPerformanceIndicator = ({ performance }: { performance: number }) => {
  return (
    <View style={styles.progressSection}>
      <View style={styles.progressCircleWrap}>
        <View style={styles.progressBg} />
        <View
          style={[
            styles.progressArc,
            { transform: [{ rotate: `${performance * 360 - 90}deg` }] },
          ]}
        />
        <Text style={styles.progressText}>{Math.round(performance * 100)}%</Text>
        <Text style={styles.progressLabel}>Quiz Performance</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressSection: {
    marginTop: 10,
    marginBottom: 18,
    alignItems: 'center',
    width: '100%',
  },
  progressCircleWrap: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: GRAY,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  progressBg: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: ARC_THICKNESS,
    borderColor: '#333',
    opacity: 0.4,
  },
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
  progressText: {
    color: NEON,
    fontWeight: 'bold',
    fontSize: 36,
    marginBottom: 2,
  },
  progressLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.7,
    marginTop: -2,
  },
});

export default QuizPerformanceIndicator;
