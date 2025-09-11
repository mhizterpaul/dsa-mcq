import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { EngagementComponent } from '../components/engagement/interface';
import { UserComponent } from '../components/user/interface';
import BackButton from '../components/common/components/BackButton';
import BottomNav from '../components/common/components/BottomNav';
import BadgeDetails from '../components/engagement/components/BadgeDetails';

type RootStackParamList = {
    Home: undefined;
    Achievement: { badgeId?: string };
};
type NavigationProp = StackNavigationProp<RootStackParamList, 'Achievement'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'Achievement'>;

interface ScreenProps {
    navigation: NavigationProp;
    route: ScreenRouteProp;
}

const AchievementScreen: React.FC<ScreenProps> = ({ navigation, route }) => {
    const engagementComponent = new EngagementComponent();
    const userComponent = new UserComponent();
    const badgeId = route.params?.badgeId;

    // This is a placeholder. In a real app, you'd fetch this from the store.
    const getBadgeData = (id: string) => ({
        id: id,
        name: 'Fitness God',
        description: 'Achieve the highest rank in fitness quizzes.',
        achieved: true,
        unlockCriteria: 'Reach level 100 in Fitness.',
        imagePath: 'client/src/engagement/components/mockup/original-6b0784cb19d1d688a7a939d8d3dd637f.jpg',
    });

    const badgeImageMapping = {
        '1': require('../components/engagement/components/mockup/original-6b0784cb19d1d688a7a939d8d3dd637f.jpg'),
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <BackButton navigation={navigation} />
                <Text style={styles.headerTitle}>Achievements</Text>
                {userComponent.renderUserSettingsComponent()}
            </View>
            <View style={styles.content}>
                {badgeId ? (
                    <BadgeDetails
                        badge={getBadgeData(badgeId)}
                        imageSource={badgeImageMapping[badgeId]}
                    />
                ) : (
                    engagementComponent.renderAchievements('achievements', navigation)
                )}
            </View>
            <BottomNav navigation={navigation} />
        </View>
    );
};

// ... styles from before
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: 40, paddingBottom: 10 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    content: { flex: 1 },
});

export default AchievementScreen;
