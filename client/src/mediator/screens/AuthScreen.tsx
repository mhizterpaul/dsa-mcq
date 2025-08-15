import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { View, Text, Button, TextField, Checkbox } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const isLogin = activeTab === 'login';

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: '#fff', padding: 20}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      
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
          placeholder="Input your email"
          leadingAccessory={<Icon name="email-outline" size={20} color="#888" />}
          keyboardType="email-address"
        />
        <TextField
          placeholder="Input your password"
          leadingAccessory={<Icon name="lock-outline" size={20} color="#888" />}
          secureTextEntry
        />

        {!isLogin && (
          <TextField
            placeholder="Confirm your password"
            leadingAccessory={<Icon name="lock-check-outline" size={20} color="#888" />}
            secureTextEntry
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
        />
      </View>

      <View paddingV-20>
        <View row centerV marginB-16>
          <View flex height={1} bg-grey50 />
          <Text text90 marginH-8 color-grey30>Or sign in with</Text>
          <View flex height={1} bg-grey50 />
        </View>
        <View row spread paddingH-40>
          <Icon name="google" size={30} color="#DB4437" />
          <Icon name="facebook" size={30} color="#1877F2" />
          <Icon name="apple" size={30} color="#000" />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
