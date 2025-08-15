import React from 'react';
import { EngagementComponent } from '..';
import { withEngagementData } from '../../common/hocs/withInitialData';

const engagement = new EngagementComponent();

const LeaderboardScreen = () => {
  return engagement.renderLeaderboardView("LeaderboardScreen");
};

export default withEngagementData(LeaderboardScreen);
