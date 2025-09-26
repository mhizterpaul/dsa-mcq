import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store/rootReducer';
import { addAd, setActiveAd } from '../../../store/ad.slice';
import { Ad } from '../../../store/primitives/Ad';

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
            <View style={styles.loadingContainer}>
                <Text>Loading ad...</Text>
                <Button onPress={handleAddDummyData}>Add Dummy Ad</Button>
            </View>
        )
    }

  return (
    <View>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{activeAd.title}</Text>
            <Button mode="contained" onPress={handlePress} style={styles.button} labelStyle={styles.buttonLabel}>
              {activeAd.buttonText}
            </Button>
          </View>
          <Icon name={activeAd.icon} size={48} color="#FFBE0B" style={styles.icon} />
        </Card.Content>
      </Card>
      <View style={styles.dotContainer}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#9B59B6', // bg-purple20
    borderRadius: 20, // br20
    marginHorizontal: 18, // marginH-18
    marginTop: 18, // marginT-18
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18, // padding-18
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#fff', // white
    fontSize: 24, // text60b
    fontWeight: 'bold', // text60b
    marginBottom: 10, // marginB-10
  },
  button: {
    backgroundColor: '#8E44AD', // bg-purple50
    borderRadius: 12, // br12
    alignSelf: 'flex-start',
  },
  buttonLabel: {
    fontSize: 14, // corresponds to Button.sizes.small
  },
  icon: {
    marginLeft: 10,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 5, // br100
    backgroundColor: '#E0E0E0', // bg-grey50
    marginHorizontal: 3, // marginH-3
  },
  activeDot: {
    backgroundColor: '#FFA500', // bg-orange30
  },
});

export default AdComponent;