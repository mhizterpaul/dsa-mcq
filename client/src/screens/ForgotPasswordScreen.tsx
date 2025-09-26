import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { Button, TextInput, Text, ProgressBar, IconButton } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  VerifyCodeScreen: undefined;
  // other screens...
};

type ForgotPasswordScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'VerifyCodeScreen'
>;

interface ForgotPasswordScreenProps {
  navigation: ForgotPasswordScreenNavigationProp;
}

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');

  const isValidEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const emailIsValid = isValidEmail(email);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Reset Password</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ProgressBar progress={0.33} color="#00B5D8" style={styles.progressBar} />

      <Text style={styles.instructionText}>
        Enter your email address to continue
      </Text>

      <TextInput
        label="Email"
        placeholder="Input your email"
        left={<TextInput.Icon icon="email-outline" />}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <Button
        mode="contained"
        disabled={!emailIsValid}
        onPress={() => navigation.navigate('VerifyCodeScreen')}
        style={styles.continueButton}
      >
        Continue
      </Button>

      <Button
        mode="contained"
        onPress={() => navigation.goBack()}
        style={styles.cancelButton}
        labelStyle={styles.cancelButtonLabel}
      >
        Cancel
      </Button>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121', // color_grey10
  },
  headerSpacer: {
    width: 24,
  },
  progressBar: {
    height: 6,
    borderRadius: 10, // br10
    marginBottom: 24, // marginB-24
    backgroundColor: '#f0f0f0', // bg-grey70
  },
  instructionText: {
    fontSize: 14, // text80
    color: '#888', // color_grey30
    marginBottom: 20, // marginB-20
  },
  input: {
    marginBottom: 10,
  },
  continueButton: {
    marginBottom: 10, // marginB-10
  },
  cancelButton: {
    backgroundColor: '#f0f0f0', // bg-grey70
  },
  cancelButtonLabel: {
    color: '#000',
  }
});