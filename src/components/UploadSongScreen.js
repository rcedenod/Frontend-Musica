import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { createClient } from '@supabase/supabase-js'; // Importar el cliente de Supabase
import GLOBALS from '../../Globals';

// --- CONFIGURACIÓN DE SUPABASE ---
// Reemplaza con tus credenciales de Supabase
const supabaseUrl = 'https://eziacxiwvrzpgkcvxocs.supabase.co'; // Ejemplo: 'https://xyzcompany.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6aWFjeGl3dnJ6cGdrY3Z4b2NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTMxNzYsImV4cCI6MjA2ODY2OTE3Nn0.UrTNBL-Fx5vgO6OzlFbx-GLesH32IRzJPtXrKYmx-pM'; // Ejemplo: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const UploadSongScreen = ({ navigation }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [songTitle, setSongTitle] = useState('');
    const [artistName, setArtistName] = useState('');

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'audio/*', // Solo archivos de audio
                copyToCacheDirectory: true,
            });

            if (result.canceled === false) {
                console.log("Archivo seleccionado:", result.assets[0]);
                setSelectedFile(result.assets[0]);
                setSongTitle(result.assets[0].name.split('.').slice(0, -1).join('.')); // Pre-rellenar título
            } else {
                console.log("Selección de archivo cancelada.");
            }
        } catch (err) {
            console.error("Error al seleccionar el documento:", err);
            Alert.alert("Error", "No se pudo seleccionar el archivo de audio.");
        }
    };

    const uploadFile = async () => {
        if (!selectedFile) {
            Alert.alert("Error", "Por favor, selecciona un archivo de audio primero.");
            return;
        }
        if (!songTitle.trim() || !artistName.trim()) {
            Alert.alert("Error", "Por favor, ingresa el título de la canción y el nombre del artista.");
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const fileExtension = selectedFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
            const filePath = `songs/${fileName}`; // Ruta dentro del bucket de Supabase

            // Leer el archivo como un ArrayBuffer
            const response = await fetch(selectedFile.uri);
            const blob = await response.blob();

            const { data, error } = await supabase.storage
                .from('music') // Reemplaza 'music-bucket' con el nombre de tu bucket de Supabase Storage
                .upload(filePath, blob, {
                    cacheControl: '3600',
                    upsert: false,
                    // Puedes añadir un listener de progreso si lo soporta la versión de Supabase
                    // onUploadProgress: (event) => {
                    //     const progress = (event.loaded / event.total) * 100;
                    //     setUploadProgress(progress);
                    // }
                });

            if (error) {
                throw error;
            }

            // Obtener la URL pública del archivo subido
            const { data: publicUrlData } = supabase.storage
                .from('music')
                .getPublicUrl(filePath);

            const publicUrl = publicUrlData.publicUrl;

            console.log("URL pública de la canción:", publicUrl);
        
            try {
                const response = await fetch(`${GLOBALS.url}/ToProcess`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        objectName: 'TrackBO',
                        methodName: 'createTrack',
                        params: { 
                            name: songTitle,
                            artist: artistName,
                            link: publicUrl
                        } 
                    })
                });

                const data = await response.json();

                if (data.sts) {
                    Alert.alert("Éxito", `Cancion creada.`);
                } else {
                    Alert.alert("Error", data.msg || "No se pudo crear la CANCION.");
                }
            } catch (err) {
                console.error("Error creating cancion:", err);
                Alert.alert("Error", "Ocurrió un error al crear la cancion.");
            }

            setSelectedFile(null);
            setSongTitle('');
            setArtistName('');
            setUploadProgress(0);

        } catch (error) {
            console.error("Error al subir la canción:", error);
            Alert.alert("Error de Subida", `No se pudo subir la canción: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#4A90E2', '#003A6B']}
            style={styles.background}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <SafeAreaView style={styles.container}>
                <TouchableOpacity style={styles.backButtonAbsolute} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
                </TouchableOpacity>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.headerTitle}>Subir Nueva Canción</Text>

                    <TouchableOpacity style={styles.pickFileButton} onPress={pickDocument} disabled={uploading}>
                        <Ionicons name="folder-open-outline" size={24} color="#FFFFFF" />
                        <Text style={styles.pickFileButtonText}>
                            {selectedFile ? selectedFile.name : 'Seleccionar archivo de audio'}
                        </Text>
                    </TouchableOpacity>

                    {selectedFile && (
                        <View style={styles.fileDetails}>
                            <Text style={styles.fileDetailText}>Nombre: {selectedFile.name}</Text>
                            <Text style={styles.fileDetailText}>Tamaño: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</Text>
                        </View>
                    )}

                    <TextInput
                        style={styles.input}
                        placeholder="Título de la canción"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={songTitle}
                        onChangeText={setSongTitle}
                        editable={!uploading}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre del artista"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={artistName}
                        onChangeText={setArtistName}
                        editable={!uploading}
                    />

                    <TouchableOpacity 
                        style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]} 
                        onPress={uploadFile} 
                        disabled={uploading || !selectedFile || !songTitle.trim() || !artistName.trim()}
                    >
                        {uploading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Ionicons name="cloud-upload-outline" size={24} color="#FFFFFF" />
                        )}
                        <Text style={styles.uploadButtonText}>
                            {uploading ? `Subiendo... ${uploadProgress.toFixed(0)}%` : 'Subir Canción'}
                        </Text>
                    </TouchableOpacity>

                    {uploading && uploadProgress > 0 && (
                        <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    backButtonAbsolute: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 10,
        padding: 5,
    },
    scrollContent: {
        paddingTop: 80,
        paddingHorizontal: 20,
        alignItems: 'center',
        paddingBottom: 40,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 30,
        textAlign: 'center',
    },
    pickFileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 20,
        width: '100%',
        justifyContent: 'center',
    },
    pickFileButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    fileDetails: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
    },
    fileDetailText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginBottom: 5,
    },
    input: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1DB0F6',
        borderRadius: 25,
        paddingVertical: 15,
        paddingHorizontal: 30,
        marginTop: 20,
        justifyContent: 'center',
        width: '100%',
    },
    uploadButtonDisabled: {
        opacity: 0.6,
    },
    uploadButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    progressBarContainer: {
        width: '100%',
        height: 5,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 5,
        marginTop: 20,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#1DB0F6',
        borderRadius: 5,
    },
});

export default UploadSongScreen;
