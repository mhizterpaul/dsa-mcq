import React from 'react';
import { Button } from 'react-native-ui-lib';
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
      label="Take Quiz Now"
      iconSource={() => <Icon name="arrow-right" size={22} color={DARK} />}
      iconOnRight
      onPress={handlePress}
      backgroundColor={NEON}
      color={DARK}
      br20
      paddingV-16
      paddingH-32
      marginT-10
      marginB-24
    />
  );
};

export default StartQuizButton;
