import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { View, Text, Button, Image, Avatar } from 'react-native-ui-lib';
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import UserProfileSummary from "../../user/components/UserProfileSummary";

const { width } = Dimensions.get("window");

export default function UserProfileContent({ AdComponent }: { AdComponent?: React.ComponentType }) {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, []);

  const user = {
    name: "Sammy Skott",
    level: "02",
    achievements: 32,
    weeklyGifts: 32,
    avatarUri: "https://via.placeholder.com/150",
  };

  return (
    <View flex bg-grey80>
      {/* Header */}
      <View row spread centerV paddingH-20 paddingV-10 marginB-20 marginT-40>
        <Button
          link
          iconSource={() => <Ionicons name="chevron-back" size={24} color="#111" />}
          onPress={() => navigation.goBack()}
          testID="back-button"
        />
        <Text text70b color_grey10 testID="screen-title">User profile</Text>
        <UserProfileSummary showGreeting={false} />
      </View>

      <View centerH marginB-20>
        <View style={styles.avatarContainer}>
          <Avatar size={100} source={{ uri: user.avatarUri }} />
          <View style={styles.levelBadge}>
             <Text white text100b>+12 gxp</Text>
          </View>
        </View>
      </View>

      {/* User Name Block */}
      <View paddingH-20 marginB-16>
        <View row spread centerV bg-white br20 paddingH-20 paddingV-15 style={styles.cardShadow} testID="user-name-block">
          <Text text60b color_grey10>{user.name}</Text>
          <TouchableOpacity style={styles.editButton} testID="edit-icon">
            <Ionicons name="pencil" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Block */}
      <View paddingH-20 marginB-20>
        <View bg-white br20 padding-20 style={styles.cardShadow} testID="user-stats-block">
          <View row spread centerV marginB-15>
            <View row centerV>
               <Ionicons name="flash" size={20} color="#FF7A3C" />
               <Text text80 color_grey10 marginL-10>Level</Text>
            </View>
            <Text text80b color_grey10>{user.level}</Text>
          </View>
          <View height={1} bg-grey70 marginB-15 />
          <View row spread centerV marginB-15>
            <View row centerV>
               <Ionicons name="trophy" size={20} color="#FFD700" />
               <Text text80 color_grey10 marginL-10>Achievements</Text>
            </View>
            <Text text80b color_grey10>{user.achievements}</Text>
          </View>
          <View height={1} bg-grey70 marginB-15 />
          <View row spread centerV>
            <View row centerV>
               <Ionicons name="gift" size={20} color="#4CAF50" />
               <Text text80 color_grey10 marginL-10>Weekly gifts</Text>
            </View>
            <Text text80b color_grey10>{user.weeklyGifts}</Text>
          </View>
        </View>
      </View>

      {AdComponent && (
        <View centerH paddingH-20>
          <AdComponent />
        </View>
      )}

      {!AdComponent && (
          <View centerH paddingH-20 marginT-20>
              <View style={styles.placeholderAd}>
                  <Text grey40>Advertisement Space</Text>
              </View>
          </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButton: {
    backgroundColor: "#4CAF50",
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
      position: 'relative',
  },
  levelBadge: {
      position: 'absolute',
      top: 0,
      right: -20,
      backgroundColor: '#4CAF50',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
  },
  placeholderAd: {
      width: '100%',
      height: 150,
      backgroundColor: '#f0f0f0',
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: '#ccc',
  }
});
