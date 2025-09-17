import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text,
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert,
    Modal,
    Pressable,
    TextInput,
    Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GLOBALS from '../../Globals'; 
import { useAuth } from '../../hooks/useAuth';

const MyPlaylistsScreen = ({ navigation }) => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const { isAuthenticated, isAuthLoading, userSession } = useAuth();

    const userProfileId = userSession?.profile; 

    useEffect(() => {
      if (!isAuthLoading && isAuthenticated) {
          fetchUserPlaylists();
      }
    }, [isAuthLoading, isAuthenticated]);

    const fetchUserPlaylists = async () => {
        setLoading(true);
        setError(null);
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
                setError(data.msg || 'No se pudieron cargar las playlists.');
            }
        } catch (err) {
            console.error("Error fetching user playlists:", err);
            setError(err.message || String(err));
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlaylist = () => {
        setShowCreatePlaylistModal(true);
    };

    const handleConfirmCreatePlaylist = async () => {
        Keyboard.dismiss();

        if (!newPlaylistName.trim()) {
            Alert.alert("Error", "El nombre de la playlist no puede estar vacío.");
            return;
        }

        setShowCreatePlaylistModal(false);
        setLoading(true);
        
        try {
            const response = await fetch(`${GLOBALS.url}/ToProcess`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    objectName: 'PlaylistBO',
                    methodName: 'createPlaylist',
                    params: { 
                        name: newPlaylistName
                    } 
                })
            });

            const data = await response.json();

            if (data.sts) {
                Alert.alert("Éxito", `Playlist "${newPlaylistName}" creada.`);
                setNewPlaylistName('');
                fetchUserPlaylists(); // Recargar la lista de playlists
            } else {
                Alert.alert("Error", data.msg || "No se pudo crear la playlist.");
            }
        } catch (err) {
            console.error("Error creating playlist:", err);
            Alert.alert("Error", "Ocurrió un error al crear la playlist.");
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSong = () => {
        navigation.navigate('UploadSongScreen');
    };

    // --- FUNCIÓN PARA NAVEGAR A LA PANTALLA DE DETALLE DE PLAYLIST ---
    const handleViewPlaylist = (playlistId, playlistName) => {
        navigation.navigate('PlaylistAlbumDetail', { 
            type: 'playlist', 
            id: playlistId, 
            name: playlistName,
            refreshPlaylists: fetchUserPlaylists
        });
    };

    const renderPlaylist = ({ item }) => (
        <TouchableOpacity 
            style={styles.playlistItem} 
            onPress={() => handleViewPlaylist(item.id_playlist, item.name)}
        >
            <Ionicons name="musical-notes-outline" size={40} color="#FFFFFF" style={styles.playlistIcon} />
            <View style={styles.playlistInfo}>
                <Text style={styles.playlistName} numberOfLines={1}>{item.name}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
    );

    if (isAuthLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.statusContainer}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.statusText}>Verificando sesión...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Mis Playlists</Text>

            <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.actionButton, styles.createPlaylistButton]} onPress={handleCreatePlaylist}>
                <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Crear playlist</Text>
            </TouchableOpacity>
            {userProfileId === 2 && (
                <TouchableOpacity style={styles.actionButton} onPress={handleUploadSong}>
                <Ionicons name="cloud-upload-outline" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Subir canción</Text>
                </TouchableOpacity>
            )}
            </View>

            <TouchableOpacity 
                style={[styles.playlistItem, {width: '90%', alignSelf: 'center', marginBottom: 20}]}
                onPress={() => handleViewPlaylist('favorites_playlist_id', 'Favoritas')} 
            >
              <Ionicons name="star-outline" size={40} color="gold" style={styles.playlistIcon} />
              <View style={styles.playlistInfo}>
                  <Text style={styles.playlistName} numberOfLines={1}>Favoritas</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>

            {userProfileId === 2 && ( 
                <TouchableOpacity 
                    style={[styles.playlistItem, {width: '90%', alignSelf: 'center', marginBottom: 20}]}
                    onPress={() => handleViewPlaylist('my_songs_playlist_id', 'Mis canciones')}
                >
                    <Ionicons name="folder-outline" size={40} color="gold" style={styles.playlistIcon} />
                    <View style={styles.playlistInfo}>
                        <Text style={styles.playlistName} numberOfLines={1}>Mis canciones</Text>
    
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
            )}

            {loading ? (
                <View style={styles.statusContainer}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.statusText}>Cargando tus playlists...</Text>
                </View>
            ) : error ? (
                <View style={styles.statusContainer}>
                    <Text style={styles.errorText}>Error: {error}</Text> 
                    <Text style={styles.errorText}>No se pudieron cargar tus playlists.</Text>
                </View>
            ) : playlists.length === 0 ? (
                <View style={styles.statusContainer}>
                    <Text style={styles.statusText}>Aún no tienes playlists. ¡Crea una!</Text>
                </View>
            ) : (
                <FlatList
                    data={playlists}
                    keyExtractor={(item) => item.id_playlist ? item.id_playlist.toString() : Math.random().toString()}
                    renderItem={renderPlaylist}
                    style={styles.playlistsList}
                    contentContainerStyle={styles.playlistsListContent}
                />
            )}

            <Modal
                animationType="fade"
                transparent={true}
                visible={showCreatePlaylistModal}
                onRequestClose={() => setShowCreatePlaylistModal(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowCreatePlaylistModal(false)}>
                    <Pressable style={styles.modalContent} onPress={() => Keyboard.dismiss()}>
                        <Text style={styles.modalTitle}>Crear Nueva Playlist</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Nombre de la playlist"
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            maxLength={16}
                            value={newPlaylistName}
                            onChangeText={setNewPlaylistName}
                            autoFocus={true}
                            onSubmitEditing={handleConfirmCreatePlaylist}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalButton} onPress={() => setShowCreatePlaylistModal(false)}>
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleConfirmCreatePlaylist}>
                                <Text style={styles.modalButtonText}>Crear</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingTop: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginLeft: 20,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginBottom: 20,
    },
    actionButton: {
        flex: 1, 
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.21)',
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 10, 
        justifyContent: 'center',
    },
    createPlaylistButton: {
        marginRight: 10, 
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16, 
        fontWeight: 'bold',
        marginLeft: 8, 
        textAlign: 'center',
    },
    statusContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
    playlistsList: {
        flex: 1,
        paddingHorizontal: 20,
    },
    playlistsListContent: {
        paddingBottom: 80,
    },
    playlistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.21)',
        borderRadius: 8,
        marginBottom: 10,
        padding: 15,
    },
    playlistIcon: {
        marginRight: 15,
    },
    playlistInfo: {
        flex: 1,
    },
    playlistName: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    playlistCount: {
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
        backgroundColor: 'rgba(40, 40, 40, 1)',
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

export default MyPlaylistsScreen;
