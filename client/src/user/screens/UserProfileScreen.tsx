import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  SafeAreaView,
  Pressable,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import UserProfileSummary from "../components/UserProfileSummary";

const { width } = Dimensions.get("window");

export default function UserProfileScreen() {
  const [menuVisible, setMenuVisible] = useState(false);
  // Animated values for progress ring & fade-in
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animate progress ring and fade in on mount
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

  // We use a simple non-SVG ring to avoid extra deps. You can swap for SVG later.

  // Dummy user data
  const user = {
    name: "John Doe",
    level: 15,
    achievement: "Master Explorer",
    weeklyGift: "Free 100 Coins",
    avatarUri: "https://via.placeholder.com/150",
  };

  return (
    <SafeAreaView style={styles.container}>
      {menuVisible && <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)} />}
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => { /* Implement back logic */ }}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User profile</Text>
        <UserProfileSummary
          visible={menuVisible}
          onOpen={() => setMenuVisible(true)}
          onClose={() => setMenuVisible(false)}
          onSelectMenuItem={(k) => {
            // hook into navigation/actions here
            setMenuVisible(false);
          }}
        />
      </View>

      {/* Subtle background numbers */}
      <View style={styles.subtleNumbersContainer} pointerEvents="none">
        <Text style={styles.subtleNumber}>02</Text>
        <Text style={[styles.subtleNumber, { marginLeft: 12 }]}>23</Text>
      </View>

      {/* Profile Avatar with Progress Ring */}
      <View style={styles.avatarContainer}>
        <View style={styles.progressRing} />
        <Image source={{ uri: user.avatarUri }} style={styles.avatar} />
      </View>

      {/* Booster glass message */}
      <Animated.View style={[styles.glassCard, { opacity: fadeAnim }]}> 
        <View style={styles.bulletDot} />
        <Text style={styles.glassText}>Booster activated — will be waiting</Text>
        <View style={styles.xpPill}>
          <Text style={styles.xpText}>XP +59</Text>
        </View>
      </Animated.View>

      {/* Profile Details */}
      <Animated.View style={[styles.profileDetails, { opacity: fadeAnim }]}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.level}>Level {user.level}</Text>
        <Text style={styles.achievement}>{user.achievement}</Text>
        <View style={styles.weeklyGiftBox}>
          <Text style={styles.weeklyGiftText}>{user.weeklyGift}</Text>
        </View>
      </Animated.View>

      {/* Ad Banner */}
      <Animated.View style={[styles.adBanner, { opacity: fadeAnim }]}>
        <Image
          source={{ uri: "https://via.placeholder.com/320x100?text=Your+Ad+Here" }}
          style={styles.adImage}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Footer */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text style={styles.footerText}>© 2025 Your Company. All rights reserved.</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

// No external SVG dependency; ring is a styled view.

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  header: {
    width: width - 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  subtleNumbersContainer: {
    position: "absolute",
    left: 20,
    top: 70,
    flexDirection: "row",
  },
  subtleNumber: {
    fontSize: 34,
    fontWeight: "800",
    color: "rgba(0,0,0,0.06)",
  },
  avatarContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  progressRing: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: "white",
    backgroundColor: "#eee",
  },
  glassCard: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#30D158",
    marginRight: 8,
  },
  glassText: { color: "#0f5132", fontSize: 12, fontWeight: "600" },
  xpPill: {
    marginLeft: 8,
    backgroundColor: "#30D158",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpText: { color: "#fff", fontWeight: "800", fontSize: 11 },
  profileDetails: {
    marginTop: 20,
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  level: {
    fontSize: 18,
    color: "#3b82f6",
    marginTop: 4,
  },
  achievement: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  weeklyGiftBox: {
    marginTop: 16,
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  weeklyGiftText: {
    color: "#4338ca",
    fontWeight: "600",
  },
  adBanner: {
    width: width - 40,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 30,
    backgroundColor: "#ddd",
  },
  adImage: {
    width: "100%",
    height: "100%",
  },
  footer: {
    paddingVertical: 12,
  },
  footerText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    zIndex: 1,
  },
});