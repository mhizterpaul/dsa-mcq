import React, { useEffect } from 'react';
import { View, Text, Button, ListItem } from 'react-native-ui-lib';
import { useSelector, useDispatch } from 'react-redux';
import { UserRootState } from '../store';
import { setUserProfile } from '../store/userProfile.slice';
import { UserProfile, QuestionResponse } from '../store/primitives/UserProfile';
import Feather from 'react-native-vector-icons/Feather';

const BookmarkList = () => {
    const profile = useSelector((state: UserRootState) => state.profile.profile);
    const dispatch = useDispatch();

    const handleAddDummyData = () => {
        const dummyProfile = new UserProfile('user1');
        const dummyBookmark: QuestionResponse = {
            questionId: 'q1',
            mostRecentAnswer: '50 Mph',
            isCorrect: true,
            difficultyLevel: 'easy',
            feedback: null,
        };
        dummyProfile.bookmarks.push(dummyBookmark);
        dispatch(setUserProfile(dummyProfile));
    };

    useEffect(() => {
        handleAddDummyData();
    }, []);

    if (!profile) {
        return (
            <View center>
                <Text>Loading...</Text>
                <Button label="Add Dummy Data" onPress={handleAddDummyData} />
            </View>
        )
    }

  return (
    <View>
        <Text text60b marginB-20>Bookmarks</Text>
        {profile.bookmarks.map((bookmark, index) => (
            <ListItem key={bookmark.questionId} height={77.5} onPress={() => {}}>
                <ListItem.Part left>
                    <Text text70 grey10 marginR-15>{index + 1}</Text>
                </ListItem.Part>
                <ListItem.Part middle column>
                    <ListItem.Part middle>
                    <Text text70 grey10>Question ID: {bookmark.questionId}</Text>
                    </ListItem.Part>
                </ListItem.Part>
                <ListItem.Part right>
                    <Feather name="more-vertical" size={20} color="#888" />
                </ListItem.Part>
            </ListItem>
        ))}
    </View>
  );
};

export default BookmarkList;
