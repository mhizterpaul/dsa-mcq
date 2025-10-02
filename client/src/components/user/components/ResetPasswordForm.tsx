import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  TextInput,
  Button,
  Dialog,
  Portal,
  Paragraph,
  Text,
  ProgressBar,
  Colors,
} from "react-native-paper";
import { BlurView } from "@react-native-community/blur";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store"; // adjust path
import { resetPassword } from "../slices/userSlice";
import { useNavigation } from "@react-navigation/native"; // ⚡ add this

interface ResetPasswordFormProps {
  resetToken: string | null;
  onCancel?: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  resetToken,
  onCancel,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successModal, setSuccessModal] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.user);
  const navigation = useNavigation(); // ⚡ get navigation

  const handleResetPassword = async () => {
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
    if (!resetToken) {
      setError("Session expired. Please request a new code.");
      return;
    }

    setError("");
    const result = await dispatch(
      resetPassword({ token: resetToken, newPassword: password })
    );

    if (resetPassword.fulfilled.match(result)) {
      setSuccessModal(true);
    } else {
      setError(result.payload as string);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModal(false);
    navigation.navigate("Auth" as never); // ⚡ go back to Auth screen
  };

  return (
    <View style={styles.container}>
      <Button
        icon={() => <Ionicons name="arrow-back" size={24} color="#333" />}
        style={styles.backButton}
        onPress={onCancel}
      />

      <ProgressBar
        progress={0.8}
        color={Colors.green500}
        style={styles.progressBar}
      />

      <Text style={styles.title}>Reset Password</Text>

      <TextInput
        secureTextEntry
        placeholder="New Password"
        value={password}
        onChangeText={setPassword}
        error={!!error}
        style={styles.input}
      />
      <TextInput
        secureTextEntry
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={!!error}
        style={styles.input}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Button
        mode="contained"
        onPress={handleResetPassword}
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        Reset Password
      </Button>
      <Button mode="text" onPress={onCancel}>
        Cancel
      </Button>

      <Portal>
        <Dialog
          visible={successModal}
          onDismiss={handleSuccessClose}
          style={styles.dialog}
        >
          <Dialog.Content style={styles.dialogContent}>
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={10}
            />
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            <Paragraph style={styles.dialogText}>
              Password Reset Successfully!
            </Paragraph>
            <Button onPress={handleSuccessClose}>OK</Button>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  backButton: {
    marginTop: 40,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  dialog: {
    backgroundColor: "transparent",
    borderRadius: 20,
  },
  dialogContent: {
    alignItems: "center",
    padding: 20,
  },
  dialogText: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 15,
  },
});

export default ResetPasswordForm;

      setError("");
      setSuccessModal(true);
    };

    return (
        <View style={styles.container}>
            <Button icon={() => <Ionicons name="arrow-back" size={24} color="#333" />} style={styles.backButton} />

            <ProgressBar progress={0.8} color={Colors.green500} style={styles.progressBar} />

            <Text style={styles.title}>Reset Password</Text>

            <TextInput
                secureTextEntry
                placeholder="New Password"
                value={password}
                onChangeText={setPassword}
                error={!!error}
                style={styles.input}
            />
            <TextInput
                secureTextEntry
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={!!error}
                style={styles.input}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button mode="contained" onPress={handleResetPassword} style={styles.button}>
                Reset Password
            </Button>
            <Button mode="text" onPress={() => {}}>
                Cancel
            </Button>

            <Portal>
                <Dialog visible={successModal} onDismiss={() => setSuccessModal(false)} style={styles.dialog}>
                    <Dialog.Content style={styles.dialogContent}>
                        <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={10} />
                        <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
                        <Paragraph style={styles.dialogText}>Password Reset Successfully!</Paragraph>
                        <Button onPress={() => setSuccessModal(false)}>OK</Button>
                    </Dialog.Content>
                </Dialog>
            </Portal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    backButton: {
      marginTop: 40,
      marginBottom: 20,
      alignSelf: 'flex-start'
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 20,
    },
    input: {
        marginBottom: 10,
    },
    button: {
        marginTop: 20,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    dialog: {
        backgroundColor: 'transparent',
        borderRadius: 20,
    },
    dialogContent: {
        alignItems: 'center',
        padding: 20,
    },
    dialogText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 15,
    }
});

export default ResetPasswordForm;
