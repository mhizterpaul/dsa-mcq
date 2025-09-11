import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { LearningComponent } from '../components/learning/interface';
import learningService from '../components/learning/services/learningService';
import BackButton from '../components/common/components/BackButton';
import BottomNav from '../components/common/components/BottomNav';

type RootStackParamList = {
    Home: undefined;
    Quiz: { sessionQuestionIds: string[] };
    SessionSummary: { results: { strengths: string[]; weaknesses: string[] } };
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'Quiz'>;
type QuizScreenRouteProp = RouteProp<RootStackParamList, 'Quiz'>;

interface ScreenProps {
    navigation: NavigationProp;
    route: QuizScreenRouteProp;
}

const QuizScreen: React.FC<ScreenProps> = ({ navigation, route }) => {
    const { sessionQuestionIds } = route.params;
    const learningComponent = new LearningComponent();

    const handleQuizComplete = (answers: { [questionId: string]: { answer: string; isCorrect: boolean } }) => {
        const results = learningService.compileSessionSummary(answers);
        navigation.replace('SessionSummary', { results });
    };

    return (
        <View style={styles.container}>
            <BackButton navigation={navigation} />
            <View style={styles.content}>
                {learningComponent.renderQuiz('quiz', sessionQuestionIds, navigation, handleQuizComplete)}
            </View>
            {/* No BottomNav on Quiz Screen as per instructions */}
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
