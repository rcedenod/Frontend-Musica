import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, Pressable, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from 'react-native-paper';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Profile from './Profile.js';
import GLOBALS from '../../Globals';
import SearchScreen from './SearchScreen.js';
import MyPlaylistsScreen from './MyPlaylistsScreen.js';
import HomeScreen from './HomeScreen.js';
import PlayerBar from './PlayerBar.js';

const Tab = createBottomTabNavigator();

const PLAYER_BAR_HEIGHT = 70;
const TAB_BAR_HEIGHT = 60; 

const Dashboard = ({ navigation, logout, currentSong, isPlaying, setCurrentSong, setIsPlaying, onPlayPause, onSkipNext, onSkipPrevious, onSeek, playbackProgress, playbackDuration }) => {
  const [visibleProfile, setVisibleProfile] = useState(false);
  const [userData, setUserData] = useState({
      initials: ''
  });

  const getUserById = async () => {
    try {
      const resUser = await fetch(`${GLOBALS.url}/ToProcess`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectName: 'UserBO',
          methodName: 'getUserById',
          params: {}
        })
      });
      const responseUser = await resUser.json();
      if (responseUser.sts) {
        setUserData({
          initials: responseUser.data.name[0] + responseUser.data.last_name[0]
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    getUserById();
  }, []);

  return (
    <LinearGradient
      colors={['#4A90E2', '#003A6B']}
      style={styles.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
        {/* Renderizar el PlayerBar aquí, condicionalmente */}
        {currentSong && (
          <PlayerBar
            currentSong={currentSong}
            isPlaying={isPlaying}
            playbackProgress={playbackProgress}
            playbackDuration={playbackDuration}
          />
        )}
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.navbar}>
          <Pressable onPress={() => setVisibleProfile(true)}>
            <Avatar.Text size={42} label={userData.initials} labelStyle={styles.labelStyle} style={styles.avatar} />
          </Pressable>
        </View>
        
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#FFFFFF',
            tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
            tabBarStyle: {
              backgroundColor: 'rgba(23, 43, 75, 0.8)',
              borderTopWidth: 0,
              paddingBottom: currentSong ? PLAYER_BAR_HEIGHT : 0, 
            },
          }}
          >
          <Tab.Screen
            name="Home"
            options={{
              tabBarLabel: 'Home',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" color={color} size={size} />
              ),
              sceneStyle: { backgroundColor: 'transparent' }
            }}
          >
            {() => <HomeScreen setCurrentSong={setCurrentSong} setIsPlaying={setIsPlaying} />}
          </Tab.Screen>
          <Tab.Screen
            name="Search"
            options={{
              tabBarLabel: 'Search',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="search" color={color} size={size} />
              ),
              sceneStyle: { backgroundColor: 'transparent' }
            }}
          >
            {() => <SearchScreen setCurrentSong={setCurrentSong} setIsPlaying={setIsPlaying} />}
          </Tab.Screen>
          <Tab.Screen
            name="MyPlaylists"
            options={{
              tabBarLabel: 'Playlists',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="albums" color={color} size={size} />
              ),
              sceneStyle: { backgroundColor: 'transparent' }
            }}
          >
            {() => <MyPlaylistsScreen navigation={navigation} setCurrentSong={setCurrentSong} setIsPlaying={setIsPlaying} />}
          </Tab.Screen>
        </Tab.Navigator>

        <Profile
            navigation={navigation}
            visibleProfile={visibleProfile}
            setVisibleProfile={setVisibleProfile}
            logout={logout}
        />

      </SafeAreaView>
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
  },
  navbar: {
    height: 60,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 30
  },
  navTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  labelStyle: {
    fontSize: 14,
  },
  tabContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  footer: {
    height: 50,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  navigator: {
    backgroundColor: 'transparent'
  }
});

export default Dashboard;