import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

interface AvatarGroupProps {
    avatars: (string | undefined)[];
    participantCount: number;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({ avatars, participantCount }) => {
    const displayedAvatars = avatars.slice(0, 3); // Show max 3 avatars
    const remainingCount = participantCount - displayedAvatars.length;

    return (
        <View style={styles.container}>
            {displayedAvatars.map((avatar, index) => (
                <Image
                    key={index}
                    source={{ uri: avatar || 'https://i.pravatar.cc/150' }}
                    style={[styles.avatar, { marginLeft: index > 0 ? -15 : 0 }]}
                />
            ))}
            {remainingCount > 0 && (
                <View style={[styles.avatar, styles.moreContainer, { marginLeft: -15 }]}>
                    <Text style={styles.moreText}>+{remainingCount}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'white',
    },
    moreContainer: {
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default AvatarGroup;
