import React from 'react';
import { View, Text, ScrollView } from 'react-native-ui-lib';
import { LearningComponent, EngagementComponent } from '..';

const NEON = '#EFFF3C';
const DARK = '#181A1B';

const learning = new LearningComponent();
const engagement = new EngagementComponent();

const AchievementScreen = ({ navigation }: any) => {
  const performance = 0.75; // 75%

  const handleSetTarget = () => {
    console.log('Set target pressed');
  };

  const handleTakeQuiz = () => {
    console.log('Take quiz pressed');
  };

  const handleNotifications = () => {
    console.log('Notifications pressed');
  };

  return (
    <View flex bg-dark10>
      <ScrollView contentContainerStyle={{paddingBottom: 32, alignItems: 'center'}}>
        <View row spread centerV paddingH-24 paddingT-18 marginB-10>
          <Text color={NEON} text50b>Achievement</Text>
          {engagement.renderNotificationButton("AchievementScreen", handleNotifications)}
        </View>

        {learning.renderQuizPerformanceIndicator("AchievementScreen", performance)}
        {engagement.renderGoalSetter("AchievementScreen", handleSetTarget)}
        {engagement.renderReminders("AchievementScreen")}
        {engagement.renderMotivationCard("AchievementScreen")}
        {learning.renderStartQuizButton("AchievementScreen", handleTakeQuiz)}
      </ScrollView>
    </View>
  );
};

export default AchievementScreen; 