import React from 'react';
import { View, Text, Avatar } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const WeeklyKingOfQuiz = () => {
  return (
    <View row spread centerV bg-purple20 br20 marginH-18 marginT-18 padding-18>
      <View>
        <Text white text70b>This week's</Text>
        <Text white text60b>King of the Quiz</Text>
      </View>
      <View center>
        <Avatar size={60} source={{uri: 'https://randomuser.me/api/portraits/men/35.jpg'}} />
        <Text white text80b marginT-4>Moktum Talukdar</Text>
        <View row centerV>
            <Icon name="diamond" size={14} color="#FFBE0B" />
            <Text text80b color-yellow30 marginL-4>12000 diamonds</Text>
        </View>
      </View>
    </View>
  );
};

export default WeeklyKingOfQuiz;
