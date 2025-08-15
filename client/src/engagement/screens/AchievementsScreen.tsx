import React from 'react';
import { View, Text } from 'react-native-ui-lib';
import { withEngagementData } from '../../common/hocs/withInitialData';

const AchievementsScreen = () => {
  // This component would display a list of achievements
  // based on the data loaded from the engagement store.
  return (
    <View flex center>
      <Text text50b marginB-20>Achievements</Text>
      <Text>(A list of user achievements would be displayed here.)</Text>
    </View>
  );
};

// Wrap the component with the HOC to load engagement data
export default withEngagementData(AchievementsScreen);
