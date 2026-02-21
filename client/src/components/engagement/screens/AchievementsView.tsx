import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

export interface AchievementsData {
  badges: {
    totalUnlocked: number;
    list: { id: number; title: string; date: string; icon: string }[];
    nextBadge: {
      title: string;
      description: string;
      progress: number;
    }[];
  };
  leaderboard: {
    score: number;
    rank: number;
    competitors: { id: number; name: string; score: number; level: number; badgeIcon?: string; badgeText?: string }[];
  };
  stats: {
    highScore: number;
    longestStreak: string | number;
    longestExercise: string | number;
    longestReps: string | number;
    longestSets: string | number;
  };
}

interface AchievementsViewProps {
    data: AchievementsData;
}

const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const AchievementsView: React.FC<AchievementsViewProps> = ({ data }) => {
    const navigation = useNavigation<any>();
    const [activeTab, setActiveTab] = useState<'Badges' | 'Leaderboard' | 'Stats'>('Badges');

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                testID="gear-button"
                onPress={() => navigation.navigate('Settings')}
                style={styles.iconButton}
            >
                <Icon name="cog" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Achievements</Text>
            <TouchableOpacity
                testID="back-button"
                onPress={() => navigation.goBack()}
                style={styles.iconButton}
            >
                <Icon name="chevron-left" size={24} color="#333" />
            </TouchableOpacity>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            {(['Badges', 'Leaderboard', 'Stats'] as const).map((tab) => (
                <TouchableOpacity
                    key={tab}
                    testID={`tab-${tab.toLowerCase()}`}
                    onPress={() => setActiveTab(tab)}
                    style={[styles.tab, activeTab === tab && styles.activeTab]}
                    accessibilityState={{ selected: activeTab === tab }}
                >
                    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderBadgesTab = () => (
        <View style={styles.tabContent} testID="badges-tab-content">
            <View style={styles.badgesSummary}>
                <Text style={styles.badgesCountText}>{data.badges.totalUnlocked}</Text>
                <Text style={styles.badgesSubText}>Badges Unlocked</Text>
            </View>

            <View style={styles.badgesGrid}>
                {data.badges.list.map((badge) => (
                    <View key={badge.id} style={styles.badgeItem}>
                        <View style={styles.badgeIconContainer}>
                            {badge.icon === 'text' ? (
                                <Text style={styles.badgeTextIcon}>{badge.title.split(' ')[0]}</Text>
                            ) : (
                                <Icon name={badge.icon} size={30} color="#333" />
                            )}
                        </View>
                        <Text style={styles.badgeDate}>{badge.date}</Text>
                        <Text style={styles.badgeName}>{badge.title}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.nextBadgeSection}>
                <View style={styles.nextBadgeHeader}>
                    <Text style={styles.sectionTitle}>Your Next Badge</Text>
                    <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
                </View>

                {data.badges.nextBadge.map((badge, index) => (
                    <View key={index} style={styles.nextBadgeItem}>
                        <View style={styles.nextBadgeIcon}>
                            <Icon name="help-circle-outline" size={24} color="#999" />
                        </View>
                        <View style={styles.nextBadgeInfo}>
                            <Text style={styles.nextBadgeTitle}>{badge.title}</Text>
                            <Text style={styles.nextBadgeDescription}>{badge.description}</Text>
                        </View>
                        <View style={styles.progressCircle}>
                             <Text style={styles.progressText}>{badge.progress}%</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderLeaderboardTab = () => (
        <View style={styles.tabContent} testID="leaderboard-tab-content">
            <View style={styles.userRankCard}>
                <View style={styles.userRankHeader}>
                    <View style={[styles.rankIconCircle, { backgroundColor: '#FFD700' }]}>
                         <Icon name="cog" size={16} color="#fff" />
                    </View>
                    <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.profileImage} />
                    <View style={[styles.rankIconCircle, { backgroundColor: '#FF8C00' }]}>
                         <Icon name="chart-bar" size={16} color="#fff" />
                    </View>
                </View>
                <Text style={styles.userPoints}>{data.leaderboard.score.toLocaleString()}</Text>
                <Text style={styles.userRankLabel}>The Infiltrator • 🏆 {getOrdinal(data.leaderboard.rank)} Place</Text>
                <TouchableOpacity style={styles.viewStatsButton}>
                    <Icon name="chart-line" size={16} color="#FF8C00" style={{ marginRight: 5 }} />
                    <Text style={styles.viewStatsText}>View Stats</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.leaderboardSection}>
                <View style={styles.nextBadgeHeader}>
                    <Text style={styles.sectionTitle}>All Leaderboards</Text>
                    <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
                </View>

                {data.leaderboard.competitors.map((competitor) => (
                    <View key={competitor.id} style={styles.leaderboardItem}>
                        <Text style={styles.rankNumber}>{competitor.id}</Text>
                        <Image source={{ uri: 'https://via.placeholder.com/40' }} style={styles.avatarSmall} />
                        <View style={styles.leaderboardUserInfo}>
                            <Text style={styles.userName}>{competitor.name}</Text>
                            <Text style={styles.userMeta}>{competitor.score.toLocaleString()}pts • Lvl {competitor.level}</Text>
                        </View>
                        <View style={styles.rankBadge}>
                            {competitor.badgeIcon ? (
                                <Icon name={competitor.badgeIcon} size={16} color="#fff" />
                            ) : (
                                <Text style={styles.rankBadgeText}>{competitor.badgeText}</Text>
                            )}
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderStatsTab = () => (
        <View style={styles.tabContent} testID="stats-tab-content">
            <View style={styles.statsCard}>
                <Text style={styles.statsHeader}>High Score</Text>
                <View style={styles.statsRow}>
                    <Text style={styles.statsLabel}>Longest Streak</Text>
                    <Text style={styles.statsValue}>{data.stats.longestStreak}</Text>
                </View>
                <View style={styles.statsRow}>
                    <Text style={styles.statsLabel}>Longest Exercise</Text>
                    <Text style={styles.statsValue}>{data.stats.longestExercise}</Text>
                </View>
                <View style={styles.statsRow}>
                    <Text style={styles.statsLabel}>Longest Reps</Text>
                    <Text style={styles.statsValue}>{data.stats.longestReps}</Text>
                </View>
                <View style={styles.statsRow}>
                    <Text style={styles.statsLabel}>Longest Sets</Text>
                    <Text style={styles.statsValue}>{data.stats.longestSets}</Text>
                </View>
                <View style={[styles.statsRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.statsLabel}>High Score</Text>
                    <Text style={styles.statsValue}>{data.stats.highScore}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            {renderHeader()}
            {renderTabs()}
            {activeTab === 'Badges' && renderBadgesTab()}
            {activeTab === 'Leaderboard' && renderLeaderboardTab()}
            {activeTab === 'Stats' && renderStatsTab()}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F1F3F5',
        borderRadius: 25,
        marginHorizontal: 20,
        padding: 5,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20,
    },
    activeTab: { backgroundColor: '#fff' },
    tabText: { color: '#999', fontWeight: '600' },
    activeTabText: { color: '#333' },
    tabContent: { paddingHorizontal: 20 },
    badgesSummary: { alignItems: 'center', marginVertical: 20 },
    badgesCountText: { fontSize: 48, fontWeight: 'bold', color: '#333' },
    badgesSubText: { fontSize: 16, color: '#999' },
    badgesGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    badgeItem: { alignItems: 'center', width: '30%' },
    badgeIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    badgeTextIcon: { fontSize: 16, fontWeight: 'bold' },
    badgeDate: { fontSize: 10, color: '#999' },
    badgeName: { fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
    nextBadgeSection: { marginTop: 10 },
    nextBadgeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold' },
    seeAllText: { color: '#FF8C00', fontWeight: 'bold' },
    nextBadgeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
    },
    nextBadgeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    nextBadgeInfo: { flex: 1 },
    nextBadgeTitle: { fontSize: 16, fontWeight: 'bold' },
    nextBadgeDescription: { fontSize: 12, color: '#999' },
    progressCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#FF8C00',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressText: { fontSize: 10, fontWeight: 'bold' },
    userRankCard: { alignItems: 'center', marginVertical: 20 },
    userRankHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    rankIconCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    profileImage: { width: 80, height: 80, borderRadius: 40, marginHorizontal: 20 },
    userPoints: { fontSize: 32, fontWeight: 'bold' },
    userRankLabel: { fontSize: 14, color: '#999', marginVertical: 5 },
    viewStatsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF4E5',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 10,
    },
    viewStatsText: { color: '#FF8C00', fontWeight: 'bold' },
    leaderboardSection: { marginTop: 20 },
    leaderboardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
    },
    rankNumber: { fontSize: 16, fontWeight: 'bold', width: 25 },
    avatarSmall: { width: 40, height: 40, borderRadius: 20, marginRight: 15 },
    leaderboardUserInfo: { flex: 1 },
    userName: { fontSize: 16, fontWeight: 'bold' },
    userMeta: { fontSize: 12, color: '#999' },
    rankBadge: {
        width: 30,
        height: 30,
        borderRadius: 5,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    statsCard: { backgroundColor: '#fff', borderRadius: 15, padding: 20, marginTop: 10 },
    statsHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F5',
    },
    statsLabel: { fontSize: 14, color: '#666' },
    statsValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
});

export default AchievementsView;
