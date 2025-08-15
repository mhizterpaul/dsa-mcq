import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { View, Text, Button, TextField } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const VerificationCodeForm = ({ navigation }) => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputs = useRef<TextField[]>([]);

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

    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <View row spread centerV marginB-16>
          <Button link iconSource={() => <Icon name="arrow-left" size={24} color="#333" />} onPress={() => navigation.goBack()} />
          <Text text70b color_grey10>Verification</Text>
          <View width={24} />
        </View>

        <View height={6} bg-grey70 br10 marginB-24>
          <View style={[styles.progressBarFill, { width: '66%' }]} />
        </View>

        <Text text60b marginB-8>Enter verification code</Text>
        <Text text80 color_grey30 marginB-24>
          We’ve sent a 6-digit code to your email.
        </Text>

        <View row spread marginB-30>
          {code.map((digit, index) => (
            <TextField
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

        <Button
          label="Verify Now"
          disabled={!isComplete}
          onPress={() => {
            // handle verification
          }}
          marginB-20
        />

        <View row center>
          <Text text80 color_grey30>Didn’t receive any code? </Text>
          <Button link label="Resend Code" onPress={() => { /* resend logic */ }} />
        </View>
      </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    progressBarFill: { height: 6, backgroundColor: '#00B5D8' },
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
  });

export default VerificationCodeForm;
