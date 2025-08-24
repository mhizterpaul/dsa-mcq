import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootState } from '../../mediator/store';
import { setUserProfile } from '../store/userProfile.slice';
import { UserProfile } from '../store/primitives/UserProfile';

const UserSettings: React.FC = () => {
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const dispatch = useDispatch();
    const profile = useSelector((state: RootState) => state.userProfile.profile);

    const handleSettingChange = (setting: keyof UserProfile['settings'], value: any) => {
        if (profile) {
            const newProfile = JSON.parse(JSON.stringify(profile)); // Deep copy
            newProfile.settings[setting] = value;
            dispatch(setUserProfile(newProfile));
        }
    };

    if (!profile) {
        return null; // or a loading indicator
    }

    return (
        <View>
            <TouchableOpacity onPress={() => setDropdownVisible(!isDropdownVisible)}>
                <Icon name="cog" size={24} color="#000" />
            </TouchableOpacity>

            {isDropdownVisible && (
                <View style={styles.dropdown}>
                    <Text style={styles.dropdownTitle}>Settings</Text>

                    <View style={styles.settingRow}>
                        <Text>Theme</Text>
                        {/* A more complex component would be needed for a selection */}
                        <Text>{profile.settings.theme}</Text>
                    </View>

                    <View style={styles.settingRow}>
                        <Text>Notifications</Text>
                        <Switch
                            value={profile.settings.notificationsEnabled}
                            onValueChange={(value) => handleSettingChange('notificationsEnabled', value)}
                        />
                    </View>

                    <View style={styles.settingRow}>
                        <Text>Language</Text>
                        <Text>{profile.settings.language}</Text>
                    </View>

                    <View style={styles.settingRow}>
                        <Text>Sound Effects</Text>
                        <Switch
                            value={profile.settings.soundEffects}
                            onValueChange={(value) => handleSettingChange('soundEffects', value)}
                        />
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    dropdown: {
        position: 'absolute',
        top: 40,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        width: 250,
    },
    dropdownTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
});

export default UserSettings;
