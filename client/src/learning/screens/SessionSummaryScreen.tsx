import React from 'react';
import { LearningComponent } from '..';
import { withLearningData } from '../../common/hocs/withInitialData';

const learning = new LearningComponent();

const SessionSummaryScreen = () => {
  return learning.renderSummary("SessionSummaryScreen");
};

export default withLearningData(SessionSummaryScreen);
