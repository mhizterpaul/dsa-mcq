import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import QuizPerformanceIndicator from './QuizPerformanceIndicator';
import Feedback from './Feedback';

interface SessionSummaryProps {
    results: {
        strengths: string[];
        weaknesses: string[];
    };
}

const SessionSummary: React.FC<SessionSummaryProps> = ({ results }) => {

    // Dummy data for now, as we don't have feedback generation yet
    const feedback = {
        correctApproach: "You showed strong performance in several areas.",
        incorrectApproach: "There are a few areas to focus on for improvement."
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Session Summary</Text>
            <QuizPerformanceIndicator />
            <Feedback
                correctApproach={feedback.correctApproach}
                incorrectApproach={feedback.incorrectApproach}
            />
            <View style={styles.resultsContainer}>
                <Text style={styles.subtitle}>Strengths (Correctly Answered)</Text>
                {results.strengths.map((strength, index) => (
                    <Text key={index} style={styles.resultItem}>- Question ID: {strength}</Text>
                ))}
            </View>
            <View style={styles.resultsContainer}>
                <Text style={styles.subtitle}>Areas for Improvement (Incorrectly Answered)</Text>
                {results.weaknesses.map((weakness, index) => (
                    <Text key={index} style={styles.resultItem}>- Question ID: {weakness}</Text>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    resultsContainer: {
        marginTop: 20,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    resultItem: {
        fontSize: 16,
        marginLeft: 10,
    }
});

export default SessionSummary;
