import React from 'react';
import { ListItem, Text, Button } from 'react-native-ui-lib';
import Feather from 'react-native-vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import { LearningRootState } from '../../learning/store';
import { removeBookmark } from '../store/user.slice';

const BookmarkListItem = ({ questionId, index }: { questionId: string, index: number }) => {
  const dispatch = useDispatch();
  const question = useSelector((state: LearningRootState) => state.questions.entities[questionId]);

  const handleRemoveBookmark = () => {
    dispatch(removeBookmark(questionId));
  };

  if (!question) {
    return null;
  }

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
          <Button label="Remove" onPress={handleRemoveBookmark} />
      </ListItem.Part>
    </ListItem>
  );
};

export default BookmarkListItem;
