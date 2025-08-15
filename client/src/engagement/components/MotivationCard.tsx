import React from 'react';
import { View, Text } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NEON = '#EFFF3C';
const DARK = '#181A1B';

const MotivationCard = () => {
  return (
    <View row centerV bg-yellow30 br20 padding-18 marginB-18 style={{width: '90%', elevation: 2, shadowColor: NEON, shadowOpacity: 0.12, shadowRadius: 8}}>
      <Icon
        name="star-circle"
        size={28}
        color={DARK}
        style={{marginRight: 12}}
      />
      <Text text70b color_grey10 flex>
        Keep going! Every quiz makes you better!
      </Text>
    </View>
  );
};

export default MotivationCard;
