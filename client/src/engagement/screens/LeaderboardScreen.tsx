import React from 'react';
import { View, Text } from 'react-native-ui-lib';
import { withEngagementData } from '../../common/hocs/withInitialData';

const LeaderboardScreen = () => {
  // This component would display the leaderboard
  // based on the data loaded from the engagement store.
  return (
    <View flex center>
      <Text text50b marginB-20>Leaderboard</Text>
      <Text>(The leaderboard would be displayed here.)</Text>
    </View>
  );
};

// Wrap the component with the HOC to load engagement data
export default withEngagementData(LeaderboardScreen);
