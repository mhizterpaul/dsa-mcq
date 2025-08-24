import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FeedbackProps {
    correctApproach: string;
    incorrectApproach: string;
}

const Feedback: React.FC<FeedbackProps> = ({ correctApproach, incorrectApproach }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Feedback</Text>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Correct Approach</Text>
                <Text style={styles.text}>{correctApproach}</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Common Pitfall</Text>
                <Text style={styles.text}>{incorrectApproach}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    section: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    text: {
        fontSize: 14,
        color: '#555',
    },
});

export default Feedback;
