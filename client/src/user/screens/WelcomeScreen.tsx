// src/screens/WelcomeScreen.tsx
import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      {/* Header Image */}
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1560185008-5a0d6c72c11d', // placeholder
        }}
        style={styles.headerImage}
        resizeMode="cover"
      />

      {/* App Logo */}
      <View style={styles.logoContainer}>
        <Icon name="home-outline" size={36} color="#00B5D8" />
        <Text style={styles.logoText}>NestHouse</Text>
      </View>

      {/* Title & Subtitle */}
      <Text style={styles.title}>
        Find Your <Text style={styles.highlight}>Dream</Text> Home with Ease
      </Text>
      <Text style={styles.subtitle}>
        NestHouse helps you discover the perfect property tailored to your
        needs
      </Text>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.loginButton]}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.registerButton]}>
          <Text style={[styles.buttonText, styles.registerText]}>Register</Text>
        </TouchableOpacity>
      </View>

      {/* Divider with text */}
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>Or sign in with</Text>
        <View style={styles.divider} />
      </View>

      {/* OAuth icons */}
      <View style={styles.oauthRow}>
        <Icon name="google" size={30} color="#DB4437" />
        <Icon name="facebook" size={30} color="#1877F2" />
        <Icon name="apple" size={30} color="#000" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  headerImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 6,
    color: '#222',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  highlight: {
    color: '#00B5D8',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  loginButton: {
    backgroundColor: '#00B5D8',
  },
  registerButton: {
    backgroundColor: '#E0F7FA',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  registerText: {
    color: '#00B5D8',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '80%',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  dividerText: {
    marginHorizontal: 8,
    color: '#888',
    fontSize: 12,
  },
  oauthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
  },
});
