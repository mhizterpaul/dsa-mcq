import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
    current: number;
    total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
    const progress = total > 0 ? current / total : 0;

    return (
        <View style={styles.container}>
            <View style={[styles.bar, { width: `${progress * 100}%` }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 4,
        width: '100%',
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        backgroundColor: '#6200EE', // Purple color from image
    },
});

export default ProgressBar;
