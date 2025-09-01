import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = { [key: string]: undefined };
type NavigationProp = StackNavigationProp<RootStackParamList>;

interface BackButtonProps {
    navigation: NavigationProp;
}

const BackButton: React.FC<BackButtonProps> = ({ navigation }) => {
    return (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
            <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 1,
        padding: 10,
    },
});

export default BackButton;
