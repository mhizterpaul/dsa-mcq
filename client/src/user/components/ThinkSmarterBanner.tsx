import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, Card, Button } from 'react-native-ui-lib';
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
    <Card marginB-40 style={styles.banner}>
      <View centerH>
          <View style={styles.bannerIconWrapper}>
              <Feather name="shield" size={24} color="black" />
          </View>
          <Text text60BO black marginT-20>Think Smarter</Text>
          <View row centerV marginT-20 height={50} style={styles.graph}>
          {insight && (
            <Text text70b>Total Quizzes Attempted: {insight.totalQuizzesAttempted}</Text>
          )}
          </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#ADFF2F',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  bannerIconWrapper: {
    backgroundColor: '#ADFF2F',
    borderRadius: 25,
    padding: 10,
    position: 'absolute',
    top: -45,
    borderWidth: 2,
    borderColor: '#121212',
  },
  graph: {
    alignItems: 'flex-end',
  },
  graphBar: {
    width: 4,
    backgroundColor: 'black',
    marginHorizontal: 2,
    borderRadius: 2,
  },
});

export default ThinkSmarterBanner;
