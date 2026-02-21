import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SSE from 'react-native-sse';

import { Question, API_BASE_URL } from '../services/learningService';
import QuestionCard from '../components/QuestionCard';
import ProgressBar from '../components/ProgressBar';
import AvatarGroup from '../../engagement/components/AvatarGroup';

interface DailyQuizSession {
    sessionId: string;
    participantCount: number;
    participants: { userId: string; name: string; avatarUrl: string; }[];
    questionIds: string[];
}

interface ParticipantUpdate {
    userId: string;
    name: string;
    avatarUrl: string;
    score: number;
}

interface ScreenProps {
    navigation: any;
}

const DailyQuizScreen: React.FC<ScreenProps> = ({ navigation }) => {
    const [session, setSession] = useState<DailyQuizSession | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isStarted, setIsStarted] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(120); // 2:00 mins
    const [participantUpdates, setParticipantUpdates] = useState<ParticipantUpdate[]>([]);
    const [answers, setAnswers] = useState<{ [questionId: string]: { answer: string; isCorrect: boolean } }>({});

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/daily-quiz/session`);
                const data = await response.json();
                setSession(data);

                if (data.questionIds && data.questionIds.length > 0) {
                    const qResponse = await fetch(`${API_BASE_URL}/learning/questions`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ids: data.questionIds.map((id: string) => parseInt(id, 10)) }),
                    });
                    const qData = await qResponse.json();
                    setQuestions(qData);
                }
            } catch (error) {
                console.error("Failed to fetch daily quiz session:", error);
            }
        };
        fetchSession();
    }, []);

    useEffect(() => {
        if (session) {
            const sse = new SSE(`${API_BASE_URL}/daily-quiz/events`);

            sse.addEventListener('message', (event) => {
                if (!event.data) return;
                const data = JSON.parse(event.data);
                switch (data.type) {
                    case 'participant_update':
                        setSession(prev => prev ? {
                            ...prev,
                            participants: data.payload,
                            participantCount: data.payload.length
                        } : null);
                        break;
                    case 'session_end':
                        navigation.replace('DailyQuizSummary', { sessionId: session.sessionId });
                        sse.close();
                        break;
                }
            });

            return () => {
                sse.close();
            };
        }
    }, [session, navigation]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        if (isStarted && timeLeft > 0) {
            intervalId = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (isStarted && timeLeft === 0) {
            handleNext();
        }
        return () => clearInterval(intervalId);
    }, [isStarted, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleNext = async () => {
        if (!isStarted) {
            setIsStarted(true);
            return;
        }

        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion) return;

        const correctAnswer = currentQuestion.options.find(o => o.isCorrect)?.text;
        const isCorrect = selectedOption === correctAnswer;

        const newAnswers = {
            ...answers,
            [String(currentQuestion.id)]: { answer: selectedOption || '', isCorrect }
        };
        setAnswers(newAnswers);

        // Submit answer to server
        try {
            await fetch(`${API_BASE_URL}/daily-quiz/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: session?.sessionId,
                    questionId: currentQuestion.id,
                    answer: selectedOption,
                    isCorrect
                }),
            });
        } catch (error) {
            console.error("Failed to submit answer:", error);
        }

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
        } else {
            // Last question answered, wait for session end or navigate if it's the trigger
            navigation.replace('DailyQuizSummary', { sessionId: session?.sessionId });
        }
    };

    const handleBack = () => {
        Alert.alert(
            "Exit Restricted",
            "You cannot exit the quiz until the session is over.",
            [{ text: "OK" }]
        );
    };

    if (!session || questions.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Waiting for Daily Quiz to start...</Text>
            </View>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

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
                <View style={styles.headerRight} />
            </View>

            <ProgressBar
                current={isStarted ? (currentQuestionIndex + 1) : 0}
                total={questions.length}
            />

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.quizType} testID="quiz-type">
                    {currentQuestion?.category?.toUpperCase() || 'DAILY QUIZ'}
                </Text>
                <Text style={styles.questionCount} testID="question-count">
                    {isStarted ? `Questions ${currentQuestionIndex + 1} of ${questions.length}` : `0 out of ${questions.length} questions`}
                </Text>

                {/* Member Tracking Block */}
                <View style={styles.memberTracking} testID="member-tracking">
                    <AvatarGroup
                        avatars={session.participants.map(p => p.avatarUrl)}
                        participantCount={session.participantCount}
                    />
                    <Text style={styles.memberCountText}>{session.participantCount} members in session</Text>
                </View>

                {isStarted ? (
                    <QuestionCard
                        question={currentQuestion}
                        selectedOption={selectedOption}
                        onSelectAnswer={setSelectedOption}
                    />
                ) : (
                    <View style={styles.startState}>
                        <Text style={styles.startText}>Ready to start the daily quiz?</Text>
                    </View>
                )}
            </ScrollView>

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
                    <Text style={styles.nextButtonText}>
                        {!isStarted ? 'Start Quiz' : (currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next →')}
                    </Text>
                </TouchableOpacity>
            </View>
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
        paddingHorizontal: 20,
        paddingBottom: 100,
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
    memberTracking: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        gap: 12,
    },
    memberCountText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    startState: {
        marginTop: 100,
        alignItems: 'center',
    },
    startText: {
        fontSize: 18,
        fontWeight: '500',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 40,
        backgroundColor: '#fff',
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
});

export default DailyQuizScreen;
