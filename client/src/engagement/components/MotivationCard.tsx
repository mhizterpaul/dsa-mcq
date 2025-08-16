import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { EngagementRootState } from '../store/store';
import { setRandomMessage } from '../store/motivation.slice';

const NEON = '#EFFF3C';
const DARK = '#181A1B';

const MotivationCard = () => {
  const dispatch = useDispatch();
  const message = useSelector((state: EngagementRootState) => state.motivation.currentMessage);

  useEffect(() => {
    dispatch(setRandomMessage());
  }, []);

  const handleNewMessage = () => {
    dispatch(setRandomMessage());
  };

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
                {message}
            </Text>
        </View>
        <Button label="New Message" onPress={handleNewMessage} size={Button.sizes.small} bg-yellow50 br12 marginT-10 />
    </View>
  );
};

export default MotivationCard;
