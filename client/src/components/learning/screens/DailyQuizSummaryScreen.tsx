import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import mediatorService from '../../../services/mediatorService';
import { API_BASE_URL } from '../services/learningService';

// Define types for route params and results
type RootStackParamList = { DailyQuizSummary: { sessionId: string; }; };
type ScreenRouteProp = RouteProp<RootStackParamList, 'DailyQuizSummary'>;

interface ScreenProps {
    route: ScreenRouteProp;
    navigation: any;
}

interface Results {
    rank: number;
    totalParticipants: number;
    xpEarned: number;
    badgesUnlocked: { id: string; name: string; }[];
}

const DailyQuizSummaryScreen: React.FC<ScreenProps> = ({ route, navigation }) => {
    const { sessionId } = route.params;
    const [results, setResults] = useState<Results | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/daily-quiz/results?sessionId=${sessionId}`);
                const data = await res.json();

                // Also fetch badges via the mediator
                const badges = await mediatorService.getEarnedBadgesForSession(sessionId);
                data.badgesUnlocked = badges; // Combine results

                setResults(data);
            } catch (error) {
                console.error("Failed to fetch daily quiz results:", error);
            }
        };

        fetchResults();
    }, [sessionId]);

    if (!results) {
        return <View style={styles.container}><Text>Loading results...</Text></View>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Daily Quiz Results</Text>
            <Text style={styles.text}>Rank: {results.rank} / {results.totalParticipants}</Text>
            <Text style={styles.text}>XP Earned: {results.xpEarned}</Text>
            <Text style={styles.subtitle}>Badges Unlocked:</Text>
            {results.badgesUnlocked.map(badge => (
                <Text key={badge.id} style={styles.badge}>- {badge.name}</Text>
            ))}
            <Button title="Done" onPress={() => navigation.navigate('Home')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    text: {
        fontSize: 18,
        marginBottom: 10,
    },
    badge: {
        fontSize: 16,
    }
});

export default DailyQuizSummaryScreen;
