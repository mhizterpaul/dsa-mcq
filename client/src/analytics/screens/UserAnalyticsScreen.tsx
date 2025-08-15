import React from 'react';
import { AnalyticsComponent } from '..';

const analytics = new AnalyticsComponent();

const UserAnalyticsScreen = () => {
  return analytics.renderUserAnalytics("UserAnalyticsScreen");
};

export default UserAnalyticsScreen;
