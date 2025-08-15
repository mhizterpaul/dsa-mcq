import React from 'react';
import { View, Text } from 'react-native-ui-lib';
import { withLearningData } from '../../common/hocs/withInitialData';

const SessionSummaryScreen = () => {
  // In a real implementation, this component would use hooks
  // to access the session summary data from the Redux store.
  return (
    <View flex center>
      <Text text50b marginB-20>Session Summary</Text>
      <Text>(A summary of the user's performance would be displayed here.)</Text>
    </View>
  );
};

// Wrap the component with the HOC to load learning data
export default withLearningData(SessionSummaryScreen);
