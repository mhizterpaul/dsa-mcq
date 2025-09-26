import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, TextInput, Checkbox, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';

import { loginUser, registerUser } from '../components/user/store/user.slice';
import Spinner from '../components/common/components/Spinner';
import Toast from '../components/common/components/Toast';
import { RootState, AppDispatch } from '../store';
import { useOAuth } from '../components/common/hooks/useOAuth';

type RootStackParamList = {
    Home: undefined;
    ForgotPassword: undefined;
    // other screens
};

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface AuthScreenProps {
    navigation: AuthScreenNavigationProp;
}

export default function AuthScreen({ navigation }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [toast, setToast] = useState({ visible: false, message: '' });

  const dispatch: AppDispatch = useDispatch();
  const { loading, error, currentUser } = useSelector((state: RootState) => state.user);
  const { signIn } = useOAuth();

  const isLogin = activeTab === 'login';

  useEffect(() => {
    if (error) {
      setToast({ visible: true, message: error });
    }
  }, [error]);

  useEffect(() => {
    if (currentUser) {
      // Navigate to home screen on successful login/registration
      navigation.navigate('Home');
    }
  }, [currentUser, navigation]);

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleAuth = () => {
    if (!validateEmail(email)) {
      setToast({ visible: true, message: 'Please enter a valid email address.' });
      return;
    }
    if (password.length < 6) {
        setToast({ visible: true, message: 'Password must be at least 6 characters long.' });
        return;
    }

    if (isLogin) {
      dispatch(loginUser({ username: email, password }));
    } else {
      if (password !== confirmPassword) {
        setToast({ visible: true, message: 'Passwords do not match.' });
        return;
      }
      // Assuming username is the email for registration
      dispatch(registerUser({ username: email, email: email, password: password }));
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github' | 'twitter') => {
    try {
      await signIn(provider);
    } catch (error) {
      setToast({
        visible: true,
        message: error instanceof Error ? error.message : 'OAuth sign-in failed'
      });
    }
  };

  const handleToastHide = () => {
    setToast({ ...toast, visible: false });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      <Spinner visible={loading} />
      <Toast
        visible={toast.visible}
        message={toast.message}
        onHide={handleToastHide}
      />

      <View style={styles.tabContainer}>
        <Button
          testID="login-tab"
          mode={isLogin ? 'contained' : 'text'}
          onPress={() => setActiveTab('login')}
          style={styles.tabButton}
          labelStyle={isLogin ? styles.activeTabText : styles.inactiveTabText}
          theme={{ colors: { primary: '#00B5D8' } }}
        >
          Login
        </Button>
        <Button
          testID="register-tab"
          mode={!isLogin ? 'contained' : 'text'}
          onPress={() => setActiveTab('register')}
          style={styles.tabButton}
          labelStyle={!isLogin ? styles.activeTabText : styles.inactiveTabText}
          theme={{ colors: { primary: '#00B5D8' } }}
        >
          Register
        </Button>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          testID="email-input"
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          left={<TextInput.Icon icon="email-outline" />}
          style={styles.input}
        />
        <TextInput
          testID="password-input"
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          left={<TextInput.Icon icon="lock-outline" />}
          style={styles.input}
        />

        {!isLogin && (
          <TextInput
            testID="confirm-password-input"
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            left={<TextInput.Icon icon="lock-check-outline" />}
            style={styles.input}
          />
        )}

        {isLogin && (
          <View style={styles.loginOptionsContainer}>
            <Checkbox.Item
              label="Remember me"
              status={rememberMe ? 'checked' : 'unchecked'}
              onPress={() => setRememberMe(!rememberMe)}
              style={styles.checkbox}
              labelStyle={styles.checkboxLabel}
              position='leading'
            />
            <Button mode="text" onPress={() => navigation.navigate('ForgotPassword')}>
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
          <Icon testID="google-button" name="google" size={30} color="#DB4437" onPress={() => handleOAuthSignIn('google')} />
          <Icon testID="github-button" name="github" size={30} color="#000" onPress={() => handleOAuthSignIn('github')} />
          <Icon testID="twitter-button" name="twitter" size={30} color="#1DA1F2" onPress={() => handleOAuthSignIn('twitter')} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        justifyContent: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0', // bg-grey70
        borderRadius: 20, // br20
        marginBottom: 24, // marginB-24
    },
    tabButton: {
        flex: 1,
    },
    activeTabText: {
        color: '#fff',
    },
    inactiveTabText: {
        color: '#666',
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    input: {
        marginBottom: 16,
    },
    loginOptionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14, // marginB-14
    },
    checkbox: {
        paddingHorizontal: 0,
        paddingVertical: 0,
        marginLeft: -10,
    },
    checkboxLabel: {
      fontSize: 14,
      color: '#000',
    },
    authButton: {
        marginTop: 4, // marginT-4
        paddingVertical: 8,
    },
    socialLoginContainer: {
        paddingVertical: 20, // paddingV-20
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16, // marginB-16
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#ccc', // bg-grey50
    },
    dividerText: {
        marginHorizontal: 8, // marginH-8
        color: '#888', // color-grey30
    },
    socialIconsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around', // spread
        paddingHorizontal: 40, // paddingH-40
    },
});