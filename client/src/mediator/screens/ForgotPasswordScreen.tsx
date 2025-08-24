import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { View, Text, Button, TextField } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

  const isValidEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const emailIsValid = isValidEmail(email);

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: '#fff', padding: 20}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      <View row spread centerV marginB-16>
        <Button link iconSource={() => <Icon name="arrow-left" size={24} color="#333" />} onPress={() => navigation.goBack()} />
        <Text text70b color_grey10>Reset Password</Text>
        <View width={24} />
      </View>

      <View height={6} bg-grey70 br10 marginB-24>
        <View style={{width: '33%', height: 6, backgroundColor: '#00B5D8'}} />
      </View>

      <Text text80 color_grey30 marginB-20>
        Enter your email address to continue
      </Text>

      <TextField
        placeholder="Input your email"
        leadingAccessory={<Icon name="email-outline" size={20} color="#888" />}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Button
        label="Continue"
        disabled={!emailIsValid}
        onPress={() => navigation.navigate('VerifyCodeScreen')}
        marginB-10
      />

      <Button
        label="Cancel"
        onPress={() => navigation.goBack()}
        bg-grey70
      />
    </KeyboardAvoidingView>
  );
}
