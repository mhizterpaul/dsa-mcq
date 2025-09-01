import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/rootReducer';
import { addAd, setActiveAd } from '../store/ad.slice';
import { Ad } from '../store/primitives/Ad';

const AdComponent = () => {
    const { ads, activeAdId } = useSelector((state: RootState) => state.mediator.ad);
    const activeAd = activeAdId ? ads[activeAdId] : null;
    const dispatch = useDispatch();

    const handleAddDummyData = () => {
        const dummyAd: Ad = {
            id: 'ad1',
            title: 'SPIN AND GET\nMORE REWARDS',
            buttonText: 'Spin Now',
            icon: 'cash-multiple',
        };
        dispatch(addAd(dummyAd));
        dispatch(setActiveAd(dummyAd.id));
    };

    useEffect(() => {
        handleAddDummyData();
    }, []);

    const handlePress = () => {
        console.log('Spin Now clicked');
    }

    if (!activeAd) {
        return (
            <View center>
                <Text>Loading ad...</Text>
                <Button label="Add Dummy Ad" onPress={handleAddDummyData} />
            </View>
        )
    }

  return (
    <View>
      <View row centerV bg-purple20 br20 marginH-18 marginT-18 padding-18 style={{elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6}}>
        <View flex>
          <Text white text60b marginB-10>{activeAd.title}</Text>
          <Button label={activeAd.buttonText} bg-purple50 br12 size={Button.sizes.small} onPress={handlePress} />
        </View>
        <Icon name={activeAd.icon} size={48} color="#FFBE0B" style={{ marginLeft: 10 }} />
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
