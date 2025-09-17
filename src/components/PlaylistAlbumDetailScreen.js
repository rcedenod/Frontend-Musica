import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    Image, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert,
    Modal,
    TextInput,
    Pressable,
    Keyboard,
    ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GLOBALS from '../../Globals';

const PlaylistAlbumDetailScreen = ({ route, navigation, setCurrentSong, setIsPlaying }) => {
    const { type, id, name: initialName, refreshPlaylists } = route.params;
    const [details, setDetails] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditNameModal, setShowEditNameModal] = useState(false);
    const [editedName, setEditedName] = useState(initialName);

    // fetchData se convierte en una función local para ser llamada también después de añadir canciones
    const fetchData = async () => {
        setLoading(true);
        setError(null);
            if (type === 'album') {
                Alert.alert("Error", "La visualización de álbumes de Spotify ya no está disponible.");
                navigation.goBack();
                return;
            }

            else if(id === 'my_songs_playlist_id') {
                try {
                    const response = await fetch(`${GLOBALS.url}/ToProcess`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            objectName: 'TrackBO',
                            methodName: 'getMySongs',
                            params: {}
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.msg || 'Fallo al obtener mis canciones.');
                    }

                    const data = await response.json();
                    if (data.sts) {
                        console.log(data.data);
                        setTracks(data.data || []);
                        setDetails({
                            name: 'Mis canciones',
                            image: null, 
                            owner: null,
                            total_tracks: data.data.length,
                            type: 'playlist'
                        });
                        
                    } else {
                        throw new Error(data.msg || 'No se pudieron cargar los detalles de la playlist.');
                    }
                } catch (err) {
                    console.error("Error fetching details:", err);
                    setError(err.message || String(err));
                } finally {
                    setLoading(false);
                }
            }

            else {
                try {
const response = await fetch(`${GLOBALS.url}/ToProcess`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    objectName: 'PlaylistBO',
                    methodName: 'getPlaylistDetailsAndSongs',
                    params: { playlistId: id }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Fallo al obtener detalles de la playlist.');
            }

            const data = await response.json();
            if (data.sts) {
                console.log(data.data);
                setTracks(data.data || []);
                const playlist = data.data;
                setDetails({
                    name: playlist[0].playlist_name,
                    image: playlist[0].playlist_image_url || null, 
                    owner: playlist[0].owner_name || 'ti',
                    total_tracks: playlist.length,
                    type: 'playlist'
                });
                
            } else {
                throw new Error(data.msg || 'No se pudieron cargar los detalles de la playlist.');
            }
        } catch (err) {
            console.error("Error fetching details:", err);
            setError(err.message || String(err));
        } finally {
            setLoading(false);
        }
    }
    };

    useEffect(() => {
        fetchData();
    }, [type, id]);


    const handleEditPlaylistName = () => {
        setEditedName(details.name);
        setShowEditNameModal(true);
    };

    const handleConfirmEditName = async () => {
        Keyboard.dismiss();
        if (!editedName.trim()) {
            Alert.alert("Error", "El nombre no puede estar vacío.");
            return;
        }

        setShowEditNameModal(false);
        setLoading(true);

        try {
            const response = await fetch(`${GLOBALS.url}/ToProcess`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    objectName: 'PlaylistBO',
                    methodName: 'updatePlaylistName',
                    params: { playlistId: id, newName: editedName }
                })
            });

            const data = await response.json();
            if (data.sts) {
                Alert.alert("Éxito", "Nombre de playlist actualizado.");
                setDetails(prev => ({ ...prev, name: editedName }));
                if (refreshPlaylists) refreshPlaylists();
            } else {
                Alert.alert("Error", data.msg || "No se pudo actualizar el nombre.");
            }
        } catch (err) {
            console.error("Error updating playlist name:", err);
            Alert.alert("Error", "Ocurrió un error al actualizar el nombre.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePlaylist = () => {
        Alert.alert(
            "Eliminar Playlist",
            `¿Estás seguro de que quieres eliminar la playlist "${details?.name}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Eliminar", 
                    style: "destructive", 
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const response = await fetch(`${GLOBALS.url}/ToProcess`, {
                                method: 'POST',
                                credentials: 'include',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    objectName: 'PlaylistBO',
                                    methodName: 'deletePlaylist',
                                    params: { playlistId: id }
                                })
                            });

                            const data = await response.json();
                            if (data.sts) {
                                Alert.alert("Éxito", "Playlist eliminada correctamente.");
                                if (refreshPlaylists) refreshPlaylists(); 
                                navigation.goBack();
                            } else {
                                Alert.alert("Error", data.msg || "No se pudo eliminar la playlist.");
                            }
                        } catch (err) {
                            console.error("Error deleting playlist:", err);
                            Alert.alert("Error", "Ocurrió un error al eliminar la playlist.");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    // --- FUNCIÓN PARA REPRODUCIR UNA CANCIÓN DE LA PLAYLIST ---
    const handlePlaySong = (song) => {
        const songToPlay = {
            id: song.link, // ESTE ES EL ID QUE NECESITA YOUTUBEPLAYER
            title: song.track_name,
            artist_name: song.artist,
            album_image_url: song.cover, // Usamos 'album_image_url' para consistencia con useYouTube
            source: 'youtube', // Indicamos que la fuente es YouTube
        };

        console.log("PlaylistAlbumDetailScreen: SongToPlay (for YouTube): ", songToPlay);
        
        if (setCurrentSong && setIsPlaying) {
            setCurrentSong(songToPlay);
            setIsPlaying(true);
            console.log("Playlist song sent to App.js for playback.");
        } else {
            Alert.alert("Error de Reproducción", "No se pudo iniciar la reproducción. Asegúrate de que el reproductor esté configurado en App.js.");
            console.error("PlaylistAlbumDetailScreen: setCurrentSong o setIsPlaying no disponibles.");
        }
    };


    if (loading) {
        return (
        <LinearGradient
        colors={['#4A90E2', '#003A6B']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        >
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Cargando playlist...</Text>
            </View>
        </LinearGradient>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!details) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>No se encontraron detalles para la playlist.</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderTrack = ({ item }) => (
        <TouchableOpacity style={styles.trackItem} onPress={() => handlePlaySong(item)}>
            <Image 
                source={{ uri: item.cover || 'https://placehold.co/60x60/000000/FFFFFF?text=No+Image' }} 
                style={styles.trackImage} 
            />
            
            <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>{item.track_name}</Text>
                <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
            </View>
            <Ionicons name="ellipsis-vertical" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
    );

    return (
    <LinearGradient
        colors={['#4A90E2', '#003A6B']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
    >
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity style={styles.backButtonAbsolute} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <View style={styles.headerIcon}>
                        <Ionicons name="musical-notes-outline" size={120} color="#FFFFFF" />
                    </View>
                    
                    <Text style={styles.headerName}>{details.name}</Text>
                    <Text style={styles.headerOwner}>Playlist por {details.owner}</Text>
                    <Text style={styles.headerTracksCount}>{details.total_tracks} {details.total_tracks === 1 ? 'canción' : 'canciones'}</Text>

                    {/* Botones para gestión de playlists */}
                    <View style={styles.playlistActions}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleEditPlaylistName}>
                            <Ionicons name="pencil-outline" size={20} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>Editar Nombre</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.deleteActionButton]} onPress={handleDeletePlaylist}>
                            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>Eliminar Playlist</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <FlatList
                    data={tracks}
                    keyExtractor={(item) => item.id_track || Math.random().toString()} // Asegura usar id_song de tu DB
                    renderItem={renderTrack}
                    contentContainerStyle={styles.tracksListContent}
                    scrollEnabled={false} // Para que el ScrollView padre maneje el scroll
                />
            </ScrollView>

            {/* Modal para editar nombre de playlist */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showEditNameModal}
                onRequestClose={() => setShowEditNameModal(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowEditNameModal(false)}>
                    <Pressable style={styles.modalContent} onPress={() => Keyboard.dismiss()}>
                        <Text style={styles.modalTitle}>Editar Nombre</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Nuevo nombre de la playlist"
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            maxLength={16}
                            value={editedName}
                            onChangeText={setEditedName}
                            autoFocus={true}
                            onSubmitEditing={handleConfirmEditName}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalButton} onPress={() => setShowEditNameModal(false)}>
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleConfirmEditName}>
                                <Text style={styles.modalButtonText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    </LinearGradient>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        position: 'relative',
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    loadingText: {
        color: '#FFFFFF',
        marginTop: 10,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        padding: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
    },
    backButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    backButtonAbsolute: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 10,
        padding: 5,
    },
    scrollContent: {
        paddingBottom: 80,
    },
    header: {
        alignItems: 'center',
        padding: 20,
        paddingTop: 50, 
    },
    headerIcon: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 10,
    },
    headerName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 5,
    },
    headerOwner: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 5,
    },
    headerTracksCount: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 20,
    },
    playlistActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
        gap: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 12,

        minWidth: 120,
        justifyContent: 'center',
    },
    deleteActionButton: {
        backgroundColor: 'rgba(255,0,0,0.3)',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    tracksListContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        marginBottom: 10,
        padding: 10,
    },
    trackImagePlaceholder: {
        width: 60, 
        height: 60, 
        borderRadius: 5,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)', 
    },
    trackImage: {
        width: 60,
        height: 60,
        borderRadius: 5,
        marginRight: 10,
    },
    trackInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    trackTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    trackArtist: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
        backgroundColor: 'rgba(40, 40, 40, 0.9)',
        borderRadius: 15,
        padding: 25,
        width: '80%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 20,
    },
    modalInput: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    modalButton: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        minWidth: 100,
        alignItems: 'center',
    },
    modalButtonPrimary: {
        backgroundColor: '#1DB0F6',
        marginLeft: 10,
    },
    modalButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PlaylistAlbumDetailScreen;