// src/screens/VerificationCodeScreen.tsx
import React, { useRef, useState } from 'react';
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

export default function VerificationCodeScreen({ navigation }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // move focus
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
    // move back if empty
    if (!text && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const isComplete = code.every((digit) => digit.trim().length === 1);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: '66%' }]} />
      </View>

      {/* Title & instruction */}
      <Text style={styles.title}>Enter verification code</Text>
      <Text style={styles.instruction}>
        We’ve sent a 6-digit code to your email.
      </Text>

      {/* 6 digit input */}
      <View style={styles.codeRow}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref!)}
            style={styles.codeBox}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
          />
        ))}
      </View>

      {/* Verify Now button */}
      <TouchableOpacity
        style={[styles.verifyButton, !isComplete && styles.disabledButton]}
        disabled={!isComplete}
        onPress={() => {
          // handle verification
        }}>
        <Text style={styles.verifyText}>Verify Now</Text>
      </TouchableOpacity>

      {/* Resend code */}
      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn’t receive any code? </Text>
        <TouchableOpacity onPress={() => { /* resend logic */ }}>
          <Text style={styles.resendLink}>Resend Code</Text>
        </TouchableOpacity>
      </View>
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
  progressBarFill: { height: 6, backgroundColor: '#00B5D8' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#333' },
  instruction: { fontSize: 14, color: '#555', marginBottom: 24 },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  codeBox: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: '#F9F9F9',
    color: '#333',
  },
  verifyButton: {
    backgroundColor: '#00B5D8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: { backgroundColor: '#A0DDE8' },
  verifyText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resendContainer: { flexDirection: 'row', justifyContent: 'center' },
  resendText: { fontSize: 14, color: '#555' },
  resendLink: {
    fontSize: 14,
    color: '#00B5D8',
    textDecorationLine: 'underline',
  },
});
