import React from 'react';
import { View, Button } from 'react-native-ui-lib';
import Feather from 'react-native-vector-icons/Feather';
import { UserComponent } from '..';

const user = new UserComponent();

const GoalScreen = () => {
  return (
    <View flex padding-page style={{backgroundColor: '#121212'}}>
      {user.renderGoal("GoalScreen")}
      {// Add navigation backbutton
      // Ensure to include bottom navigation
      }
    </View>
  );
};

export default GoalScreen;
