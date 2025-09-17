import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useAuth } from './hooks/useAuth';
import Landing from './src/components/Landing';
import Login from './src/components/Login';
import Register from './src/components/Register';
import Dashboard from './src/components/Dashboard';
import ForgotPassword from './src/components/ForgotPassword';
import ResetPassword from './src/components/ResetPassword';
import Profile from './src/components/Profile';
import PlaylistAlbumDetailScreen from './src/components/PlaylistAlbumDetailScreen';
import FullPlayerScreen from './src/components/FullPlayerScreen';
import PlayerBar from './src/components/PlayerBar';
import UploadSongScreen from './src/components/UploadSongScreen';

const Stack = createNativeStackNavigator({});

export default function App() {
  const { isAuthenticated, isAuthLoading, login, logout } = useAuth();
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  // --- NUEVOS ESTADOS PARA LA LISTA DE REPRODUCCIÓN ---
  const [playlist, setPlaylist] = useState([
    { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', source: 'youtube' },
    { id: 'kJQP7kiw5Fk', title: 'Despacito', source: 'youtube' },
    { id: 'RgKAFK5djSk', title: 'Gangnam Style', source: 'youtube' },
  ]);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);

  const youtubePlayerRef = useRef(null);

  useEffect(() => {
    console.log("App.js (YouTube Version) is running.");
  }, []);

  useEffect(() => {
    if (playlist.length > 0 && currentSongIndex >= 0 && currentSongIndex < playlist.length) {
      setCurrentSong(playlist[currentSongIndex]);
      setIsPlaying(true); // Asumimos que queremos reproducir automáticamente al cambiar de canción
      setPlaybackProgress(0); // Reiniciar el progreso al cambiar de canción
      setPlaybackDuration(0); // Reiniciar la duración
    } else {
      setCurrentSong(null);
      setIsPlaying(false);
    }
  }, [currentSongIndex, playlist]);


  const onYouTubeStateChange = useCallback(async (state) => {
    if (!youtubePlayerRef.current) {
      console.log("onYouTubeStateChange: youtubePlayerRef.current es null.");
      return;
    }

    console.log("YouTube Player State Changed To:", state);

    if (state === 'playing') {
      console.log("onYouTubeStateChange: Estado del reproductor es 'playing'. Estableciendo isPlaying a true.");
      setIsPlaying(true);
      try {
        const duration = await youtubePlayerRef.current.getDuration();
        setPlaybackDuration(duration * 1000);
      } catch (error) {
        console.warn("Error getting duration from YouTube player:", error);
      }
    } else if (state === 'paused') {
      console.log("onYouTubeStateChange: Estado del reproductor es 'paused'. Estableciendo isPlaying a false.");
      setIsPlaying(false);
    } else if (state === 'ended') {
      console.log("onYouTubeStateChange: Estado del reproductor es 'ended'.");
      setIsPlaying(false);
      setPlaybackProgress(0);
      handleSkipNext();
    } else if (state === 'buffering') {
      console.log("YouTube Player: Buffering...");
    } else if (state === 'cued') {
      console.log("YouTube Player: Video cued, ready to play.");
    } else if (state === 'unstarted') {
      console.log("YouTube Player: Video unstarted.");
    }
  }, [handleSkipNext]);

  useEffect(() => {
    let interval;
    if (isPlaying && youtubePlayerRef.current) {
      interval = setInterval(async () => {
        try {
          const currentTime = await youtubePlayerRef.current.getCurrentTime();
          const duration = await youtubePlayerRef.current.getDuration();
          if (duration > 0) {
            setPlaybackProgress(currentTime / duration);
          }
        } catch (error) {
          console.warn("Error getting current time or duration:", error);
          clearInterval(interval);
        }
      }, 500);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSong]);

  const handlePlayPause = useCallback(async () => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleSkipNext = useCallback(async () => {
    if (playlist.length === 0) {
      Alert.alert("No hay canciones en la lista.");
      return;
    }

    const nextIndex = (currentSongIndex + 1) % playlist.length;
    console.log(`Saltando a la siguiente canción. Nuevo índice: ${nextIndex}`);
    setCurrentSongIndex(nextIndex); // Agrega esta línea para actualizar el índice
  }, [currentSongIndex, playlist]);


  const handleSkipPrevious = useCallback(async () => {
    if (playlist.length === 0) {
      Alert.alert("No hay canciones en la lista.");
      return;
    }

    const prevIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    setCurrentSongIndex(prevIndex);
    console.log(`Saltando a la canción anterior. Nuevo índice: ${prevIndex}`);
  }, [currentSongIndex, playlist]);


  const handleRestartSong = useCallback(async () => {
    if (!currentSong || !youtubePlayerRef.current) {
      Alert.alert("No hay canción reproduciéndose para reiniciar.");
      return;
    }
    console.log("Reiniciando canción actual.");
    try {
      await youtubePlayerRef.current.seekTo(0, true);
      setIsPlaying(true);
      setPlaybackProgress(0);
    } catch (error) {
      console.error("Error al reiniciar la canción:", error);
      Alert.alert("Error", "No se pudo reiniciar la canción.");
    }
  }, [currentSong]);


  const handleSeek = useCallback(async (newProgress) => {
    if (!currentSong || !youtubePlayerRef.current || playbackDuration === 0) return;
    console.log("App.js: handleSeek called. newProgress:", newProgress);

    const newPosition = (newProgress * playbackDuration) / 1000;
    try {
      await youtubePlayerRef.current.seekTo(newPosition, true);
    } catch (error) {
      console.error("Error seeking video:", error);
    }
  }, [currentSong, playbackDuration]);

  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#4A90E2', '#003A6B']}
      style={styles.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <NavigationContainer style={{ backgroundColor: 'transparent' }}>
        {!isAuthenticated ? (
          <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
            <Stack.Screen name="Landing" component={Landing} />
            <Stack.Screen name="Login">
              {props => <Login {...props} login={login} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen name="ResetPassword" component={ResetPassword} />
          </Stack.Navigator>
        ) : (
          <>
            <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
              <Stack.Screen name="Dashboard">
                {props => (
                  <Dashboard
                    {...props}
                    logout={logout}
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                    playbackProgress={playbackProgress}
                    playbackDuration={playbackDuration}
                    setCurrentSong={setCurrentSong}
                    setIsPlaying={setIsPlaying}
                    onPlayPause={handlePlayPause}
                    onSkipNext={handleSkipNext}
                    onSkipPrevious={handleSkipPrevious}
                    onRestartSong={handleRestartSong}
                    onSeek={handleSeek}
                    playlist={playlist}
                    currentSongIndex={currentSongIndex}
                    setCurrentSongIndex={setCurrentSongIndex}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Profile">
                {props => <Profile {...props} logout={logout} />}
              </Stack.Screen>
              <Stack.Screen name="Landing" component={Landing} />
              <Stack.Screen name="PlaylistAlbumDetail">
                {props => (
                  <PlaylistAlbumDetailScreen
                    {...props}
                    setCurrentSong={setCurrentSong}
                    setIsPlaying={setIsPlaying}
                    setPlaylist={setPlaylist}
                    setCurrentSongIndex={setCurrentSongIndex}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="FullPlayer">
                {props => (
                  <FullPlayerScreen
                    {...props}
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
                    onSkipNext={handleSkipNext}
                    onSkipPrevious={handleSkipPrevious}
                    onRestartSong={handleRestartSong}
                    onSeek={handleSeek}
                    playbackProgress={playbackProgress}
                    playbackDuration={playbackDuration}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="UploadSongScreen">
                {props => (
                  <UploadSongScreen
                    {...props}
                    setCurrentSong={setCurrentSong}
                    setIsPlaying={setIsPlaying}
                  />
                )}
              </Stack.Screen>
            </Stack.Navigator>

            {/* Reproductor de YouTube oculto */}
            {currentSong && currentSong.source === 'youtube' && (
              <View style={styles.hiddenYoutubePlayerContainer}>
                {console.log("YoutubePlayer render con isPlaying:", isPlaying, " y videoId:", currentSong.id)}
                <YoutubePlayer
                  play={isPlaying}
                  ref={youtubePlayerRef}
                  height={1}
                  width={1}
                  videoId={currentSong.id}
                  onChangeState={onYouTubeStateChange}
                  initialPlayerParams={{ controls: false, showClosedCaptions: false }}
                />
              </View>
            )}
          </>
        )}
      </NavigationContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    flex: 1,
  },
  hiddenYoutubePlayerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 1,
    height: 1,
    overflow: 'hidden',
    zIndex: -1,
    opacity: 0,
  },
});