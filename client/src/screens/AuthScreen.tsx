import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, TextInput, Checkbox, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';

import { loginUser, registerUser } from '../components/user/store/user.slice';
import Spinner from '../components/common/components/Spinner';
import { RootState, AppDispatch } from '../store';
import { useOAuth } from '../components/common/hooks/useOAuth';

type RootStackParamList = {
  Home: undefined;
  ForgotPassword: undefined;
};

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface AuthScreenProps {
  navigation: AuthScreenNavigationProp;
}

type FormErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

export default function AuthScreen({ navigation }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const dispatch: AppDispatch = useDispatch();
  const reduxUserState: any = useSelector((state: RootState) =>
    state.user ? state.user : (state as any).auth
  );
  const loading: boolean =
    !!reduxUserState?.loading || reduxUserState?.status === 'loading';
  const reduxError = reduxUserState?.error ?? null;
  const reduxFieldErrors = reduxUserState?.errors ?? null;
  const currentUser =
    reduxUserState?.currentUser ?? reduxUserState?.user ?? null;

  const { signIn } = useOAuth();

  const isLogin = activeTab === 'login';

  useEffect(() => {
    setFormErrors({});
    if (!reduxError && !reduxFieldErrors) return;

    if (reduxFieldErrors && typeof reduxFieldErrors === 'object') {
      setFormErrors((prev) => ({ ...prev, ...reduxFieldErrors }));
      return;
    }

    if (typeof reduxError === 'string') {
      setFormErrors({ general: reduxError });
    }
  }, [reduxError, reduxFieldErrors]);

  useEffect(() => {
    if (currentUser) {
      navigation.navigate('Home');
    }
  }, [currentUser, navigation]);

  const validateEmail = (candidate: string) => /\S+@\S+\.\S+/.test(candidate);

  const onChangeFullName = (value: string) => {
    setFullName(value);
    setFormErrors((f) => ({ ...f, fullName: undefined }));
  };
  const onChangeEmail = (value: string) => {
    setEmail(value);
    setFormErrors((f) => ({ ...f, email: undefined, general: undefined }));
  };
  const onChangePassword = (value: string) => {
    setPassword(value);
    setFormErrors((f) => ({ ...f, password: undefined, general: undefined }));
  };
  const onChangeConfirm = (value: string) => {
    setConfirmPassword(value);
    setFormErrors((f) => ({ ...f, confirmPassword: undefined }));
  };

  const handleAuth = () => {
    setFormErrors({});

    if (!validateEmail(email)) {
      setFormErrors({ email: 'Please enter a valid email address.' });
      return;
    }
    if (password.length < 6) {
      setFormErrors({ password: 'Password must be at least 6 characters long.' });
      return;
    }

    if (isLogin) {
      dispatch(loginUser({ email, password }));
      return;
    }

    if (!fullName.trim()) {
      setFormErrors({ fullName: 'Full name is required.' });
      return;
    }
    if (password !== confirmPassword) {
      setFormErrors({ confirmPassword: 'Passwords do not match.' });
      return;
    }

    dispatch(registerUser({ fullName, email, password }));
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github' | 'twitter') => {
    try {
      await signIn(provider);
    } catch (err: any) {
      setFormErrors({ general: err?.message ?? 'OAuth sign-in failed' });
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Spinner visible={loading} />

      <View style={styles.tabContainer}>
        <Button
          testID="login-tab"
          mode={isLogin ? 'contained' : 'text'}
          onPress={() => {
            setActiveTab('login');
            setFormErrors({});
          }}
          style={styles.tabButton}
          labelStyle={isLogin ? styles.activeTabText : styles.inactiveTabText}
          theme={{ colors: { primary: '#00B5D8' } }}
        >
          Login
        </Button>

        <Button
          testID="register-tab"
          mode={!isLogin ? 'contained' : 'text'}
          onPress={() => {
            setActiveTab('register');
            setFormErrors({});
          }}
          style={styles.tabButton}
          labelStyle={!isLogin ? styles.activeTabText : styles.inactiveTabText}
          theme={{ colors: { primary: '#00B5D8' } }}
        >
          Register
        </Button>
      </View>

      <View style={styles.formContainer}>
        {!isLogin && (
          <>
            <TextInput
              label="Full name"
              accessibilityLabel="Full name"
              value={fullName}
              onChangeText={onChangeFullName}
              autoCapitalize="words"
              left={<TextInput.Icon icon="account-outline" />}
              style={styles.input}
              error={!!formErrors.fullName}
            />
            {formErrors.fullName ? (
              <Text style={styles.errorText}>{formErrors.fullName}</Text>
            ) : null}
          </>
        )}

        <TextInput
          label="Email"
          accessibilityLabel="Email"
          value={email}
          onChangeText={onChangeEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          left={<TextInput.Icon icon="email-outline" />}
          style={styles.input}
          error={!!formErrors.email}
        />
        {formErrors.email ? (
          <Text style={styles.errorText}>{formErrors.email}</Text>
        ) : null}

        <TextInput
          label="Password"
          accessibilityLabel="Password"
          value={password}
          onChangeText={onChangePassword}
          secureTextEntry
          left={<TextInput.Icon icon="lock-outline" />}
          style={styles.input}
          error={!!formErrors.password}
        />
        {formErrors.password ? (
          <Text style={styles.errorText}>{formErrors.password}</Text>
        ) : null}

        {!isLogin && (
          <>
            <TextInput
              label="Confirm password"
              accessibilityLabel="Confirm password"
              value={confirmPassword}
              onChangeText={onChangeConfirm}
              secureTextEntry
              left={<TextInput.Icon icon="lock-check-outline" />}
              style={styles.input}
              error={!!formErrors.confirmPassword}
            />
            {formErrors.confirmPassword ? (
              <Text style={styles.errorText}>{formErrors.confirmPassword}</Text>
            ) : null}
          </>
        )}

        {formErrors.general ? (
          <Text style={styles.errorText}>{formErrors.general}</Text>
        ) : null}

        {isLogin && (
          <View style={styles.loginOptionsContainer}>
            <Checkbox.Item
              label="Remember me"
              status={rememberMe ? 'checked' : 'unchecked'}
              onPress={() => setRememberMe(!rememberMe)}
              style={styles.checkbox}
              labelStyle={styles.checkboxLabel}
              position="leading"
            />
            <Button mode="text" onPress={handleForgotPassword}>
              Forgot Password?
            </Button>
          </View>
        )}

        <Button
          testID="auth-button"
          mode="contained"
          onPress={handleAuth}
          disabled={loading}
          style={styles.authButton}
        >
          {isLogin ? 'Login' : 'Register'}
        </Button>
      </View>

      <View style={styles.socialLoginContainer}>
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Or sign in with</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialIconsContainer}>
          <Icon.Button
            name="google"
            backgroundColor="transparent"
            underlayColor="transparent"
            color="#DB4437"
            size={30}
            onPress={() => handleOAuthSignIn('google')}
            accessibilityRole="button"
            accessibilityLabel="Sign in with Google"
          />
          <Icon.Button
            name="github"
            backgroundColor="transparent"
            underlayColor="transparent"
            color="#000"
            size={30}
            onPress={() => handleOAuthSignIn('github')}
            accessibilityRole="button"
            accessibilityLabel="Sign in with Github"
          />
          <Icon.Button
            name="twitter"
            backgroundColor="transparent"
            underlayColor="transparent"
            color="#1DA1F2"
            size={30}
            onPress={() => handleOAuthSignIn('twitter')}
            accessibilityRole="button"
            accessibilityLabel="Sign in with Twitter"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 20, marginBottom: 24 },
  tabButton: { flex: 1 },
  activeTabText: { color: '#fff' },
  inactiveTabText: { color: '#666' },
  formContainer: { flex: 1, justifyContent: 'center' },
  input: { marginBottom: 8 },
  errorText: { color: '#B00020', marginBottom: 12, fontSize: 13 },
  loginOptionsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  checkbox: { paddingHorizontal: 0, paddingVertical: 0, marginLeft: -10 },
  checkboxLabel: { fontSize: 14, color: '#000' },
  authButton: { marginTop: 8, paddingVertical: 8 },
  socialLoginContainer: { paddingVertical: 20 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  divider: { flex: 1, height: 1, backgroundColor: '#ccc' },
  dividerText: { marginHorizontal: 8, color: '#888' },
  socialIconsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 40 },
});
