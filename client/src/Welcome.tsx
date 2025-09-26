import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useOAuth } from './components/common/hooks/useOAuth';

type RootStackParamList = {
    Auth: undefined;
    // other screens
};

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

interface WelcomeProps {
    navigation: WelcomeScreenNavigationProp;
}

const Welcome: React.FC<WelcomeProps> = ({ navigation }) => {
    const { signIn } = useOAuth();

    const handleLogin = () => {
        navigation.navigate('Auth');
    };

    const handleRegister = () => {
        navigation.navigate('Auth');
    };

    return (
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Cover
              source={{
                uri: 'https://images.unsplash.com/photo-1560185008-5a0d6c72c11d', // placeholder
              }}
              style={styles.image}
            />
          </Card>

          <View style={styles.logoContainer}>
            <Icon name="home-outline" size={36} color="#00B5D8" />
            <Text style={styles.logoText}>NestHouse</Text>
          </View>

          <Text style={styles.title}>
            Find Your <Text style={styles.titleHighlight}>Dream</Text> Home with Ease
          </Text>
          <Text style={styles.subtitle}>
            NestHouse helps you discover the perfect property tailored to your
            needs
          </Text>

          <View style={styles.buttonContainer}>
            <Button mode="contained" style={styles.button} onPress={handleLogin}>
              Login
            </Button>
            <Button mode="contained" style={[styles.button, styles.registerButton]} onPress={handleRegister}>
              Register
            </Button>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Or sign in with</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialIconsContainer}>
            <Icon name="google" size={30} color="#DB4437" onPress={() => signIn('google')} />
            <Icon name="github" size={30} color="#000" onPress={() => signIn('github')} />
            <Icon name="twitter" size={30} color="#1DA1F2" onPress={() => signIn('twitter')} />
          </View>
        </View>
      );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        backgroundColor: '#fff',
    },
    card: {
        width: '100%',
        marginBottom: 20,
        borderRadius: 12,
    },
    image: {
        height: 200,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    logoText: {
        fontSize: 20, // text70b
        fontWeight: 'bold',
        marginLeft: 6,
    },
    title: {
        fontSize: 24, // text60b
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    titleHighlight: {
        color: '#00B5D8', // color-cyan30
    },
    subtitle: {
        fontSize: 14, // text80
        color: '#888', // color-grey30
        textAlign: 'center',
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    button: {
        flex: 1,
        marginHorizontal: 4,
    },
    registerButton: {
        backgroundColor: '#007A8D', // bg-cyan80 (darker cyan)
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        width: '80%',
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0', // bg-grey70
    },
    dividerText: {
        marginHorizontal: 8,
        fontSize: 12, // text90
        color: '#BDBDBD', // color-grey50
    },
    socialIconsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '50%',
    },
});

export default Welcome;