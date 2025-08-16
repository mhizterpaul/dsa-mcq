import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { EngagementRootState } from '../store/store';
import { setMotivation, setUserEngagementDb } from '../store/userEngagement.slice';

const NEON = '#EFFF3C';
const DARK = '#181A1B';

const motivationalMessages = [
    'Keep going! Every quiz makes you better!',
    "Don't give up! You're making great progress!",
    'Believe in yourself! You can do it!',
    'The more you learn, the more you earn!',
];

const MotivationCard = ({ userId }: { userId: string }) => {
  const dispatch = useDispatch();
  const motivation = useSelector((state: EngagementRootState) => state.userEngagement.engagements[userId]?.motivation);

  const handleNewMessage = () => {
    const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
    const newMessage = motivationalMessages[randomIndex];
    dispatch(setMotivation({ userId, motivation: newMessage }));
  };

  useEffect(() => {
    dispatch(setUserEngagementDb(userId));
    handleNewMessage();
  }, []);

  return (
    <View bg-yellow30 br20 padding-18 marginB-18 style={{width: '90%', elevation: 2, shadowColor: NEON, shadowOpacity: 0.12, shadowRadius: 8}}>
        <View row centerV>
            <Icon
                name="star-circle"
                size={28}
                color={DARK}
                style={{marginRight: 12}}
            />
            <Text text70b color_grey10 flex>
                {motivation}
            </Text>
        </View>
        <Button label="New Message" onPress={handleNewMessage} size={Button.sizes.small} bg-yellow50 br12 marginT-10 />
    </View>
  );
};

export default MotivationCard;
