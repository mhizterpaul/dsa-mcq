import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { LearningComponent } from '../../learning/interface';
import { EngagementComponent } from '../../engagement/interface';

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Achievement</Text>
          {engagement.renderNotificationButton(handleNotifications)}
        </View>

        {/* Circular Progress */}
        {learning.renderQuizPerformanceIndicator(performance)}

        {/* Set Next Goal */}
        {engagement.renderGoalSetter(handleSetTarget)}

        {/* Reminders */}
        {engagement.renderReminders()}

        {/* Motivation Card */}
        {engagement.renderMotivationCard()}

        {/* Action Button */}
        {learning.renderStartQuizButton(handleTakeQuiz)}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DARK,
  },
  container: {
    padding: 0,
    backgroundColor: DARK,
    alignItems: 'center',
    minHeight: '100%',
    paddingBottom: 32,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 18,
    marginBottom: 10,
  },
  headerTitle: {
    color: NEON,
    fontWeight: 'bold',
    fontSize: 24,
    letterSpacing: 1,
  },
});

export default AchievementScreen; 