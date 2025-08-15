import React from 'react';
import { View, Button } from 'react-native-ui-lib';
import Feather from 'react-native-vector-icons/Feather';
import { UserComponent } from '..';

const user = new UserComponent();

const GoalScreen = () => {
  return (
    <View flex padding-page style={{backgroundColor: '#121212'}}>
      {user.renderProgressBar("GoalScreen")}
      {user.renderLiveHealthierBanner("GoalScreen")}
      {user.renderGoalOption("GoalScreen", "coffee", "Drink 8 cups of water")}
      {user.renderGoalOption("GoalScreen", "activity", "Time for Your Workout")}
      {user.renderGoalOption("GoalScreen", "moon", "Walk for Wellness")}
      <Button
        label="Continue"
        labelStyle={{color: 'black', fontWeight: 'bold'}}
        iconSource={() => <Feather name="arrow-right" size={20} color="black" />}
        iconOnRight
        backgroundColor="#ADFF2F"
        style={{borderRadius: 15, padding: 15, width: '100%', position: 'absolute', bottom: 40, alignSelf: 'center'}}
      />
    </View>
  );
};

export default GoalScreen;
