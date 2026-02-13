import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserQuestionData } from '../store/primitives/UserQuestionData';
import { updateUserQuestionData } from '../store/userQuestionData.slice';
import { LearningRootState } from '../store';
import learningService, { Question } from '../services/learningService';
import ProgressBar from '../components/ProgressBar';
import QuestionCard from '../components/QuestionCard';

interface QuizProps {
    sessionQuestionIds: string[];
    onQuizComplete: (answers: { [questionId: string]: { answer: string; isCorrect: boolean } }) => void;
    navigation: any;
}

const Quiz: React.FC<QuizProps> = ({ sessionQuestionIds, onQuizComplete, navigation }) => {
    const dispatch = useDispatch();
    const userQuestionData = useSelector((state: any) => state.learning.userQuestionData.entities);
    const { currentUser } = useSelector((state: any) => state.user);

    const [isStarted, setIsStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [sessionAnswers, setSessionAnswers] = useState<{ [questionId: string]: { answer: string; isCorrect: boolean } }>({});
    const [timeLeft, setTimeLeft] = useState(120); // 2:00 mins
    const [showExitModal, setShowExitModal] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            if (sessionQuestionIds.length > 0) {
                try {
                    const fetchedQuestions = await learningService.getQuestionsByIds(sessionQuestionIds.map(id => parseInt(id, 10)));
                    setQuestions(fetchedQuestions);
                } catch (error) {
                    console.error('Error fetching questions:', error);
                }
            }
        };
        fetchQuestions();
    }, [sessionQuestionIds]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        if (isStarted && timeLeft > 0) {
            intervalId = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(intervalId);
    }, [isStarted, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleNext = () => {
        if (!isStarted) {
            setIsStarted(true);
            return;
        }

        const question = questions[currentQuestionIndex];
        if (!question || !currentUser) return;

        const correctAnswer = question.options.find(o => o.isCorrect)?.text;
        const isCorrect = selectedOption === correctAnswer;

        const newAnswers = { ...sessionAnswers, [question.id]: { answer: selectedOption || '', isCorrect } };
        setSessionAnswers(newAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
        } else {
            onQuizComplete(newAnswers);
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
            const prevQuestionId = questions[currentQuestionIndex - 1].id;
            setSelectedOption(sessionAnswers[prevQuestionId]?.answer || null);
        } else {
            setShowExitModal(true);
        }
    };

    const confirmExit = () => {
        setShowExitModal(false);
        navigation.goBack();
    };

    if (questions.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading questions...</Text>
            </View>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} testID="back-button">
                    <Icon name="chevron-left" size={30} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} testID="quiz-header-title">Aptitude Test</Text>
                <View style={styles.timerContainer}>
                    <Icon name="clock-outline" size={20} color="#000" />
                    <Text style={styles.timerText} testID="timer-text">{formatTime(timeLeft)}</Text>
                </View>
            </View>

            <ProgressBar current={isStarted ? currentQuestionIndex + 1 : 0} total={questions.length} />

            <View style={styles.content}>
                <Text style={styles.quizType} testID="quiz-type">
                    {questions[0]?.category?.toUpperCase() || 'ALGORITHMS'}
                </Text>
                <Text style={styles.questionCount} testID="question-count">
                    {isStarted ? `Questions ${currentQuestionIndex + 1} of ${questions.length}` : `0 out of ${questions.length} questions`}
                </Text>

                {isStarted ? (
                    <QuestionCard
                        question={currentQuestion}
                        selectedOption={selectedOption}
                        onSelectAnswer={setSelectedOption}
                    />
                ) : (
                    <View style={styles.startState}>
                        <Text style={styles.startText}>Ready to start the quiz?</Text>
                    </View>
                )}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNext}
                    testID="next-button"
                >
                    <Text style={styles.nextButtonText}>{isStarted ? (currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next →') : 'Start Quiz'}</Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={showExitModal}
                transparent={true}
                animationType="fade"
                testID="exit-modal"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Exit Quiz?</Text>
                        <Text style={styles.modalMessage}>Are you sure you want to exit the quiz? Your progress will be lost.</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setShowExitModal(false)} style={styles.modalButton}>
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={confirmExit} style={[styles.modalButton, styles.exitButton]}>
                                <Text style={[styles.modalButtonText, styles.exitButtonText]}>Exit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 40,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timerText: {
        fontSize: 16,
        fontWeight: '500',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    quizType: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 20,
    },
    questionCount: {
        fontSize: 14,
        color: '#6200EE',
        marginTop: 4,
        marginBottom: 10,
    },
    startState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    startText: {
        fontSize: 18,
        fontWeight: '500',
    },
    footer: {
        padding: 20,
        paddingBottom: 40,
    },
    nextButton: {
        backgroundColor: '#000',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    modalMessage: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 16,
    },
    modalButton: {
        padding: 8,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#6200EE',
    },
    exitButton: {
        // styles for exit button if needed
    },
    exitButtonText: {
        color: '#FF3B30',
    },
});

export default Quiz;
