import React from 'react';
import { View, Text, Button, Image } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Welcome = () => {
    return (
        <View flex centerH paddingH-20 paddingT-20 bg-white>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1560185008-5a0d6c72c11d', // placeholder
            }}
            style={{width: '100%', height: 200}}
            cover={false}
            borderRadius={12}
            marginB-20
          />

          <View row centerV marginB-12>
            <Icon name="home-outline" size={36} color="#00B5D8" />
            <Text text70b marginL-6>NestHouse</Text>
          </View>

          <Text text60b center marginB-8>
            Find Your <Text color-cyan30>Dream</Text> Home with Ease
          </Text>
          <Text text80 color-grey30 center marginB-24>
            NestHouse helps you discover the perfect property tailored to your
            needs
          </Text>

          <View row marginB-20>
            <Button label="Login" flex marginH-4 />
            <Button label="Register" flex marginH-4 bg-cyan80 />
          </View>

          <View row centerV marginB-16 width="80%">
            <View flex height={1} bg-grey70 />
            <Text text90 marginH-8 color-grey50>Or sign in with</Text>
            <View flex height={1} bg-grey70 />
          </View>

          <View row spread width="50%">
            <Icon name="google" size={30} color="#DB4437" />
            <Icon name="facebook" size={30} color="#1877F2" />
            <Icon name="apple" size={30} color="#000" />
          </View>
        </View>
      );
}

export default Welcome;
