import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  StyleSheet,
  Modal,
} from "react-native";
import { BlurView } from "@react-native-community/blur";
import { Ionicons } from "@expo/vector-icons";

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successModal, setSuccessModal] = useState(false);

  const handleResetPassword = () => {
    Keyboard.dismiss();

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
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>

      {/* Title */}
      <Text style={styles.title}>Reset Password</Text>

      {/* Input Fields */}
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="New Password"
        value={password}
        onChangeText={setPassword}
        returnKeyType="done"
        onSubmitEditing={Keyboard.dismiss}
      />
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        returnKeyType="done"
        onSubmitEditing={Keyboard.dismiss}
      />

      {/* Inline Error */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Buttons */}
      <TouchableOpacity style={styles.primaryButton} onPress={handleResetPassword}>
        <Text style={styles.primaryButtonText}>Reset Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Cancel</Text>
      </TouchableOpacity>

      {/* Success Modal with Blur */}
      <Modal transparent visible={successModal} animationType="fade">
        <BlurView style={styles.blurOverlay} blurType="light" blurAmount={10} />
        <View style={styles.modalContent}>
          <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
          <Text style={styles.modalText}>Password Reset Successfully!</Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setSuccessModal(false)}
          >
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  backButton: { marginTop: 40, marginBottom: 20 },
  progressBar: { height: 6, backgroundColor: "#eee", borderRadius: 3 },
  progressFill: { width: "80%", height: "100%", backgroundColor: "#4CAF50" },
  title: { fontSize: 24, fontWeight: "bold", marginVertical: 20 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  errorText: { color: "red", fontSize: 14, marginTop: 5 },
  primaryButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  primaryButtonText: { color: "#fff", textAlign: "center", fontSize: 16 },
  secondaryButton: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  secondaryButtonText: { color: "#333", textAlign: "center", fontSize: 16 },
  blurOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  modalContent: {
    marginHorizontal: 30,
    marginTop: "50%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalText: { fontSize: 18, fontWeight: "500", marginVertical: 15 },
  modalButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalButtonText: { color: "#fff", fontSize: 16 },
});
