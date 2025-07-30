import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const avatars = [
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/men/33.jpg',
  'https://randomuser.me/api/portraits/men/34.jpg',
];

const topPlayers = [
  { name: 'David', score: 1200, avatar: avatars[0] },
  { name: 'Ivan', score: 1500, avatar: avatars[1] },
  { name: 'Austin', score: 1100, avatar: avatars[2] },
];

const rankedPlayers = [
  { name: 'Thomas L. Scott', score: 1180 },
  { name: 'Keith L. Graves', score: 1199 },
  { name: 'Michael C. Scott', score: 1100 },
  { name: 'Robert F. Alvarez', score: 1099 },
];

const LeaderboardScreen = ({ navigation }: any) => {
  const [filter, setFilter] = useState('Today');

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Leaderboard</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['Today', 'Weekly', 'All time'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, filter === tab && styles.activeTab]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.filterText, filter === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top 3 Players */}
        <View style={styles.top3Row}>
          {/* 2nd */}
          <View style={styles.topPlayerCol}>
            <Image source={{ uri: topPlayers[0].avatar }} style={styles.topAvatarSmall} />
            <Text style={styles.topPlayerName}>{topPlayers[0].name}</Text>
            <View style={styles.topScoreBox}>
              <Icon name="diamond" size={14} color="#B0B0B0" />
              <Text style={styles.topScoreText}>{topPlayers[0].score}</Text>
            </View>
          </View>
          {/* 1st */}
          <View style={styles.topPlayerCol}>
            <View style={styles.crownWrap}>
              <Icon name="crown" size={24} color="#FFBE0B" style={styles.crownIcon} />
            </View>
            <Image source={{ uri: topPlayers[1].avatar }} style={styles.topAvatarMain} />
            <Text style={styles.topPlayerName}>{topPlayers[1].name}</Text>
            <View style={[styles.topScoreBox, { backgroundColor: '#FFBE0B' }] }>
              <Icon name="diamond" size={14} color="#fff" />
              <Text style={[styles.topScoreText, { color: '#fff' }]}>{topPlayers[1].score}</Text>
            </View>
          </View>
          {/* 3rd */}
          <View style={styles.topPlayerCol}>
            <Image source={{ uri: topPlayers[2].avatar }} style={styles.topAvatarSmall} />
            <Text style={styles.topPlayerName}>{topPlayers[2].name}</Text>
            <View style={styles.topScoreBox}>
              <Icon name="diamond" size={14} color="#B0B0B0" />
              <Text style={styles.topScoreText}>{topPlayers[2].score}</Text>
            </View>
          </View>
        </View>

        {/* Ranked List */}
        <View style={styles.rankedList}>
          {rankedPlayers.map((p, i) => (
            <View style={styles.rankedRow} key={p.name}>
              <Text style={styles.rankNum}>{i + 4}</Text>
              <View style={styles.rankedAvatarWrap}>
                <Icon name="account-circle" size={32} color="#B0B0B0" />
              </View>
              <Text style={styles.rankedName}>{p.name}</Text>
              <View style={styles.rankedScoreBox}>
                <Icon name="diamond" size={14} color="#FF69B4" />
                <Text style={styles.rankedScore}>{p.score}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={24} color="#B0B0B0" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="bookmark" size={24} color="#B0B0B0" />
          <Text style={styles.navText}>Bookmark</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="trophy" size={24} color="#FF7A3C" />
          <Text style={[styles.navText, { color: '#FF7A3C' }]}>Board</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="account-circle" size={24} color="#B0B0B0" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8FF' },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pageTitle: { fontWeight: 'bold', fontSize: 18, color: '#222' },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    marginTop: 18,
    marginBottom: 10,
  },
  filterTab: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  activeTab: {
    backgroundColor: '#FF7A3C',
    borderColor: '#FF7A3C',
  },
  filterText: {
    color: '#B0B0B0',
    fontWeight: 'bold',
    fontSize: 13,
  },
  activeTabText: {
    color: '#fff',
  },
  top3Row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginTop: 18,
    marginBottom: 18,
  },
  topPlayerCol: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  crownWrap: {
    position: 'absolute',
    top: -28,
    left: '50%',
    marginLeft: -12,
    zIndex: 2,
  },
  crownIcon: {
    shadowColor: '#FFBE0B',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 2,
  },
  topAvatarMain: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#FFBE0B',
    marginBottom: 6,
    backgroundColor: '#eee',
  },
  topAvatarSmall: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    marginBottom: 6,
    backgroundColor: '#eee',
  },
  topPlayerName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#222',
    marginBottom: 4,
  },
  topScoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 2,
  },
  topScoreText: {
    color: '#B0B0B0',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 4,
  },
  rankedList: {
    marginHorizontal: 18,
    marginTop: 10,
    marginBottom: 18,
  },
  rankedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  rankNum: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#B0B0B0',
    width: 22,
    textAlign: 'center',
  },
  rankedAvatarWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  rankedName: {
    flex: 1,
    fontWeight: '600',
    fontSize: 14,
    color: '#222',
  },
  rankedScoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  rankedScore: {
    color: '#FF69B4',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 18,
    marginBottom: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 11,
    color: '#B0B0B0',
    fontWeight: '600',
    marginTop: 2,
  },
});

export default LeaderboardScreen; 