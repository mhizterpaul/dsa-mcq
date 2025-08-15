import React from 'react';
import { View, Text, ScrollView, Button } from 'react-native-ui-lib';
import { Provider } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { EngagementComponent } from '..';
import engagementStore from '../../engagement/store/store';
import BottomNav from '../components/BottomNav';

const engagement = new EngagementComponent();

const LeaderboardScreenContent = ({ navigation }: any) => {
  return (
    <View flex bg-grey80>
      <View row spread centerV paddingH-18 paddingT-10 paddingB-8 bg-white style={{borderBottomWidth: 1, borderBottomColor: '#F0F0F0'}}>
        <Button link iconSource={() => <Icon name="chevron-left" size={28} color="#222" />} onPress={() => navigation.goBack()} />
        <Text text70b color_grey10>Leaderboard</Text>
        <View width={28} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {engagement.renderLeaderboard()}
      </ScrollView>

      <BottomNav navigation={navigation} activeScreen="Leaderboard" />
    </View>
  );
};

const LeaderboardScreen = ({ navigation }: any) => {
  return (
    <Provider store={engagementStore}>
      <LeaderboardScreenContent navigation={navigation} />
    </Provider>
  );
};

export default LeaderboardScreen; 