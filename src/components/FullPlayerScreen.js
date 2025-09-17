import React, { useState, useEffect, use } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, SafeAreaView, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GLOBALS from '../../Globals';

const { width, height } = Dimensions.get('window');

const FullPlayerScreen = ({ route, navigation }) => {
    const { 
        currentSong, 
        isPlaying, 
        onPlayPause, 
        onSkipNext, 
        onSkipPrevious,
        onSeek, // Función para buscar una posición específica
        playbackProgress, // Progreso real de 0 a 1 (ej: 0.5 para el 50%)
        playbackDuration // Duración total en milisegundos
    } = route.params;

    const [showPlaylistsMenu, setShowPlaylistsMenu] = useState(false);
    const [playlists, setPlaylists] = useState([]);

    const fetchUserPlaylists = async () => {
        try {
            const response = await fetch(`${GLOBALS.url}/ToProcess`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    objectName: 'PlaylistBO',
                    methodName: 'getUserPlaylists',
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Fallo al obtener las playlists.');
            }

            const data = await response.json();
            if (data.sts) {
                setPlaylists(data.data);
            } else {
                console.error(data.msg || 'No se pudieron cargar las playlists.');
            }
        } catch (err) {
            console.error("Error fetching user playlists:", err);
        }
    };

    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = Math.floor(totalSeconds % 60);
        return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    // handleSeek llama a la prop onSeek de App.js para actualizar la posición en el reproductor de YouTube
    const handleSeek = (direction) => {
        if (!onSeek || !playbackDuration) return;

        const seekAmountMs = 15 * 1000; // Adelantar/Retroceder 15 segundos en milisegundos
        let newPositionMs;

        // Calcular el tiempo actual en milisegundos
        const currentPositionMs = playbackProgress * playbackDuration;

        if (direction === 'forward') {
            newPositionMs = Math.min(currentPositionMs + seekAmountMs, playbackDuration);
        } else {
            newPositionMs = Math.max(currentPositionMs - seekAmountMs, 0);
        }
        onSeek(newPositionMs / playbackDuration);
    };

    const handleAddToPlaylist = async (playlist) => {
        console.log(`Adding song "${currentSong.title}" to playlist "${playlist.name}"`);
        
        try {
            const response = await fetch(`${GLOBALS.url}/ToProcess`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    objectName: 'PlaylistBO',
                    methodName: 'addToPlaylist',
                    params: {
                        playlistId: playlist.id_playlist,
                        trackName: currentSong.title,
                        trackLink: currentSong.id,
                        trackCover: currentSong.album_image_url,
                        trackArtist: currentSong.artist_name
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Fallo al añadir a playlist.');
            }

            const data = await response.json();
            if (data.sts) {
                setPlaylists(data.data);
            } else {
                console.error(data.msg || 'No se pudo añadir a la playlist.');
            }
        } catch (err) {
            console.error("Error añadiendo cancion a la playlist:", err);
        }

        setShowPlaylistsMenu(false);
    };

    if (!currentSong) {
        return (
            <LinearGradient
                colors={['#4A90E2', '#003A6B']}
                style={styles.background}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <SafeAreaView style={styles.container}>
                    <TouchableOpacity style={styles.backButtonAbsolute} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-down" size={30} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>No hay canción seleccionada.</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    const currentPlaybackTime = playbackProgress * playbackDuration;

    useEffect(() => {
        fetchUserPlaylists();
    }, []);

    return (
        <LinearGradient
            colors={['#4A90E2', '#003A6B']}
            style={styles.background}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <SafeAreaView style={styles.container}>
                {/* Botón para minimizar/volver */}
                <TouchableOpacity style={styles.backButtonAbsolute} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-down" size={30} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Botón AddToPlaylist */}
                <TouchableOpacity 
                    style={styles.addToPlaylistButton} 
                    onPress={() => setShowPlaylistsMenu(true)}
                >
                    <Ionicons name="add-circle-outline" size={30} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.content}>
                    <Image 
                        source={{ uri: currentSong.album_image_url || 'https://placehold.co/300x300/000000/FFFFFF?text=No+Image' }} 
                        style={styles.albumArt} 
                    />

                    <View style={styles.songInfo}>
                        <Text style={styles.songTitle} numberOfLines={2}>{currentSong.title}</Text>
                        <Text style={styles.songArtist} numberOfLines={1}>{currentSong.artist_name}</Text>
                    </View>

                    {/* Barra de progreso */}
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBarFill, { width: `${playbackProgress * 100}%` }]} />
                    </View>
                    <View style={styles.timeInfo}>
                        {/* Muestra el tiempo actual y la duración total */}
                        <Text style={styles.timeText}>{formatTime(currentPlaybackTime)}</Text>
                        <Text style={styles.timeText}>{formatTime(playbackDuration)}</Text>
                    </View>

                    {/* Controles de reproducción */}
                    <View style={styles.controls}>
                        <TouchableOpacity onPress={onSkipPrevious} style={styles.controlButton}>
                            <Ionicons name="play-skip-back" size={40} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleSeek('backward')} style={styles.controlButton}>
                            <Ionicons name="play-back" size={30} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onPlayPause} style={styles.playPauseButton}>
                            <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={80} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleSeek('forward')} style={styles.controlButton}>
                            <Ionicons name="play-forward" size={30} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onSkipNext} style={styles.controlButton}>
                            <Ionicons name="play-skip-forward" size={40} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            {/* Mini-menú de Playlists */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showPlaylistsMenu}
                onRequestClose={() => setShowPlaylistsMenu(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPressOut={() => setShowPlaylistsMenu(false)}
                >
                    <View style={styles.playlistsMenuContainer}>
                        <Text style={styles.playlistsMenuTitle}>Añadir a playlist</Text>
                        <FlatList
                            data={playlists}
                            keyExtractor={(item) => item.id_playlist}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.playlistMenuItem} 
                                    onPress={() => handleAddToPlaylist(item)}
                                >
                                    <Text style={styles.playlistMenuItemText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.playlistSeparator} />}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: 'transparent',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 18,
    },
    backButtonAbsolute: {
        position: 'absolute',
        top: 40, 
        left: 20,
        zIndex: 10,
        padding: 10,
    },
    addToPlaylistButton: {
        position: 'absolute',
        top: 40, 
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '90%',
        paddingBottom: 20, 
    },
    albumArt: {
        width: width * 0.8, 
        height: width * 0.8, 
        borderRadius: 10,
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 15,
    },
    songInfo: {
        alignItems: 'center',
        marginBottom: 30,
        width: '100%',
    },
    songTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 5,
    },
    songArtist: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
    },
    progressBarContainer: {
        width: '100%',
        height: 5,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 5,
        marginBottom: 10,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#1DB0F6',
        borderRadius: 5,
    },
    timeInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 40,
    },
    timeText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
    },
    controlButton: {
        padding: 10,
    },
    playPauseButton: {
        padding: 10,
    },
    // Styles for the playlist modal and its contents
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    playlistsMenuContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 15,
        maxHeight: height * 0.5, // Limit height to prevent it from taking up the whole screen
    },
    playlistsMenuTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    playlistMenuItem: {
        paddingVertical: 15,
    },
    playlistMenuItemText: {
        fontSize: 18,
        color: '#555',
    },
    playlistSeparator: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 5,
    },
});

export default FullPlayerScreen;