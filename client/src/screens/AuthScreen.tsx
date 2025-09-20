import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { View, Text, Button, TextField, Checkbox } from 'react-native-ui-lib';
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

  const handleToastHide = () => {
    setToast({ ...toast, visible: false });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      
      <Spinner visible={loading} />
      <Toast
        visible={toast.visible}
        message={toast.message}
        onHide={handleToastHide}
      />

      <View row bg-grey70 br20 marginB-24>
        <Button
          label="Login"
          flex
          backgroundColor={isLogin ? '#00B5D8' : 'transparent'}
          color={isLogin ? '#fff' : '#666'}
          onPress={() => setActiveTab('login')}
        />
        <Button
          label="Register"
          flex
          backgroundColor={!isLogin ? '#00B5D8' : 'transparent'}
          color={!isLogin ? '#fff' : '#666'}
          onPress={() => setActiveTab('register')}
        />
      </View>

      <View flex>
        <TextField
          testID="email-input"
          placeholder="Input your email"
          leadingAccessory={<Icon name="email-outline" size={20} color="#888" />}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextField
          testID="password-input"
          placeholder="Input your password"
          leadingAccessory={<Icon name="lock-outline" size={20} color="#888" />}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {!isLogin && (
          <TextField
            testID="confirm-password-input"
            placeholder="Confirm your password"
            leadingAccessory={<Icon name="lock-check-outline" size={20} color="#888" />}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        )}

        {isLogin && (
          <View row spread centerV marginB-14>
            <Checkbox label="Remember me" />
            <Button link label="Forgot Password?" />
          </View>
        )}

        <Button
          label={isLogin ? 'Login' : 'Register'}
          backgroundColor="#00B5D8"
          marginT-4
          onPress={handleAuth}
          disabled={loading}
        />
      </View>

      <View paddingV-20>
        <View row centerV marginB-16>
          <View flex height={1} bg-grey50 />
          <Text text90 marginH-8 color-grey30>Or sign in with</Text>
          <View flex height={1} bg-grey50 />
        </View>
        <View row spread paddingH-40>
          <Icon testID="google-button" name="google" size={30} color="#DB4437" onPress={() => signIn('google')} />
          <Icon testID="github-button" name="github" size={30} color="#000" onPress={() => signIn('github')} />
          <Icon testID="twitter-button" name="twitter" size={30} color="#000" onPress={() => signIn('twitter')} />
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
    },
});
