import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    Dimensions,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useYouTube } from '../../hooks/useYoutube';

const { width } = Dimensions.get('window');

const HomeScreen = ({ setCurrentSong, setIsPlaying }) => { 
    const navigation = useNavigation();
    
    // Usamos el hook de YouTube para las búsquedas
    const { searchVideos, isLoading: isYouTubeLoading, error: youTubeError } = useYouTube();

    const [popularMusicVideos, setPopularMusicVideos] = useState([]);
    const [trendingMusicVideos, setTrendingMusicVideos] = useState([]);
    const [loadingPopular, setLoadingPopular] = useState(true);
    const [loadingTrending, setLoadingTrending] = useState(true);
    const [error, setError] = useState(null);

    const fetchPopularMusicVideos = async () => {
        setLoadingPopular(true);
        setError(null);
        try {
            const videos = await searchVideos('popular music videos');
            setPopularMusicVideos(videos);
        } catch (err) {
            console.error("Error al obtener videos populares:", err);
            setError(err.message || String(err));
        } finally {
            setLoadingPopular(false);
        }
    };

    const fetchTrendingMusicVideos = async () => {
        setLoadingTrending(true);
        setError(null);
        try {
            const videos = await searchVideos('trending music');
            setTrendingMusicVideos(videos);
        } catch (err) {
            console.error("Error al obtener videos en tendencia:", err);
            setError(err.message || String(err));
        } finally {
            setLoadingTrending(false);
        }
    };


    useEffect(() => {
        fetchPopularMusicVideos();
        fetchTrendingMusicVideos();
    }, []);

    // Unificado el estado de carga y error
    const isLoading = loadingPopular || loadingTrending;
    const displayError = youTubeError || error;

    // Función para manejar la reproducción de una canción
    const handlePlaySong = (song) => {
        console.log("HomeScreen: Seleccionada canción para reproducir:", song);
        if (setCurrentSong && setIsPlaying) {
            setCurrentSong(song);
            setIsPlaying(true);
        } else {
            Alert.alert("Error de Reproducción", "No se pudo iniciar la reproducción. Asegúrate de que el reproductor esté configurado.");
            console.error("HomeScreen: setCurrentSong o setIsPlaying no disponibles.");
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Cargando contenido de YouTube...</Text>
            </View>
        );
    }

    if (displayError) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: {displayError}</Text>
                <Text style={styles.errorText}>Verifica tu conexión y la clave de API de YouTube.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.greeting}>¿Qué escuchamos hoy?</Text>

            <Text style={styles.sectionTitle}>Musica Mas Popular</Text>
            {loadingPopular ? (
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginLeft: 20 }} />
            ) : (
                <FlatList
                    data={popularMusicVideos}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.albumItem} 
                            onPress={() => handlePlaySong(item)}
                        >
                            <Image
                                source={{ uri: item.album_image_url || 'https://placehold.co/150x150/000000/FFFFFF?text=No+Image' }}
                                style={styles.albumImage}
                            />
                            <Text style={styles.albumName} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.albumArtist} numberOfLines={1}>{item.artist_name}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}

            <Text style={styles.sectionTitle}>Videos Musicales en Tendencia</Text>
            {loadingTrending ? (
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginLeft: 20 }} />
            ) : (
                <FlatList
                    data={trendingMusicVideos}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id + '-trending'} // Asegurar clave única
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.albumItem} 
                            onPress={() => handlePlaySong(item)} // Llama a handlePlaySong
                        >
                            <Image
                                source={{ uri: item.album_image_url || 'https://placehold.co/150x150/000000/FFFFFF?text=No+Image' }}
                                style={styles.albumImage}
                            />
                            <Text style={styles.albumName} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.albumArtist} numberOfLines={1}>{item.artist_name}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingTop: 20,
    },
    contentContainer: {
        paddingBottom: 80,
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
        paddingHorizontal: 20,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 20,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginLeft: 10,
        marginTop: 20,
        marginBottom: 15,
    },
    albumItem: {
        width: 150,
        marginRight: 15,
        alignItems: 'center',
        marginLeft: 5,
    },
    albumImage: {
        width: 140,
        height: 140,
        borderRadius: 8,
        marginBottom: 8,
    },
    albumName: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        paddingHorizontal: 5,
    },
    albumArtist: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        textAlign: 'center',
        paddingHorizontal: 5,
    },
    categoryItem: {
        width: 100,
        marginRight: 15,
        alignItems: 'center',
        marginLeft: 5,
    },
    categoryImage: {
        width: 90,
        height: 90,
        borderRadius: 8,
        marginBottom: 8,
    },
    categoryName: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
        paddingHorizontal: 5,
    },
});

export default HomeScreen;