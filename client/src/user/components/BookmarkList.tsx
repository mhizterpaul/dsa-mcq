import React from 'react';
import { ListItem, Text } from 'react-native-ui-lib';
import Feather from 'react-native-vector-icons/Feather';

const QuestionListItem = ({ question, index }: { question: {id: string, text: string}, index: number }) => {
  return (
    <ListItem key={question.id} height={77.5} onPress={() => {}}>
      <ListItem.Part left>
          <Text text70 grey10 marginR-15>{index + 1}</Text>
      </ListItem.Part>
      <ListItem.Part middle column>
        <ListItem.Part middle>
          <Text text70 grey10>{question.text}</Text>
        </ListItem.Part>
      </ListItem.Part>
      <ListItem.Part right>
          <Feather name="more-vertical" size={20} color="#888" />
      </ListItem.Part>
    </ListItem>
  );
};

export default QuestionListItem;
