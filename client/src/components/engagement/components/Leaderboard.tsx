import React, { useState, useEffect } from 'react';
import { View, Text, Button, Avatar } from 'react-native-ui-lib';
import { ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { EngagementRootState } from '../store/store';
import { setLeaderboard } from '../store/globalEngagement.slice';
import { Player } from '../store/primitives/globalEngagement';

const Leaderboard = () => {
  const [filter, setFilter] = useState('Today');
  const dispatch = useDispatch();
  const players = useSelector((state: EngagementRootState) => state.globalEngagement.engagement.leaderboard);

  const topPlayers = players.slice(0, 3);
  const rankedPlayers = players.slice(3);

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
    handleAddDummyData();
  }, []);

  return (
         <ScrollView showsVerticalScrollIndicator={false}>
      <View row spread marginH-18 marginT-18 marginB-10>
        {['Today', 'Weekly', 'All time'].map((tab) => (
          <Button
            key={tab}
            label={tab}
            flex
            outline={filter !== tab}
            outlineColor="#F0F0F0"
            backgroundColor={filter === tab ? '#FF7A3C' : '#fff'}
            color={filter === tab ? '#fff' : '#B0B0B0'}
            onPress={() => setFilter(tab)}
            marginH-4
            br20
          />
        ))}
      </View>

      {topPlayers.length > 0 && (
        <View row spread centerV marginT-18 marginB-18>
          <View flex center>
            <Avatar size={54} source={{ uri: topPlayers[0].avatar }} containerStyle={{borderWidth: 2, borderColor: '#F0F0F0'}} />
            <Text text70b marginT-6>{topPlayers[0].name}</Text>
            <View row centerV bg-grey70 br10 paddingH-10 paddingV-3 marginB-2>
              <Icon name="diamond" size={14} color="#B0B0B0" />
              <Text text80b color-grey30 marginL-4>{topPlayers[0].score}</Text>
            </View>
          </View>
          <View flex center>
            <Icon name="crown" size={24} color="#FFBE0B" style={{position: 'absolute', top: -28, zIndex: 2}} />
            <Avatar size={70} source={{ uri: topPlayers[1].avatar }} containerStyle={{borderWidth: 3, borderColor: '#FFBE0B'}}/>
            <Text text70b marginT-6>{topPlayers[1].name}</Text>
            <View row centerV bg-yellow30 br10 paddingH-10 paddingV-3 marginB-2>
              <Icon name="diamond" size={14} color="#fff" />
              <Text text80b color-white marginL-4>{topPlayers[1].score}</Text>
            </View>
          </View>
          <View flex center>
            <Avatar size={54} source={{ uri: topPlayers[2].avatar }} containerStyle={{borderWidth: 2, borderColor: '#F0F0F0'}} />
            <Text text70b marginT-6>{topPlayers[2].name}</Text>
            <View row centerV bg-grey70 br10 paddingH-10 paddingV-3 marginB-2>
              <Icon name="diamond" size={14} color="#B0B0B0" />
              <Text text80b color-grey30 marginL-4>{topPlayers[2].score}</Text>
            </View>
          </View>
        </View>
      )}

      <View marginH-18 marginT-10 marginB-18>
        {rankedPlayers.map((p, i) => (
          <View key={p.id} row centerV bg-white br20 paddingV-10 paddingH-12 marginB-10 style={{elevation: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3}}>
            <Text text70b color-grey30 style={{width: 22, textAlign: 'center'}}>{i + 4}</Text>
            <Avatar size={32} source={{ uri: p.avatar }} containerStyle={{marginH: 8}} />
            <Text flex text70 color_grey10>{p.name}</Text>
            <View row centerV bg-white br10 paddingH-8 paddingV-2>
              <Icon name="diamond" size={14} color="#FF69B4" />
              <Text text80b color-pink30 marginL-4>{p.score}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default Leaderboard;
