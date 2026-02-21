import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { toggleBookmark } from '../../user/store/userProfile.slice';
import { QuestionResponse } from '../../user/store/primitives/UserProfile';
import { UserQuestionData } from '../store/primitives/UserQuestionData';
import { processAnswerAndUpdate, nextSubset } from '../store/learningSession.slice';
import { LearningRootState } from '../store';
import { learningService, Question } from '../services/learningService';
import ProgressBar from '../components/ProgressBar';
import QuestionCard from '../components/QuestionCard';

interface QuizProps {
    sessionQuestionIds: string[];
    onQuizComplete: (answers: { [questionId: string]: { answer: string; isCorrect: boolean } }) => void;
    navigation: any;
}

const Quiz: React.FC<QuizProps> = ({ sessionQuestionIds, onQuizComplete, navigation }) => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state: any) => state.user);
    const profile = useSelector((state: any) => state.profile.profile);
    const session = useSelector((state: any) => state.learning.learningSession.session);
    const recentQuizzesEntities = useSelector((state: any) => state.learning.recentQuizzes.entities);
    const recentQuizzes = useMemo(() => Object.values(recentQuizzesEntities), [recentQuizzesEntities]);

    const [isStarted, setIsStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(120); // 2:00 mins
    const [showExitModal, setShowExitModal] = useState(false);
    const [subsetCount, setSubsetCount] = useState(1);
    const [showPrevFeedback, setShowPrevFeedback] = useState(false);

    // Current question IDs should come from the session in store if available
    const activeQuestionIds = useMemo(() => {
        return session?.questionIds || sessionQuestionIds;
    }, [session, sessionQuestionIds]);

    useEffect(() => {
        const fetchQuestions = async () => {
            if (activeQuestionIds.length > 0) {
                try {
                    const fetchedQuestions = await learningService.getQuestionsByIds(activeQuestionIds.map(id => parseInt(id, 10)));
                    setQuestions(fetchedQuestions);
                } catch (error) {
                    console.error('Error fetching questions:', error);
                }
            }
        };
        fetchQuestions();
    }, [activeQuestionIds]);

    // Check for previous session feedback on mount
    useEffect(() => {
        if (recentQuizzes.length > 0) {
            const lastQuiz: any = recentQuizzes[recentQuizzes.length - 1];
            if (lastQuiz.completedAt) {
                const lastCompleted = new Date(lastQuiz.completedAt).getTime();
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                if (lastCompleted <= yesterday.getTime()) {
                    setShowPrevFeedback(true);
                }
            }
        }
    }, []);

    useEffect(() => {
        const question = questions[currentQuestionIndex];
        if (question && session?.answers[String(question.id)]) {
            setSelectedOption(session.answers[String(question.id)].answer);
        } else {
            setSelectedOption(null);
        }
    }, [currentQuestionIndex, questions, session?.answers]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        if (isStarted && timeLeft > 0 && !showPrevFeedback) {
            intervalId = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(intervalId);
    }, [isStarted, timeLeft, showPrevFeedback]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleNext = async () => {
        if (showPrevFeedback) {
            setShowPrevFeedback(false);
            return;
        }

        if (!isStarted) {
            setIsStarted(true);
            return;
        }

        const question = questions[currentQuestionIndex];
        if (!question || !currentUser) return;

        const correctAnswer = question.options.find(o => o.isCorrect)?.text;
        const isCorrect = selectedOption === correctAnswer;
        const quality = isCorrect ? 5 : 2;

        await dispatch(processAnswerAndUpdate({
            userId: currentUser.id,
            questionId: String(question.id),
            answer: selectedOption || '',
            isCorrect,
            quality
        }) as any);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
        } else {
            // End of subset
            if (subsetCount < 4) {
                setSubsetCount(prev => prev + 1);
                const resultAction = await dispatch(nextSubset({ subsetSize: questions.length }) as any);
                if (nextSubset.fulfilled.match(resultAction)) {
                    setCurrentQuestionIndex(0);
                    setSelectedOption(null);
                }
            } else {
                // End of session
                if (session) {
                    onQuizComplete(session.answers);
                } else {
                    onQuizComplete({});
                }
            }
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
            // In a real app we'd retrieve the previous answer from store
            setSelectedOption(null);
        } else {
            setShowExitModal(true);
        }
    };

    const confirmExit = () => {
        setShowExitModal(false);
        navigation.goBack();
    };

    const handleToggleBookmark = () => {
        const question = questions[currentQuestionIndex];
        if (!question) return;

        const bookmark: QuestionResponse = {
            questionId: String(question.id),
            mostRecentAnswer: selectedOption || '',
            isCorrect: selectedOption === question.options.find(o => o.isCorrect)?.text,
            difficultyLevel: (question.difficulty as any) || 'easy',
            feedback: null,
        };

        dispatch(toggleBookmark(bookmark));
    };

    const isBookmarked = useMemo(() => {
        const question = questions[currentQuestionIndex];
        return profile?.bookmarks.some((b: any) => b.questionId === String(question?.id));
    }, [profile?.bookmarks, questions, currentQuestionIndex]);

    if (questions.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading questions...</Text>
            </View>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    if (showPrevFeedback) {
        const lastQuiz: any = recentQuizzes[recentQuizzes.length - 1];
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} testID="back-button">
                        <Icon name="close" size={30} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Previous Session Review</Text>
                    <View style={{ width: 30 }} />
                </View>
                <ScrollView style={styles.content}>
                    <Text style={styles.feedbackTitle} testID="prev-feedback-title">Welcome back!</Text>
                    <Text style={styles.feedbackText}>Here is how you did in your last session:</Text>
                    <View style={styles.feedbackCard}>
                        <Text style={styles.feedbackScore}>Score: {lastQuiz.score}/{lastQuiz.totalQuestions}</Text>
                        <Text style={styles.feedbackSummary}>Strengths: {lastQuiz.strengths?.join(', ') || 'N/A'}</Text>
                        <Text style={styles.feedbackSummary}>Weaknesses: {lastQuiz.weaknesses?.join(', ') || 'N/A'}</Text>
                    </View>
                </ScrollView>
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.nextButton} onPress={handleNext} testID="continue-to-quiz">
                        <Text style={styles.nextButtonText}>Continue to Quiz</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={handleBack} testID="back-button">
                        <Icon name="chevron-left" size={30} color="#000" />
                    </TouchableOpacity>
                    <View style={styles.timerContainer}>
                        <Icon name="clock-outline" size={20} color="#000" />
                        <Text style={styles.timerText} testID="timer-text">{formatTime(timeLeft)}</Text>
                    </View>
                </View>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle} testID="quiz-header-title">Aptitude Test</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        onPress={handleToggleBookmark}
                        testID={isBookmarked ? "bookmark-icon-active" : "bookmark-icon"}
                    >
                        <Icon
                            name={isBookmarked ? "bookmark" : "bookmark-outline"}
                            size={28}
                            color={isBookmarked ? "#6200EE" : "#000"}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ProgressBar
                current={isStarted ? ((subsetCount - 1) * questions.length + currentQuestionIndex + 1) : 0}
                total={session?.allQuestionIds?.length || sessionQuestionIds.length}
            />

            <View style={styles.content}>
                <Text style={styles.quizType} testID="quiz-type">
                    {questions[0]?.category?.toUpperCase() || 'ALGORITHMS'}
                </Text>
                <Text style={styles.questionCount} testID="question-count">
                    {isStarted ? `Questions ${currentQuestionIndex + 1} of ${questions.length} (Subset ${subsetCount} of 4)` : `0 out of ${session?.allQuestionIds?.length || sessionQuestionIds.length} questions`}
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
                    style={[
                        styles.nextButton,
                        (isStarted && !selectedOption) && styles.disabledButton
                    ]}
                    onPress={handleNext}
                    disabled={isStarted && !selectedOption}
                    testID="next-button"
                >
                    <Text style={styles.nextButtonText}>{isStarted ? (currentQuestionIndex === questions.length - 1 && subsetCount === 4 ? 'Finish' : 'Next →') : 'Start Quiz'}</Text>
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
        paddingHorizontal: 16,
        paddingTop: 40,
        paddingBottom: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 100,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerRight: {
        width: 100,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
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
    disabledButton: {
        backgroundColor: '#CCC',
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
    },
    exitButtonText: {
        color: '#FF3B30',
    },
    feedbackTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 40,
        marginBottom: 10,
    },
    feedbackText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    feedbackCard: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 20,
    },
    feedbackScore: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    feedbackSummary: {
        fontSize: 14,
        color: '#444',
        marginBottom: 5,
    }
});

export default Quiz;
