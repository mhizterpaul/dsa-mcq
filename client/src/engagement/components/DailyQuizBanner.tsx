import React from 'react';
import { View, Text, Button } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DailyQuizBanner = () => {
  return (
    <View row spread centerV bg-orange20 br20 marginH-18 marginT-18 padding-18>
      <View>
        <Text text70b>Daily Quiz</Text>
        <Text text80>Join a quiz to win diamonds</Text>
        <Button label="Join a quiz" bg-orange50 br12 size={Button.sizes.small} marginT-10/>
      </View>
      <Icon name="head-question-outline" size={48} color="white" />
    </View>
  );
};

export default DailyQuizBanner;
