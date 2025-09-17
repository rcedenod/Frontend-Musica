import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    FlatList, 
    Image, 
    TouchableOpacity, 
    ActivityIndicator,
    Keyboard,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useYouTube } from '../../hooks/useYoutube';


const SearchScreen = ({ setCurrentSong, setIsPlaying }) => {
    const [searchText, setSearchText] = useState('');
    const [searchType, setSearchType] = useState('video'); 
    const [results, setResults] = useState([]);
    
    const { searchVideos, isLoading, error } = useYouTube();

    const handleSearch = async () => {
        Keyboard.dismiss();

        if (!searchText.trim()) {
            setResults([]);
            return;
        }

        setResults([]); // Limpiar resultados anteriores
        
        try {
            let youtubeResults = [];
            if (searchType === 'video') {
                // Buscamos videos musicales
                youtubeResults = await searchVideos(`${searchText} music`); 
            } else if (searchType === 'channel') {
                // aqui se va a buscar canciones subidas por usuarios
                youtubeResults = await searchVideos(`${searchText} music channel`); 
            }
            
            setResults(youtubeResults);

        } catch (err) {
            console.error("Error al buscar en YouTube (SearchScreen):", err);
            Alert.alert("Error de Búsqueda", err.message || "Ocurrió un error al buscar en YouTube. Intenta de nuevo.");
        }
    };

    // Función para manejar la reproducción de una canción
    const handlePlaySong = (song) => {
        console.log("SearchScreen: Seleccionada canción para reproducir:", song);
        if (setCurrentSong && setIsPlaying) {
            setCurrentSong(song);
            setIsPlaying(true);
        } else {
            Alert.alert("Error de Reproducción", "No se pudo iniciar la reproducción. Asegúrate de que el reproductor esté configurado.");
            console.error("SearchScreen: setCurrentSong o setIsPlaying no disponibles.");
        }
    };

    // Renderiza un elemento de la lista de resultados
    const renderItem = ({ item }) => {
        const imageUrl = item.album_image_url || 'https://placehold.co/100x100/000000/FFFFFF?text=No+Image';
        const title = item.title;
        const subtitle = item.artist_name;

        return (
            <TouchableOpacity style={styles.resultItem} onPress={() => handlePlaySong(item)}>
                <Image source={{ uri: imageUrl }} style={styles.resultImage} />
                <View style={styles.resultInfo}>
                    <Text style={styles.resultTitle} numberOfLines={1}>{title}</Text>
                    <Text style={styles.resultSubtitle} numberOfLines={1}>{subtitle}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Buscar</Text>

            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="¿Qué quieres escuchar en YouTube?"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={searchText}
                    onChangeText={setSearchText}
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
                    <Ionicons name="search" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                <TouchableOpacity 
                    style={[styles.filterButton, searchType === 'video' && styles.filterButtonActive]} 
                    onPress={() => setSearchType('video')}
                >
                    <Text style={styles.filterButtonText}>Videos Musicales</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.filterButton, searchType === 'channel' && styles.filterButtonActive]} 
                    onPress={() => setSearchType('channel')}
                >
                    <Text style={styles.filterButtonText}>Canales</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.statusContainer}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.statusText}>Buscando en YouTube...</Text>
                </View>
            ) : error ? (
                <View style={styles.statusContainer}>
                    <Text style={styles.errorText}>Error: {error}</Text>
                    <Text style={styles.errorText}>Verifica tu conexión y la clave de API de YouTube.</Text>
                </View>
            ) : results.length === 0 && searchText.length > 0 ? (
                <View style={styles.statusContainer}>
                    <Text style={styles.statusText}>No se encontraron resultados para "{searchText}".</Text>
                    <Text style={styles.statusText}>Intenta con otra búsqueda.</Text>
                </View>
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    style={styles.resultsList}
                    contentContainerStyle={styles.resultsListContent}
                />
            )}
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
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 15,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        paddingHorizontal: 10,
    },
    searchInput: {
        flex: 1,
        height: 45,
        color: '#FFFFFF',
        fontSize: 16,
    },
    searchButton: {
        padding: 8,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginHorizontal: 20,
        marginBottom: 20,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    filterButtonActive: {
        backgroundColor: '#1DB0F6',
    },
    filterButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
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
    resultsList: {
        flex: 1,
        paddingHorizontal: 20,
    },
    resultsListContent: {
        paddingBottom: 80,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        marginBottom: 10,
        padding: 10,
    },
    resultImage: {
        width: 60,
        height: 60,
        borderRadius: 5,
        marginRight: 10,
    },
    resultInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    resultTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultSubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
    },
    addButton: {
        marginLeft: 10,
    }
});

export default SearchScreen;