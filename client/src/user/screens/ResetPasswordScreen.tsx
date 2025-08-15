import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { View, Text, TextField, Button, Dialog } from "react-native-ui-lib";
import { BlurView } from "@react-native-community/blur";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successModal, setSuccessModal] = useState(false);

  const handleResetPassword = () => {
    if (!password || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setError("");
    setSuccessModal(true);
  };

  return (
    <View flex padding-20 bg-white>
      <Button link iconSource={() => <Ionicons name="arrow-back" size={24} color="#333" />} style={styles.backButton} />

      <View height={6} bg-grey70 br10>
        <View width="80%" height="100%" bg-green30 />
      </View>

      <Text text50b marginV-20>Reset Password</Text>

      <TextField
        secureTextEntry
        placeholder="New Password"
        value={password}
        onChangeText={setPassword}
        error={error}
      />
      <TextField
        secureTextEntry
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={error}
      />

      <Button label="Reset Password" onPress={handleResetPassword} marginT-20 />
      <Button label="Cancel" link />

      <Dialog
        visible={successModal}
        onDismiss={() => setSuccessModal(false)}
        containerStyle={styles.dialog}
      >
        <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={10} />
        <View center padding-20>
          <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
          <Text text60b marginV-15>Password Reset Successfully!</Text>
          <Button label="OK" onPress={() => setSuccessModal(false)} />
        </View>
      </Dialog>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginTop: 40,
    marginBottom: 20,
    alignSelf: 'flex-start'
  },
  dialog: {
    backgroundColor: 'transparent',
    borderRadius: 20,
  },
});
