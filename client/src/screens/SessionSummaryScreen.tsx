import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

import SessionSummaryScreen from '../../learning/screens/SessionSummaryScreen';

type RootStackParamList = { Home: undefined; };
type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface ScreenProps {
    navigation: NavigationProp;
}

const MediatorSessionSummaryScreen: React.FC<ScreenProps> = ({ navigation }) => {
    return (
        <View style={styles.container}>
            {/* The learning screen itself will render the BottomNav and Play Again button */}
            <SessionSummaryScreen navigation={navigation} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default MediatorSessionSummaryScreen;
