import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

import { UserComponent } from '../components/user/interface';
import BackButton from '../components/common/components/BackButton';
import BottomNav from '../components/common/components/BottomNav';

type RootStackParamList = { Home: undefined; };
type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface ScreenProps {
    navigation: NavigationProp;
}

const UserProfileScreen: React.FC<ScreenProps> = ({ navigation }) => {
    const userComponent = new UserComponent();

    return (
        <View style={styles.container}>
            <BackButton navigation={navigation} />
            <View style={styles.content}>
                {userComponent.renderUserProfile('profile')}
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
    },
});

export default UserProfileScreen;
