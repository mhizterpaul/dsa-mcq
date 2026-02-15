import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { LearningComponent } from '../components/learning/interface';
import { learningService } from '../components/learning/services/learningService';
import { startNewSession, hydrateLearningSession } from '../components/learning/store/learningSession.slice';
import { AppDispatch, RootState } from '../store';

type RootStackParamList = {
    Home: undefined;
    Quiz: { sessionQuestionIds?: string[] };
    SessionSummary: { results: { strengths: string[]; weaknesses: string[] } };
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'Quiz'>;
type QuizScreenRouteProp = RouteProp<RootStackParamList, 'Quiz'>;

interface ScreenProps {
    navigation: NavigationProp;
    route: QuizScreenRouteProp;
}

const QuizScreen: React.FC<ScreenProps> = ({ navigation, route }) => {
    const { sessionQuestionIds } = route.params || {};
    const dispatch: AppDispatch = useDispatch();
    const { currentUser } = useSelector((state: RootState) => state.user);
    const session = useSelector((state: RootState) => state.learning.learningSession.session);
    const learningComponent = new LearningComponent();

    useEffect(() => {
        if (!session && currentUser) {
            const allQuestionIds = sessionQuestionIds || Array.from({ length: 20 }, (_, i) => String(i + 1));
            const subsetSize = Math.max(1, Math.floor(allQuestionIds.length / 4));
            dispatch(startNewSession({ userId: currentUser.id, allQuestionIds, subsetSize }));
        }
    }, [sessionQuestionIds, currentUser, dispatch, session]);

    const handleQuizComplete = (answers: { [questionId: string]: { answer: string; isCorrect: boolean } }) => {
        const results = learningService.compileSessionSummary(answers);
        navigation.replace('SessionSummary', { results });
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {learningComponent.renderQuiz('quiz', sessionQuestionIds || [], navigation, handleQuizComplete)}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
    },
});

export default QuizScreen;
