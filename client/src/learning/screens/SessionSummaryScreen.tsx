import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import SessionSummary from '../components/SessionSummary';
import BottomNav from '../../mediator/components/BottomNav';

type RootStackParamList = {
    Home: undefined;
    Quiz: undefined;
    SessionSummary: { results: { strengths: string[]; weaknesses: string[] } };
};
type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
type SessionSummaryRouteProp = RouteProp<RootStackParamList, 'SessionSummary'>;

interface ScreenProps {
    navigation: NavigationProp;
    route: SessionSummaryRouteProp;
}

const SessionSummaryScreen: React.FC<ScreenProps> = ({ navigation, route }) => {
    const { results } = route.params;

    const handlePlayAgain = () => {
        navigation.replace('Quiz'); // Use replace to start a new quiz
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <SessionSummary results={results} />
            </View>
            <Button title="Play Again" onPress={handlePlayAgain} />
            <BottomNav navigation={navigation} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
    },
});

export default SessionSummaryScreen;
