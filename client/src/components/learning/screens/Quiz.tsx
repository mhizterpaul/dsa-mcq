import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { UserQuestionData } from '../store/primitives/UserQuestionData';
import { updateUserQuestionData } from '../store/userQuestionData.slice';

import { LearningRootState } from '../store';
import learningService, { Question } from '../services/learningService';
import ProgressBar from '../components/ProgressBar';
import QuestionCard from '../components/QuestionCard';

// Assume these are passed in when the quiz is started
interface QuizProps {
    sessionQuestionIds: string[];
    onQuizComplete: (answers: { [questionId: string]: { answer: string; isCorrect: boolean } }) => void;
    navigation: any; // Add proper navigation type
}

const Quiz: React.FC<QuizProps> = ({ sessionQuestionIds, onQuizComplete, navigation }) => {
    const dispatch = useDispatch();
    const userQuestionData = useSelector((state: LearningRootState) => state.userQuestionData.entities);
    const { currentUser } = useSelector((state: LearningRootState) => state.user);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);
    const [sessionAnswers, setSessionAnswers] = useState<{ [questionId: string]: { answer: string; isCorrect: boolean } }>({});
    const [timeLeft, setTimeLeft] = useState(45);

    // Fetch question data when the component mounts or the session changes
    useEffect(() => {
        const fetchQuestions = async () => {
            if (sessionQuestionIds.length > 0) {
                // For now, fetch all questions for the session at once.
                // A more advanced implementation would fetch subsets.
                const fetchedQuestions = await learningService.getQuestionsByIds(sessionQuestionIds.map(id => parseInt(id, 10)));
                setQuestions(fetchedQuestions);
            }
        };
        fetchQuestions();
    }, [sessionQuestionIds]);

    // Timer logic
    useEffect(() => {
        if (timeLeft === 0) {
            handleNext();
            return;
        }
        const intervalId = setInterval(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft]);

    const handleNext = useCallback(() => {
        const question = questions[currentQuestionIndex];
        if (!question || !currentUser) return;

        const correctAnswer = question.options.find(o => o.isCorrect)?.text;
        const isCorrect = currentAnswer === correctAnswer;
        const quality = currentAnswer === null ? 0 : (isCorrect ? 5 : 1);

        const uqd = userQuestionData[question.id] || new UserQuestionData(currentUser.id, String(question.id));
        const updatedUqd = learningService.processAnswer(uqd, isCorrect, quality);
        dispatch(updateUserQuestionData({ id: updatedUqd.questionId, changes: updatedUqd }));

        const newAnswers = { ...sessionAnswers, [question.id]: { answer: currentAnswer || '', isCorrect } };
        setSessionAnswers(newAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setTimeLeft(45); // Reset timer
            setCurrentAnswer(null);
        } else {
            onQuizComplete(newAnswers);
        }
    }, [currentQuestionIndex, questions, onQuizComplete, currentAnswer, currentUser, userQuestionData, dispatch, sessionAnswers]);

    const handleQuit = () => {
        // Navigate back to home
        navigation.navigate('Home');
    };

    if (questions.length === 0) {
        return (
            <View style={styles.container}>
                <Text>Loading questions...</Text>
            </View>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <View style={styles.container}>
            {/* Header would be rendered by the mediator wrapper */}
            <Text style={styles.timer}>{timeLeft}s</Text>
            <ProgressBar current={currentQuestionIndex + 1} total={questions.length} />
            <QuestionCard
                question={currentQuestion}
                onSelectAnswer={setCurrentAnswer}
            />
            <View style={styles.footer}>
                <Button label="Quit" onPress={handleQuit} backgroundColor="red" />
                <Button label="Next" onPress={handleNext} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    timer: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
    },
});

export default Quiz;
