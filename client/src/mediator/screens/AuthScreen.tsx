// src/screens/AuthScreen.tsx
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

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const isLogin = activeTab === 'login';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      
      {/* Toggle Header */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, isLogin && styles.activeButton]}
          onPress={() => setActiveTab('login')}>
          <Text style={[styles.toggleText, isLogin && styles.activeText]}>
            Login
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, !isLogin && styles.activeButton]}
          onPress={() => setActiveTab('register')}>
          <Text style={[styles.toggleText, !isLogin && styles.activeText]}>
            Register
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <View style={styles.form}>
        <View style={styles.inputWrapper}>
          <Icon name="email-outline" size={20} color="#888" />
          <TextInput
            placeholder="Input your email"
            style={styles.input}
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputWrapper}>
          <Icon name="lock-outline" size={20} color="#888" />
          <TextInput
            placeholder="Input your password"
            style={styles.input}
            secureTextEntry
          />
        </View>

        {/* Extra field for Register */}
        {!isLogin && (
          <View style={styles.inputWrapper}>
            <Icon name="lock-check-outline" size={20} color="#888" />
            <TextInput
              placeholder="Confirm your password"
              style={styles.input}
              secureTextEntry
            />
          </View>
        )}

        {/* Remember me / Forgot password */}
        {isLogin && (
          <View style={styles.extraRow}>
            <TouchableOpacity>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitText}>
            {isLogin ? 'Login' : 'Register'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* OAuth Footer */}
      <View style={styles.footer}>
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Or sign in with</Text>
          <View style={styles.divider} />
        </View>
        <View style={styles.oauthRow}>
          <Icon name="google" size={30} color="#DB4437" />
          <Icon name="facebook" size={30} color="#1877F2" />
          <Icon name="apple" size={30} color="#000" />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeButton: {
    backgroundColor: '#00B5D8',
  },
  activeText: {
    color: '#fff',
    fontWeight: '600',
  },
  form: { flex: 1 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 14,
    height: 48,
  },
  input: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333' },
  extraRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  rememberText: { fontSize: 12, color: '#666' },
  forgotText: { fontSize: 12, color: '#00B5D8', fontWeight: '500' },
  submitButton: {
    backgroundColor: '#00B5D8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { paddingVertical: 20 },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  divider: { flex: 1, height: 1, backgroundColor: '#ccc' },
  dividerText: { marginHorizontal: 8, color: '#888', fontSize: 12 },
  oauthRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
});
