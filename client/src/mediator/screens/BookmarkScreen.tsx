import React from 'react';
import { View, Text, Button } from 'react-native-ui-lib';
import { ScrollView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { UserComponent } from '..';

const user = new UserComponent();

const questions = [
    { id: '1', text: 'What does UI stand fo...' },
    { id: '2', text: 'Which aspect of UI de...' },
    { id: '3', text: 'How to export a pictu...' },
    { id: '4', text: 'Which term refers to t...' },
    { id: '5', text: 'Why is maintaining co...' },
  ];

const BookmarkScreen = () => {
  return (
    <View flex bg-white>
      <ScrollView contentContainerStyle={{padding: 20}}>
        <Text text80H grey40 marginB-20 uppercase>
          Questions ({questions.length})
        </Text>
        {questions.map((q, index) => (
          user.renderQuestionListItem("BookmarkScreen", q, index)
        ))}
      </ScrollView>
      <Button
        label="Result Screen"
        iconSource={() => <Feather name="bar-chart-2" size={20} color="black" />}
        backgroundColor="#eee"
        color="black"
        style={{padding: 20, borderTopWidth: 1, borderTopColor: '#ddd'}}
      />
    </View>
  );
};

export default BookmarkScreen;
