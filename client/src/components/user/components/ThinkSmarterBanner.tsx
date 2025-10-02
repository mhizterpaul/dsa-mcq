import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import Feather from 'react-native-vector-icons/Feather';
import { useSelector, useDispatch } from 'react-redux';
import { UserRootState } from '../store';
import { setUserInsight } from '../store/userInsight.slice';
import { UserInsight } from '../store/primitives/UserInsight';

const ThinkSmarterBanner = () => {
    const insight = useSelector((state: UserRootState) => state.insight.insight);
    const dispatch = useDispatch();

    const handleAddDummyData = () => {
        const dummyInsight = new UserInsight('user1');
        dummyInsight.totalQuizzesAttempted = 10;
        dispatch(setUserInsight(dummyInsight));
    };

    useEffect(() => {
        handleAddDummyData();
    }, []);

  return (
    <Card style={styles.banner}>
        <View style={styles.iconWrapper}>
            <Feather name="shield" size={24} color="black" />
        </View>
        <Card.Content style={styles.content}>
            <Title style={styles.title}>Think Smarter</Title>
            {insight && (
                <Paragraph style={styles.paragraph}>Total Quizzes Attempted: {insight.totalQuizzesAttempted}</Paragraph>
            )}
        </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#ADFF2F',
    borderRadius: 20,
    marginVertical: 40,
    alignItems: 'center',
  },
  iconWrapper: {
    backgroundColor: '#ADFF2F',
    borderRadius: 25,
    padding: 10,
    position: 'absolute',
    top: -25,
    borderWidth: 2,
    borderColor: '#121212',
    zIndex: 1,
  },
  content: {
    alignItems: 'center',
    paddingTop: 30, // to make space for the icon
  },
  title: {
      color: 'black',
      marginTop: 20,
  },
  paragraph: {
      marginTop: 20,
  }
});

export default ThinkSmarterBanner;