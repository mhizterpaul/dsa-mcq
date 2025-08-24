import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

import { LearningComponent } from '../../learning/interface';
import BackButton from '../components/BackButton';
import BottomNav from '../components/BottomNav';

// This should be your root stack param list
type RootStackParamList = {
    Home: undefined;
    // other screens
};

type DailyQuizScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface DailyQuizScreenProps {
    navigation: DailyQuizScreenNavigationProp;
}

const DailyQuizScreen: React.FC<DailyQuizScreenProps> = ({ navigation }) => {
    const learningComponent = new LearningComponent();

    return (
        <View style={styles.container}>
            <BackButton navigation={navigation} />
            <View style={styles.content}>
                {learningComponent.renderDailyQuiz('dailyQuiz')}
            </View>
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
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default DailyQuizScreen;
