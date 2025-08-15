import React from 'react';
import { View, Text, Button } from 'react-native-ui-lib';

const RecentQuizzes = () => {
  return (
    <View row spread centerV marginH-18 marginT-28 marginB-10>
      <Text text70b color_grey10>Recent Quiz</Text>
      <Button link label="See All" labelStyle={{color: '#FF7A3C', fontWeight: 'bold'}} />
    </View>
  );
};

export default RecentQuizzes;
