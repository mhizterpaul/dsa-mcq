import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import { startNewSession } from '../store/learningSession.slice';

const NEON = '#EFFF3C';
const DARK = '#181A1B';

const StartQuizButton = () => {
    const dispatch = useDispatch();

    const handlePress = () => {
        dispatch(startNewSession({ userId: 'user1', allQuestionIds: ['q1', 'q2', 'q3', 'q4', 'q5'], subsetSize: 5 }));
    }

  return (
    <Button
      mode="contained"
      onPress={handlePress}
      color={NEON}
      style={styles.button}
      contentStyle={styles.buttonContent}
      labelStyle={styles.buttonLabel}
      icon={({ size }) => <Icon name="arrow-right" size={size} color={DARK} />}
    >
      Take Quiz Now
    </Button>
  );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 20,
        marginVertical: 24,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    buttonContent: {
        flexDirection: 'row-reverse', // to place icon on the right
    },
    buttonLabel: {
        color: DARK,
        fontWeight: 'bold',
    }
})

export default StartQuizButton;