import React from 'react';
import { View, Text } from 'react-native-ui-lib';
import { ScrollView } from 'react-native';
import { LearningComponent, EngagementComponent } from '..';

const NEON = '#EFFF3C';
const DARK = '#181A1B';

const learning = new LearningComponent();
const engagement = new EngagementComponent();

const AchievementScreen = ({ navigation }: any) => {

  return (
    <View flex bg-dark10>
      <ScrollView contentContainerStyle={{paddingBottom: 32, alignItems: 'center'}}>
        <View row spread centerV paddingH-24 paddingT-18 marginB-10>
          <Text color={NEON} text50b>Achievement</Text>
          {engagement.renderNotificationButton("AchievementScreen")}
        </View>

        {learning.renderQuizPerformanceIndicator("AchievementScreen")}
        {engagement.renderGoalSetter("AchievementScreen")}
        {engagement.renderReminders("AchievementScreen")}
        {engagement.renderMotivationCard("AchievementScreen")}
        {learning.renderStartQuizButton("AchievementScreen")}
      </ScrollView>
    </View>
  );
};

export default AchievementScreen; 