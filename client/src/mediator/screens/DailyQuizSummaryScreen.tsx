import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import DailyQuizSummaryScreen from '../../learning/screens/DailyQuizSummaryScreen';

type RootStackParamList = {
    Home: undefined;
    DailyQuizSummary: { sessionId: string };
};
type NavigationProp = StackNavigationProp<RootStackParamList, 'DailyQuizSummary'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'DailyQuizSummary'>;

interface ScreenProps {
    navigation: NavigationProp;
    route: ScreenRouteProp;
}

const MediatorDailyQuizSummaryScreen: React.FC<ScreenProps> = ({ navigation, route }) => {
    return (
        <View style={styles.container}>
            <DailyQuizSummaryScreen navigation={navigation} route={route} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default MediatorDailyQuizSummaryScreen;
