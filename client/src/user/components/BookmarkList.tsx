import React from 'react';
import { FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { UserRootState } from '../store';
import BookmarkListItem from './BookmarkListItem';

const BookmarkList = () => {
  const bookmarkedQuestions = useSelector((state: UserRootState) => state.user.currentUser?.bookmarkedQuestions);

  if (!bookmarkedQuestions) {
    return null;
  }

  return (
    <FlatList
      data={bookmarkedQuestions}
      renderItem={({ item, index }) => <BookmarkListItem questionId={item} index={index} />}
      keyExtractor={(item) => item}
    />
  );
};

export default BookmarkList;
