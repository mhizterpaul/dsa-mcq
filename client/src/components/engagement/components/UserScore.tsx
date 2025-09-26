import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { setUserEngagementDb } from '../store/userEngagement.slice';

const UserScore = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const userId = currentUser?.id;

  const score = useSelector((state: RootState) =>
    userId ? state.userEngagement.engagements[userId]?.xp_progress : 0
  );

  useEffect(() => {
      if (userId) {
          dispatch(setUserEngagementDb(userId));
      }
  }, [dispatch, userId]);

  return (
    <View style={styles.container}>
      <Icon name="diamond" size={18} color="#fff" />
      <Text style={styles.scoreText}>{score || 0}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#20303C', // previously bg-grey10
    borderRadius: 12, // previously br12
    paddingHorizontal: 12, // previously paddingH-12
    paddingVertical: 6, // previously paddingV-6
  },
  scoreText: {
    color: '#fff', // previously white
    fontSize: 16, // previously text80b
    fontWeight: 'bold', // previously text80b
    marginLeft: 6, // previously marginL-6
  },
});

export default UserScore;