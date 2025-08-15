import React from 'react';
import { View, Text } from 'react-native-ui-lib';

const SessionSummary = () => {
  // In a real implementation, this component would use hooks
  // to access the session summary data from the Redux store.
  return (
    <View flex center>
      <Text text50b marginB-20>Session Summary</Text>
      <Text>(A summary of the user's performance would be displayed here.)</Text>
    </View>
  );
};

export default SessionSummary;
