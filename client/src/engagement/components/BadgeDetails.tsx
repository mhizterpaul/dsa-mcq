import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { Achievement } from '../store/primitives/UserEngagement';

interface BadgeDetailsProps {
    badge: Achievement;
    imageSource: ImageSourcePropType;
}

const BadgeDetails: React.FC<BadgeDetailsProps> = ({ badge, imageSource }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.dateText}>Unlocked on {new Date().toLocaleDateString()}</Text>
            <Text style={styles.title}>Badge Unlocked!</Text>
            <Image source={imageSource} style={styles.badgeIcon} />
            <Text style={styles.badgeName}>{badge.name}</Text>
            <Text style={styles.description}>{badge.description}</Text>
            {!badge.achieved && (
                <Text style={styles.criteria}>How to unlock: {badge.unlockCriteria}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    dateText: {
        color: 'gray',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    badgeIcon: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    badgeName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        textAlign: 'center',
        color: 'gray',
        marginBottom: 20,
    },
    criteria: {
        textAlign: 'center',
        color: 'green',
        fontWeight: 'bold',
    }
});

export default BadgeDetails;
