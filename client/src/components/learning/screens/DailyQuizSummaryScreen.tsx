import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import mediatorService from '../../../services/mediatorService';
import { API_BASE_URL } from '../services/learningService';
import Leaderboard from '../../engagement/components/Leaderboard';
import { Player } from '../../engagement/store/primitives/globalEngagement';

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
    leaderboard: Player[];
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
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading results...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.title} testID="summary-title">Quiz Results</Text>

            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Rank</Text>
                    <Text style={styles.statValue} testID="user-rank">{results.rank} / {results.totalParticipants}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>XP Earned</Text>
                    <Text style={styles.statValue} testID="xp-earned">+{results.xpEarned}</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Group Stats</Text>
            <View style={styles.leaderboardContainer}>
                <Leaderboard players={results.leaderboard} hideFilter={true} />
            </View>

            {results.badgesUnlocked.length > 0 && (
                <View style={styles.badgesSection}>
                    <Text style={styles.sectionTitle}>Badges Unlocked</Text>
                    <View style={styles.badgesContainer}>
                        {results.badgesUnlocked.map(badge => (
                            <View key={badge.id} style={styles.badgeItem}>
                                <Text style={styles.badgeName}>{badge.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.playAgainButton}
                    onPress={() => navigation.replace('DailyQuiz')}
                    testID="play-again-button"
                >
                    <Text style={styles.playAgainText}>Play Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.homeButton}
                    onPress={() => navigation.navigate('Home')}
                    testID="home-button"
                >
                    <Text style={styles.homeButtonText}>Back to Home</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 30,
        color: '#000',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    statBox: {
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 16,
        width: '48%',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#6200EE',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#000',
    },
    leaderboardContainer: {
        minHeight: 300,
        marginBottom: 30,
    },
    badgesSection: {
        marginBottom: 30,
    },
    badgesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    badgeItem: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeName: {
        fontSize: 14,
        color: '#444',
    },
    buttonContainer: {
        gap: 12,
    },
    playAgainButton: {
        backgroundColor: '#6200EE',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    playAgainText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    homeButton: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    homeButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '500',
    },
});

export default DailyQuizSummaryScreen;
