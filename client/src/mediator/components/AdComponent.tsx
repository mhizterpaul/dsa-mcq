import React from 'react';
import { View, Text, Button } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PromoBanner = () => {
  return (
    <View>
      <View row centerV bg-purple20 br20 marginH-18 marginT-18 padding-18 style={{elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6}}>
        <View flex>
          <Text white text60b marginB-10>SPIN AND GET{`\n`}MORE REWARDS</Text>
          <Button label="Spin Now" bg-purple50 br12 size={Button.sizes.small} />
        </View>
        <Icon name="cash-multiple" size={48} color="#FFBE0B" style={{ marginLeft: 10 }} />
      </View>
      <View row center marginT-10>
        <View width={7} height={7} br100 bg-orange30 marginH-3 />
        <View width={7} height={7} br100 bg-grey50 marginH-3 />
        <View width={7} height={7} br100 bg-grey50 marginH-3 />
      </View>
    </View>
  );
};

export default PromoBanner;
