import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchUserProfile } from '../components/user/store/user.slice';
import { UserComponent } from '../components/user/interface';
import { LearningComponent } from '../components/learning/interface';
import { EngagementComponent } from '../components/engagement/interface';
import BottomNav from '../components/common/components/BottomNav';
import AdComponent from '../components/common/components/AdComponent';

const user = new UserComponent();
const learning = new LearningComponent();
const engagement = new EngagementComponent();

const HomeScreen = ({ navigation }: any) => {
  const dispatch: AppDispatch = useDispatch();
  const { currentUser, loading, error } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // if there's a user, fetch their latest profile data
    if (currentUser) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, currentUser?.id]); // re-fetch if user id changes

  useEffect(() => {
    // if not loading and no user, redirect to auth
    if (!loading && !currentUser) {
      navigation.navigate('Auth');
    }
  }, [currentUser, loading, navigation]);

  const handleStartQuiz = async () => {
    try {
      const sessionQuestionIds = await learning.startNewQuizSession();
      navigation.navigate('Quiz', { sessionQuestionIds });
    } catch (error) {
      console.error('Failed to start quiz session:', error);
      // Optionally, display an error message to the user
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View testID="topLeft">
            {engagement.renderUserScore("index")}
          </View>
          <View testID="topRight">
            {user.renderUserProfileSummary("index", currentUser?.fullName || '', currentUser?.xp || 0)}
          </View>
        </View>

        <View>
            <View testID="banner-leaderboard">
              {engagement.renderWeeklyKingOfQuiz("index", navigation)}
            </View>
            {engagement.renderDailyQuizBanner("index", navigation)}
            <AdComponent />
            <View testID="browse-smart">
              {learning.renderFeaturedCategories("index")}
            </View>
            {learning.renderRecentQuizzes("index", navigation)}
        </View>
      </ScrollView>

      <BottomNav navigation={navigation} activeScreen="Home" />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleStartQuiz}
        testID="banner-start-quiz"
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

export default HomeScreen;