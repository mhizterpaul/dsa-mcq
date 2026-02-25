import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = { [key: string]: undefined };
type NavigationProp = StackNavigationProp<RootStackParamList>;

interface BackButtonProps {
    navigation: NavigationProp;
    style?: ViewStyle;
    iconName?: string;
    iconSize?: number;
    iconColor?: string;
    accessibilityLabel?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
    navigation,
    style,
    iconName = "arrow-left",
    iconSize = 24,
    iconColor = "#000",
    accessibilityLabel = "Go back"
}) => {
    return (
        <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.button, style]}
            testID="back-button"
            accessibilityLabel={accessibilityLabel}
        >
            <Icon name={iconName} size={iconSize} color={iconColor} />
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
