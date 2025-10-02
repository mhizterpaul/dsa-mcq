import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { Text, Button, TextInput, ProgressBar, IconButton } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';

import { verifyCode, requestVerificationCode } from '../components/user/store/user.slice';
import ResetPasswordForm from '../components/user/components/ResetPasswordForm';

type RootStackParamList = {
  // Define your screen params here
};

type VerificationCodeFormNavigationProp = StackNavigationProp<RootStackParamList>;

interface VerificationCodeFormProps {
  navigation: VerificationCodeFormNavigationProp;
  email: string; // passed from ForgotPassword screen
}

const PasswordResetScreen = ({ navigation, email }: VerificationCodeFormProps) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const inputs = useRef<TextInput[]>([]);
  const dispatch = useDispatch();

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
    if (!text && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const isComplete = code.every((digit) => digit.trim().length === 1);

  const handleVerify = async () => {
    if (isComplete) {
      setError('');
      try {
        const resultAction: any = await dispatch(
          verifyCode({ email, code: code.join('') })
        );
        if (verifyCode.fulfilled.match(resultAction)) {
          setVerifiedToken(resultAction.payload.token); // local only
        } else {
          setError(resultAction.error?.message || 'Invalid or expired code.');
        }
      } catch (err: any) {
        setError(err.message || 'Verification failed.');
      }
    }
  };

  const handleResend = () => {
    dispatch(requestVerificationCode({ email }));
  };

  // ✅ Render ResetPasswordForm when token verified
  if (verifiedToken) {
    return <ResetPasswordForm token={verifiedToken} navigation={navigation} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Verification</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ProgressBar progress={0.66} color="#00B5D8" style={styles.progressBar} />

      <Text style={styles.title}>Enter verification code</Text>
      <Text style={styles.subtitle}>
        We’ve sent a 6-digit code to <Text style={{ fontWeight: '600' }}>{email}</Text>.
      </Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref!)}
            style={styles.codeBox}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            textAlign="center"
          />
        ))}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Button
        mode="contained"
        disabled={!isComplete}
        onPress={handleVerify}
        style={styles.verifyButton}
      >
        Verify Now
      </Button>

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn’t receive any code? </Text>
        <Button mode="text" onPress={handleResend}>
          Resend Code
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  headerSpacer: { width: 24 },
  progressBar: {
    height: 6,
    borderRadius: 10,
    marginBottom: 24,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  codeContainer: {
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
  verifyButton: { marginBottom: 20 },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: { fontSize: 14, color: '#888' },
  errorText: { color: 'red', marginBottom: 10, textAlign: 'center' },
});

export default PasswordResetScreen;
