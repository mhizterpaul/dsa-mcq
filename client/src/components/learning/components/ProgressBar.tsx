import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
    current: number;
    total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                Question {current} of {total}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        alignItems: 'center',
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProgressBar;
