import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const avatarUri = 'https://randomuser.me/api/portraits/men/32.jpg'; // Placeholder avatar

const UserProfileSummary = () => {
  return (
    <View style={styles.profileRow}>
      <Image source={{ uri: avatarUri }} style={styles.avatar} />
      <View>
        <Text style={styles.helloText}>Hello!</Text>
        <Text style={styles.nameText}>Ivan L.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#eee',
  },
  helloText: { color: '#B0B0B0', fontSize: 13, fontWeight: '500' },
  nameText: { color: '#222', fontSize: 16, fontWeight: 'bold' },
});

export default UserProfileSummary;
