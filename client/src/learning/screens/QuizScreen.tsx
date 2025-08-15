import React from 'react';
import { LearningComponent } from '..';
import { withLearningData } from '../../common/hocs/withInitialData';

const learning = new LearningComponent();

const QuizScreen = () => {
  return learning.renderQuizView("QuizScreen");
};

export default withLearningData(QuizScreen);
