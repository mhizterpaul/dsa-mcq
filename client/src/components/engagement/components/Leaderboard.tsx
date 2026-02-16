import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { setLeaderboard } from '../store/globalEngagement.slice';
import { Player } from '../store/primitives/globalEngagement';

interface LeaderboardProps {
  players?: Player[];
  hideFilter?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ players: propPlayers, hideFilter }) => {
  const [filter, setFilter] = useState('Today');
  const dispatch = useDispatch();
  const storePlayers = useSelector((state: any) =>
    state.engagement?.globalEngagement?.engagement?.leaderboard ||
    state.globalEngagement?.engagement?.leaderboard ||
    []
  );

  const activePlayers = propPlayers || storePlayers;

  const topPlayers = useMemo(() => {
    const top = activePlayers.slice(0, 3);
    if (top.length === 3) {
      // Rearrange to [2nd, 1st, 3rd] for the UI
      return [top[1], top[0], top[2]];
    }
    if (top.length === 2) {
      // Rearrange to [2nd, 1st]
      return [top[1], top[0]];
    }
    return top;
  }, [activePlayers]);

  const rankedPlayers = activePlayers.slice(3);

  const handleAddDummyData = () => {
    const dummyPlayers: Player[] = [
      { id: '1', name: 'David', score: 1200, avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { id: '2', name: 'Ivan', score: 1500, avatar: 'https://randomuser.me/api/portraits/men/33.jpg' },
      { id: '3', name: 'Austin', score: 1100, avatar: 'https://randomuser.me/api/portraits/men/34.jpg' },
      { id: '4', name: 'Thomas L. Scott', score: 1180, avatar: '' },
      { id: '5', name: 'Keith L. Graves', score: 1199, avatar: '' },
      { id: '6', name: 'Michael C. Scott', score: 1100, avatar: '' },
      { id: '7', name: 'Robert F. Alvarez', score: 1099, avatar: '' },
    ];
    dispatch(setLeaderboard(dummyPlayers));
  };

  useEffect(() => {
    if (!propPlayers) {
        handleAddDummyData();
    }
  }, [propPlayers]);

  const getPlayerRank = (index: number, totalTop: number) => {
    // If totalTop is 3, 1st place is at index 1
    // If totalTop is 2, 1st place is at index 1
    // If totalTop is 1, 1st place is at index 0
    const isFirstPlace = (totalTop > 1 && index === 1) || (totalTop === 1 && index === 0);
    if (isFirstPlace) return { ...styles.topPlayerAvatar, borderColor: '#FFBE0B', borderWidth: 3 };
    return { ...styles.topPlayerAvatar, borderColor: '#F0F0F0' };
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} testID="leaderboard-scroll">
      {!hideFilter && (
      <View style={styles.filterContainer}>
        {['Today', 'Weekly', 'All time'].map((tab) => (
          <Button
            key={tab}
            mode={filter === tab ? 'contained' : 'outlined'}
            onPress={() => setFilter(tab)}
            style={styles.filterButton}
            labelStyle={styles.filterButtonLabel}
            theme={{ colors: { primary: '#FF7A3C', outline: '#F0F0F0' } }}
          >
            {tab}
          </Button>
        ))}
      </View>
      )}

      {topPlayers.length > 0 && (
        <View style={styles.topPlayersContainer}>
          {topPlayers.map((player, index) => {
            const isFirstPlace = (topPlayers.length > 1 && index === 1) || (topPlayers.length === 1 && index === 0);
            return (
              <View key={player.id} style={styles.topPlayer}>
                {isFirstPlace && <Icon name="crown" size={24} color="#FFBE0B" style={styles.crownIcon} />}
                <Avatar.Image
                    size={isFirstPlace ? 70 : 54}
                    source={{ uri: player.avatar || 'https://i.pravatar.cc/150' }}
                    style={getPlayerRank(index, topPlayers.length)}
                />
                <Text style={styles.playerName}>{player.name}</Text>
                <View style={[styles.scoreContainer, isFirstPlace ? styles.firstPlaceScore : styles.otherTopScore]}>
                  <Icon name="diamond" size={14} color={isFirstPlace ? '#fff' : '#B0B0B0'} />
                  <Text style={[styles.scoreText, isFirstPlace ? styles.firstPlaceScoreText : styles.otherTopScoreText]}>{player.score}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.rankedPlayersContainer}>
        {rankedPlayers.map((p, i) => (
          <View key={p.id} style={styles.rankedPlayer}>
            <Text style={styles.rankNumber}>{i + 4}</Text>
            <Avatar.Image size={32} source={{ uri: p.avatar }} style={styles.rankedPlayerAvatar} />
            <Text style={styles.rankedPlayerName}>{p.name}</Text>
            <View style={styles.rankedPlayerScoreContainer}>
              <Icon name="diamond" size={14} color="#FF69B4" />
              <Text style={styles.rankedPlayerScore}>{p.score}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 18,
        marginVertical: 10,
    },
    filterButton: {
        flex: 1,
        marginHorizontal: 4,
        borderRadius: 20,
    },
    filterButtonLabel: {
        color: '#fff',
    },
    topPlayersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginVertical: 18,
    },
    topPlayer: {
        alignItems: 'center',
    },
    topPlayerAvatar: {
        borderWidth: 2,
    },
    crownIcon: {
        position: 'absolute',
        top: -28,
        zIndex: 2,
    },
    playerName: {
        marginTop: 6,
        fontWeight: 'bold',
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 3,
        marginBottom: 2,
    },
    firstPlaceScore: {
        backgroundColor: '#FFBE0B', // bg-yellow30
    },
    otherTopScore: {
        backgroundColor: '#E0E0E0', // bg-grey70
    },
    scoreText: {
        marginLeft: 4,
        fontWeight: 'bold',
    },
    firstPlaceScoreText: {
        color: '#fff',
    },
    otherTopScoreText: {
        color: '#616161', // color-grey30
    },
    rankedPlayersContainer: {
        marginHorizontal: 18,
        marginVertical: 10,
    },
    rankedPlayer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 3,
    },
    rankNumber: {
        width: 22,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#616161', // color-grey30
    },
    rankedPlayerAvatar: {
        marginHorizontal: 8,
    },
    rankedPlayerName: {
        flex: 1,
        color: '#212121', // color_grey10
    },
    rankedPlayerScoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    rankedPlayerScore: {
        marginLeft: 4,
        fontWeight: 'bold',
        color: '#FF69B4', // color-pink30
    },
});

export default Leaderboard;