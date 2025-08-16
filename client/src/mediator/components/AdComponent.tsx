import React from 'react';
import { View, Text, Button } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../store/rootReducer';

const AdComponent = () => {
    const ad = useSelector((state: RootState) => state.mediator.ad);

    const handlePress = () => {
        console.log('Spin Now clicked');
    }

  return (
    <View>
      <View row centerV bg-purple20 br20 marginH-18 marginT-18 padding-18 style={{elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6}}>
        <View flex>
          <Text white text60b marginB-10>{ad.title}</Text>
          <Button label={ad.buttonText} bg-purple50 br12 size={Button.sizes.small} onPress={handlePress} />
        </View>
        <Icon name={ad.icon} size={48} color="#FFBE0B" style={{ marginLeft: 10 }} />
      </View>
      <View row center marginT-10>
        <View width={7} height={7} br100 bg-orange30 marginH-3 />
        <View width={7} height={7} br100 bg-grey50 marginH-3 />
        <View width={7} height={7} br100 bg-grey50 marginH-3 />
      </View>
    </View>
  );
};

export default AdComponent;
