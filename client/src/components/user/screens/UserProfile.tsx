import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Dimensions,
  Pressable,
} from "react-native";
import { View, Text, Button, Image, Avatar } from 'react-native-ui-lib';
import Ionicons from "react-native-vector-icons/Ionicons";
import UserProfileSummary from "../../user/components/UserProfileSummary";

const { width } = Dimensions.get("window");

export default function UserProfileScreen({AdComponent}: {AdComponent: React.ComponentType}) {
  const [menuVisible, setMenuVisible] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const user = {
    name: "John Doe",
    level: 15,
    achievement: "Master Explorer",
    weeklyGift: "Free 100 Coins",
    avatarUri: "https://via.placeholder.com/150",
  };

  return (
    <View flex bg-grey80 paddingV-20>
      {menuVisible && <Pressable style={{position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.35)", zIndex: 1}} onPress={() => setMenuVisible(false)} />}
      <View row spread centerV paddingH-20 marginB-20>
        <Button link iconSource={() => <Ionicons name="chevron-back" size={22} color="#111" />} onPress={() => { /* Implement back logic */ }} />
        <Text text70b color_grey10>User profile</Text>
        <UserProfileSummary
          visible={menuVisible}
          onOpen={() => setMenuVisible(true)}
          onClose={() => setMenuVisible(false)}
          onSelectMenuItem={(k) => {
            setMenuVisible(false);
          }}
        />
      </View>

      <View absL T_70 paddingH-20 row>
        <Text style={{fontSize: 34, fontWeight: "800", color: "rgba(0,0,0,0.06)"}}>02</Text>
        <Text style={{fontSize: 34, fontWeight: "800", color: "rgba(0,0,0,0.06)", marginLeft: 12}}>23</Text>
      </View>

      <View centerH>
          <Avatar size={96} source={{ uri: user.avatarUri }} containerStyle={{borderWidth: 4, borderColor: "white"}} />
      </View>

      <Animated.View style={[{opacity: fadeAnim}]}>
        <View row centerV bg-white br12 paddingH-12 paddingV-8 marginT-12 style={{elevation: 3, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 8}}>
            <View width={6} height={6} br100 bg-green30 marginR-8 />
            <Text text90 color-green10>Booster activated — will be waiting</Text>
            <View bg-green30 br12 paddingH-8 paddingV-4 marginL-8>
                <Text white text90b>XP +59</Text>
            </View>
        </View>
      </Animated.View>

      <Animated.View style={[{opacity: fadeAnim}]}>
        <View centerH marginT-20>
            <Text text40b color_grey10>{user.name}</Text>
            <Text text60 color-blue30 marginT-4>Level {user.level}</Text>
            <Text text80 color-grey30 marginT-2>{user.achievement}</Text>
            <View bg-blue80 br20 paddingH-12 paddingV-6 marginT-16>
                <Text color-blue10 text80b>{user.weeklyGift}</Text>
            </View>
        </View>
      </Animated.View>

      <Animated.View style={[{opacity: fadeAnim}]}>
        <AdComponent />
      </Animated.View>

      <Animated.View style={[{opacity: fadeAnim}]}>
        <View paddingV-12>
            <Text text90 color-grey50>© 2025 Your Company. All rights reserved.</Text>
        </View>
      </Animated.View>
    </View>
  );
}