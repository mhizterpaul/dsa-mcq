import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { LearningRootState } from '../store';
import { addRecentQuiz } from '../store/recentQuizzes.slice';
import { RecentQuiz } from '../store/primitives/RecentQuiz';

const RecentQuizzes = () => {
    const recentQuizzes = useSelector((state: LearningRootState) => Object.values(state.recentQuizzes.entities));
    const dispatch = useDispatch();

    const handleAddDummyData = () => {
        const dummyQuiz: RecentQuiz = {
            id: `rq_${Date.now()}`,
            name: 'Aptitude Test',
            score: 8,
            totalQuestions: 10,
        };
        dispatch(addRecentQuiz(dummyQuiz));
    };

    useEffect(() => {
        handleAddDummyData();
    }, [dispatch]);

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>Recent Quiz</Text>
            <Button mode="text" labelStyle={styles.seeAllButtonLabel} onPress={() => { /* Handle See All */ }}>
              See All
            </Button>
        </View>
        {recentQuizzes.map((quiz) => (
            <Card key={quiz.id} style={styles.card}>
                <Card.Content style={styles.cardContent}>
                    <View style={styles.quizInfo}>
                        <Text style={styles.quizName}>{quiz.name}</Text>
                        <Text style={styles.quizScore}>Score: {quiz.score}/{quiz.totalQuestions}</Text>
                    </View>
                    <Button mode="contained" compact onPress={() => { /* Handle Retake */ }}>
                      Retake
                    </Button>
                </Card.Content>
            </Card>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 18, // marginH-18
        marginTop: 28, // marginT-28
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10, // marginB-10
    },
    title: {
        fontSize: 18, // text70b
        fontWeight: 'bold', // text70b
        color: '#212121', // color_grey10
    },
    seeAllButtonLabel: {
        color: '#FF7A3C',
        fontWeight: 'bold',
    },
    card: {
        marginBottom: 10, // marginB-10
        backgroundColor: 'white',
        borderRadius: 20, // br20
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16, // padding-16
    },
    quizInfo: {
        flex: 1,
    },
    quizName: {
        fontSize: 18, // text70b
        fontWeight: 'bold',
    },
    quizScore: {
        fontSize: 14, // text80
    },
});

export default RecentQuizzes;