import React from 'react';
import { View, ScrollView } from 'react-native-ui-lib';
import store from '../store';
import { Provider } from 'react-redux';
import { UserComponent, LearningComponent, EngagementComponent } from '..';
import BottomNav from '../components/BottomNav';
import AdComponent from '../components/AdComponent';

const user = new UserComponent();
const learning = new LearningComponent();
const engagement = new EngagementComponent();

const HomeScreenContent = ({ navigation }: any) => {

  return (
    <View flex bg-grey80>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View row spread centerV marginT-10 marginH-18>
          {user.renderUserProfileSummary("index")}
          {engagement.renderUserScore("index")}
        </View>

        <View>
            {engagement.renderWeeklyKingOfQuiz("index")}
            {engagement.renderDailyQuizBanner("index")}
            <AdComponent />
            {learning.renderFeaturedCategories("index")}
            {learning.renderRecentQuizzes("index")}
        </View>
      </ScrollView>

      <BottomNav navigation={navigation} activeScreen="Home" />
    </View>
  );
};

const HomeScreen = ({ navigation }: any) => {
  return (
    <Provider store={store}>
      <HomeScreenContent navigation={navigation} />
    </Provider>
  );
};


export default HomeScreen; 