import React from 'react';
import { EngagementComponent } from '..';
import { withEngagementData } from '../../common/hocs/withInitialData';

const engagement = new EngagementComponent();

const AchievementsScreen = () => {
  return engagement.renderAchievements("AchievementsScreen");
};

export default withEngagementData(AchievementsScreen);
