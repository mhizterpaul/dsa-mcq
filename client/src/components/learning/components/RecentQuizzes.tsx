import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { RootState } from '../../../store';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = { History: undefined; };
type NavigationProp = StackNavigationProp<RootStackParamList, 'History'>;

interface RecentQuizzesProps {
    navigation: NavigationProp;
}

const selectRecentQuizzesEntities = (state: RootState) => state.learning.recentQuizzes.entities;

const selectRecentQuizzes = createSelector(
    [selectRecentQuizzesEntities],
    (entities) => Object.values(entities)
);

const RecentQuizzes: React.FC<RecentQuizzesProps> = ({ navigation }) => {
    const recentQuizzes = useSelector(selectRecentQuizzes);

    const handleSeeAll = () => {
        navigation.navigate('History');
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Recent Quiz</Text>
                <Button
                    mode="text"
                    onPress={handleSeeAll}
                    labelStyle={styles.seeAllButton}
                >
                    See All
                </Button>
            </View>
            {recentQuizzes.map((quiz, index) => (
                <Card key={quiz.id} style={styles.card} testID={index === 0 ? 'recent-1' : undefined} onPress={handleSeeAll}>
                    <Card.Content style={styles.cardContent}>
                        <View>
                            <Text style={styles.quizName}>{quiz.name}</Text>
                            <Text style={styles.score}>Score: {quiz.score}/{quiz.totalQuestions}</Text>
                        </View>
                        <Button mode="contained" onPress={() => console.log('Retake pressed')} style={styles.retakeButton}>
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
        marginTop: 28,
        marginHorizontal: 18,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
    },
    seeAllButton: {
        color: '#FF7A3C',
    },
    card: {
        marginBottom: 12,
        backgroundColor: 'white',
        borderRadius: 20,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quizName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    score: {
        fontSize: 14,
        color: '#757575',
    },
    retakeButton: {
        backgroundColor: '#FF7A3C',
    },
});

export default RecentQuizzes;