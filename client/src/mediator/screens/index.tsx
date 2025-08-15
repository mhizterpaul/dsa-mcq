import React from 'react';
import { View, ScrollView } from 'react-native-ui-lib';
import { Provider } from 'react-redux';
import { UserComponent, LearningComponent, EngagementComponent } from '..';
import BottomNav from '../components/BottomNav';
import AdComponent from '../components/AdComponent';
import userStore from '../../user/store/store';
import learningStore from '../../learning/store/store';
import engagementStore from '../../engagement/store/store';

const user = new UserComponent();
const learning = new LearningComponent();
const engagement = new EngagementComponent();

const HomeScreenContent = ({ navigation }: any) => {
  const handleSelectCategory = (category: string) => {
    console.log('Selected category:', category);
    navigation.navigate('Quiz');
  };

  return (
    <View flex bg-grey80>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View row spread centerV marginT-10 marginH-18>
          {user.renderUserProfileSummary("HomeScreen")}
          {engagement.renderUserScore("HomeScreen", 1200)}
        </View>

        <View>
            {engagement.renderWeeklyKingOfQuiz("HomeScreen")}
            {learning.renderFeaturedCategories("HomeScreen", handleSelectCategory)}
            {engagement.renderDailyQuizBanner("HomeScreen")}
            <AdComponent />
            {learning.renderRecentQuizzes("HomeScreen")}
        </View>
      </ScrollView>

      <BottomNav navigation={navigation} activeScreen="Home" />
    </View>
  );
};

const HomeScreen = ({ navigation }: any) => {
  return (
    <Provider store={userStore}>
      <Provider store={learningStore}>
        <Provider store={engagementStore}>
          <HomeScreenContent navigation={navigation} />
        </Provider>
      </Provider>
    </Provider>
  );
};


export default HomeScreen; 