import React from 'react';
import { View, Text } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { EngagementRootState } from '../store/store';

const UserScore = ({ userId }: { userId: string }) => {
  const score = useSelector((state: EngagementRootState) => state.userEngagement.engagements[userId]?.xp_progress);

  return (
    <View row centerV bg-grey10 br12 paddingH-12 paddingV-6>
      <Icon name="diamond" size={18} color="#fff" />
      <Text white text80b marginL-6>{score || 0}</Text>
    </View>
  );
};

export default UserScore;
