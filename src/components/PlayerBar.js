import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');


const PlayerBar = ({ currentSong, isPlaying, onPlayPause, onSkipNext, onSkipPrevious, playbackProgress, playbackDuration, onSeek }) => {
    const navigation = useNavigation();

    if (!currentSong) {
        return null;
    }

    const handleBarPress = () => {
        navigation.navigate('FullPlayer', {
            currentSong: currentSong,
            isPlaying: isPlaying,
            onPlayPause: onPlayPause,
            onSkipNext: onSkipNext,
            onSkipPrevious: onSkipPrevious,
            onSeek: onSeek, 
            playbackProgress: playbackProgress, 
            playbackDuration: playbackDuration,
        });
    };

    const imageUrl = currentSong.album_image_url || 'https://placehold.co/60x60/000000/FFFFFF?text=No+Image';

    return (
        <TouchableOpacity style={styles.container} onPress={handleBarPress} activeOpacity={0.8}>
            <View style={[styles.progressBar, { width: `${playbackProgress * 100}%` }]} />

            <View style={styles.content}>
                <Image 
                    source={{ uri: imageUrl }}
                    style={styles.albumArt} 
                />
                <View style={styles.songInfo}>
                    <Text style={styles.songTitle} numberOfLines={1}>{currentSong.title}</Text>
                    <Text style={styles.songArtist} numberOfLines={1}>{currentSong.artist_name}</Text>
                </View>
                <View style={styles.controls}>
                    <TouchableOpacity onPress={onSkipPrevious} style={styles.controlButton}>
                        <Ionicons name="play-skip-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onPlayPause} style={styles.controlButton}>
                        <Ionicons name={isPlaying ? "pause" : "play"} size={30} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onSkipNext} style={styles.controlButton}>
                        <Ionicons name="play-skip-forward" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100, 
        width: '98%',
        height: 55,
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        paddingHorizontal: 15,
        paddingBottom: 5,
        alignSelf: 'center',
        borderRadius: 5,
        zIndex: 1000
    },
    progressBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: 3,
        backgroundColor: '#1DB0F6',
        borderRadius: 2,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    albumArt: {
        width: 50,
        height: 50,
        borderRadius: 5,
        marginRight: 10,
    },
    songInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    songTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    songArtist: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    controlButton: {
        padding: 10,
    },
});

export default PlayerBar;