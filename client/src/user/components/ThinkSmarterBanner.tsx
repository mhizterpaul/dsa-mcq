import React from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, Card } from 'react-native-ui-lib';
import Feather from 'react-native-vector-icons/Feather';

const LiveHealthierBanner = () => {
  return (
    <Card marginB-40 style={styles.banner}>
      <View centerH>
          <View style={styles.bannerIconWrapper}>
              <Feather name="shield" size={24} color="black" />
          </View>
          <Text text60BO black marginT-20>Think Smarter</Text>
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
  );
};

const styles = StyleSheet.create({
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
});

export default LiveHealthierBanner;
