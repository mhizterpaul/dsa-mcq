import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import store from '../store';
import { Provider } from 'react-redux';
import { UserComponent } from '../components/user/interface';
import { LearningComponent } from '../components/learning/interface';
import { EngagementComponent } from '../components/engagement/interface';
import BottomNav from '../components/common/components/BottomNav';
import AdComponent from '../components/common/components/AdComponent';

const user = new UserComponent();
const learning = new LearningComponent();
const engagement = new EngagementComponent();

const HomeScreenContent = ({ navigation }: any) => {
  const handleStartQuiz = async () => {
    const sessionQuestionIds = await learning.startNewQuizSession();
    navigation.navigate('Quiz', { sessionQuestionIds });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {user.renderUserProfileSummary("index")}
          {engagement.renderUserScore("index")}
        </View>

        <View>
            {engagement.renderWeeklyKingOfQuiz("index")}
            {engagement.renderDailyQuizBanner("index", navigation)}
            <AdComponent />
            {learning.renderFeaturedCategories("index")}
            {learning.renderRecentQuizzes("index")}
        </View>
      </ScrollView>

      <BottomNav navigation={navigation} activeScreen="Home" />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleStartQuiz}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5', // bg-grey80
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginHorizontal: 18,
    },
    fab: {
        position: 'absolute',
        right: '50%',
        bottom: 30,
        backgroundColor: '#FF7A3C',
        transform: [{ translateX: 28 }], // Center the button
    },
});

const HomeScreen = ({ navigation }: any) => {
  return (
    <Provider store={store}>
      <HomeScreenContent navigation={navigation} />
    </Provider>
  );
};


export default HomeScreen;