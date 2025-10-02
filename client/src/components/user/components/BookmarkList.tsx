import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { List, Text, Button, ActivityIndicator } from 'react-native-paper';
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
            <View style={styles.centered}>
                <ActivityIndicator animating={true} />
                <Button onPress={handleAddDummyData}>Add Dummy Data</Button>
            </View>
        )
    }

  return (
    <View style={styles.container}>
        <Text style={styles.header}>Bookmarks ({profile.bookmarks.length})</Text>
        <ScrollView contentContainerStyle={styles.scrollContent}>
        {profile.bookmarks.map((bookmark, index) => (
            <List.Item
                key={bookmark.questionId}
                title={`Question ID: ${bookmark.questionId}`}
                left={() => <Text style={styles.itemIndex}>{index + 1}</Text>}
                right={() => <Feather name="more-vertical" size={20} color="#888" />}
                style={styles.listItem}
            />
        ))}

      </ScrollView>
          <Button
            icon={() => <Feather name="bar-chart-2" size={20} color="black" />}
            mode="contained"
            style={styles.footerButton}
          >
            Result Screen
          </Button>
    </View>

  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'grey',
        margin: 20,
        textTransform: 'uppercase',
    },
    scrollContent: {
        padding: 20,
    },
    listItem: {
        height: 77.5,
    },
    itemIndex: {
        fontSize: 16,
        color: 'grey',
        marginRight: 15,
    },
    footerButton: {
        margin: 20,
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        backgroundColor: '#eee',
    }
});

export default BookmarkList;