import React from 'react';
import { View, Button } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LearningComponent } from '..';

const learning = new LearningComponent();

const QuizScreen = ({ navigation }: any) => {

  return (
    <View flex bg-grey80>
        <View row spread centerV paddingH-18 paddingT-10 paddingB-8 bg-white>
            <Button link iconSource={() => <Icon name="chevron-left" size={28} color="#222" />} onPress={() => navigation.goBack()} />
        </View>
        {learning.renderQuizScreen()}
    </View>
  );
};

export default QuizScreen; 