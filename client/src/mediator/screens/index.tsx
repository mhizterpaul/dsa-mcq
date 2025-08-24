import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native-ui-lib';
import store from '../store';
import { Provider } from 'react-redux';
import { UserComponent, LearningComponent, EngagementComponent } from '..';
import BottomNav from '../components/BottomNav';
import AdComponent from '../components/AdComponent';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const user = new UserComponent();
const learning = new LearningComponent();
const engagement = new EngagementComponent();

const HomeScreenContent = ({ navigation }: any) => {
  const handleStartQuiz = async () => {
    const sessionQuestionIds = await learning.startNewQuizSession();
    navigation.navigate('Quiz', { sessionQuestionIds });
  };

  return (
    <View flex bg-grey80>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View row spread centerV marginT-10 marginH-18>
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

      <TouchableOpacity
        style={styles.fab}
        onPress={handleStartQuiz}
      >
        <Icon name="plus" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        right: '50%',
        bottom: 30,
        backgroundColor: '#FF7A3C',
        borderRadius: 28,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
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