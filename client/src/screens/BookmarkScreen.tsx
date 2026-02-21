import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

import { UserComponent } from '../components/user/interface';
import BackButton from '../components/common/components/BackButton';
import BottomNav from '../components/common/components/BottomNav';

type RootStackParamList = { Home: undefined; };
type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface ScreenProps {
    navigation: NavigationProp;
}

const BookmarkScreen: React.FC<ScreenProps> = ({ navigation }) => {
    const userComponent = new UserComponent();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <BackButton navigation={navigation} />
                <Text style={styles.title} testID="screen-title">Bookmarks</Text>
                <View style={{ width: 40 }} />
            </View>
            <View style={styles.content}>
                {userComponent.renderBookmarkList('bookmark')}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 40,
        paddingBottom: 10,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default BookmarkScreen;
