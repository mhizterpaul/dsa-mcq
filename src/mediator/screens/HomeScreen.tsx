import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Provider } from 'react-redux';
import { UserComponent } from '../../user/interface';
import { LearningComponent } from '../../learning/interface';
import { EngagementComponent } from '../../engagement/interface';
import BottomNav from '../components/BottomNav';
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
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top: Profile & Score */}
        <View style={styles.topRow}>
          {user.renderUserProfileSummary()}
          {engagement.renderUserScore(1200)}
        </View>

        {/* Game Modes */}
        {learning.renderGameModes()}

        {/* Featured Categories */}
        {learning.renderFeaturedCategories(handleSelectCategory)}

        {/* Promo Banner */}
        {engagement.renderPromoBanner()}

        {/* Recent Quiz */}
        {learning.renderRecentQuizzes()}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav navigation={navigation} activeScreen="Home" />
    </SafeAreaView>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8FF' },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 18,
  },
});

export default HomeScreen; 