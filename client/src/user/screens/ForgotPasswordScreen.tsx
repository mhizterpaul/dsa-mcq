// src/screens/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const isValidEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const emailIsValid = isValidEmail(email);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Header with back button */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reset Password</Text>
        <View style={{ width: 24 }} /> {/* spacer for alignment */}
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: '33%' }]} />
      </View>

      {/* Instruction */}
      <Text style={styles.instruction}>
        Enter your email address to continue
      </Text>

      {/* Email input */}
      <View style={styles.inputWrapper}>
        <Icon name="email-outline" size={20} color="#888" />
        <TextInput
          style={styles.input}
          placeholder="Input your email"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Buttons */}
      <TouchableOpacity
        style={[styles.continueButton, !emailIsValid && styles.disabledButton]}
        disabled={!emailIsValid}
        onPress={() => navigation.navigate('VerifyCodeScreen')}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#00B5D8',
  },
  instruction: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333' },
  continueButton: {
    backgroundColor: '#00B5D8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#A0DDE8',
  },
  continueText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  cancelText: { color: '#333', fontSize: 16, fontWeight: '500' },
});
