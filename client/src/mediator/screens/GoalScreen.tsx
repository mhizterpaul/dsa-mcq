import React from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, Button, Card } from 'react-native-ui-lib';
import Feather from 'react-native-vector-icons/Feather';

const GoalScreen = () => {
  return (
    <View flex padding-page style={styles.container}>
      <View row centerV spread marginB-40>
        <View height={4} bg-green30 flex marginR-2 br10 />
        <View height={4} bg-green30 flex marginR-2 br10 />
        <View height={4} bg-green30 flex marginR-2 br10 />
        <View height={4} bg-dark70 flex br10 />
      </View>

      <Card marginB-40 style={styles.banner}>
        <View centerH>
            <View style={styles.bannerIconWrapper}>
                <Feather name="shield" size={24} color="black" />
            </View>
            <Text text60BO black marginT-20>Live healthier</Text>
            <View row centerV marginT-20 height={50} style={styles.graph}>
            {Array.from({ length: 15 }).map((_, i) => (
                <View
                key={i}
                style={[
                    styles.graphBar,
                    { height: Math.random() * 40 + 10 },
                ]}
                />
            ))}
            </View>
        </View>
      </Card>

      <Button
        marginB-15
        style={styles.option}
        backgroundColor="#222"
      >
        <View row centerV>
            <Feather name="coffee" size={20} color="white" />
            <Text white marginL-15>Drink 8 cups of water</Text>
        </View>
      </Button>

      <Button
        marginB-15
        style={styles.option}
        backgroundColor="#222"
      >
        <View row centerV>
            <Feather name="activity" size={20} color="white" />
            <Text white marginL-15>Time for Your Workout</Text>
        </View>
      </Button>

      <Button
        marginB-15
        style={styles.option}
        backgroundColor="#222"
      >
        <View row centerV>
            <Feather name="moon" size={20} color="white" />
            <Text white marginL-15>Walk for Wellness</Text>
        </View>
      </Button>

      <Button
        label="Continue"
        labelStyle={{color: 'black', fontWeight: 'bold'}}
        iconSource={() => <Feather name="arrow-right" size={20} color="black" />}
        iconOnRight
        backgroundColor="#ADFF2F"
        style={styles.continueButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
  },
  banner: {
    backgroundColor: '#ADFF2F',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  bannerIconWrapper: {
    backgroundColor: '#ADFF2F',
    borderRadius: 25,
    padding: 10,
    position: 'absolute',
    top: -45,
    borderWidth: 2,
    borderColor: '#121212',
  },
  graph: {
    alignItems: 'flex-end',
  },
  graphBar: {
    width: 4,
    backgroundColor: 'black',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  option: {
    borderRadius: 15,
    padding: 15,
    width: '100%',
  },
  continueButton: {
    borderRadius: 15,
    padding: 15,
    width: '100%',
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
});

export default GoalScreen;
