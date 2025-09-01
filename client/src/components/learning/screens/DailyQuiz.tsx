import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import SSE from 'react-native-sse';

import { Question } from '../services/learningService';
import QuestionCard from '../components/QuestionCard';
import AvatarGroup from '../../engagement/components/AvatarGroup';
import { API_BASE_URL } from '../services/learningService'; // Assuming API_BASE_URL is exported

interface DailyQuizSession {
    sessionId: string;
    participantCount: number;
    participants: { userId: string; name: string; avatarUrl: string; }[];
}

interface ParticipantUpdate {
    userId: string;
    name: string;
    avatarUrl: string;
    timeTaken: number;
}

interface ScreenProps {
    navigation: any; // Use a proper navigation type
}

const DailyQuizScreen: React.FC<ScreenProps> = ({ navigation }) => {
    const [session, setSession] = useState<DailyQuizSession | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [participantUpdates, setParticipantUpdates] = useState<ParticipantUpdate[]>([]);
    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        // Fetch session data on mount
        const fetchSession = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/daily-quiz/session`);
                const data = await response.json();
                setSession(data);
            } catch (error) {
                console.error("Failed to fetch daily quiz session:", error);
            }
        };
        fetchSession();
    }, []);

    useEffect(() => {
        if (session) {
            // Connect to SSE stream
            const sse = new SSE(`${API_BASE_URL}/daily-quiz/events`);

            sse.addEventListener('message', (event) => {
                const data = JSON.parse(event.data);
                switch (data.type) {
                    case 'question':
                        setCurrentQuestion(data.question);
                        setTimeLeft(60); // Reset timer for new question
                        break;
                    case 'participant_answered':
                        setParticipantUpdates(prev => [...prev, data.payload]);
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
    }, [session]);

    // Timer logic
     useEffect(() => {
        if (!currentQuestion) return;
        if (timeLeft === 0) {
            // Handle timeout - maybe submit a null answer
            return;
        }
        const intervalId = setInterval(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft, currentQuestion]);

    const handleAnswerSelect = async (answer: string) => {
        if (!currentQuestion) return;

        try {
            await fetch(`${API_BASE_URL}/daily-quiz/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId: currentQuestion.id, answer }),
            });
        } catch (error) {
            console.error("Failed to submit answer:", error);
        }
    };

    if (!session || !currentQuestion) {
        return <View style={styles.container}><Text>Waiting for Daily Quiz to start...</Text></View>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Daily Quiz</Text>
            <Text style={styles.timer}>{timeLeft}s</Text>
            <AvatarGroup avatars={session.participants.map(p => p.avatarUrl)} participantCount={session.participantCount} />

            <QuestionCard question={currentQuestion} onSelectAnswer={handleAnswerSelect} />

            <View style={styles.footer}>
                <Button label="Quit" backgroundColor="red" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    timer: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'orange',
        marginBottom: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
    }
});

export default DailyQuizScreen;
