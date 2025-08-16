import React from 'react';
import { View, Text } from 'react-native-ui-lib';
import { useSelector } from 'react-redux';
import { LearningRootState } from '../store';

const SessionSummary = () => {
  const summary = useSelector((state: LearningRootState) => state.learningSession.session?.summary);

  if (!summary) {
    return (
      <View flex center>
        <Text text50b marginB-20>Session Summary</Text>
        <Text>No session summary available.</Text>
      </View>
    );
  }

  return (
    <View flex padding-page>
      <Text text40b marginB-20>Session Summary</Text>
      <View>
        <Text text60b>Strengths:</Text>
        {summary.strengths.map((strength, index) => (
          <Text key={index}>{strength}</Text>
        ))}
      </View>
      <View marginT-20>
        <Text text60b>Weaknesses:</Text>
        {summary.weaknesses.map((weakness, index) => (
          <Text key={index}>{weakness}</Text>
        ))}
      </View>
    </View>
  );
};

export default SessionSummary;
