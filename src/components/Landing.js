import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CommonActions } from '@react-navigation/native';
import GLOBALS from '../../Globals';

const { width } = Dimensions.get('window');

const Landing = ({ navigation }) => {
    const checkSession = () => {
    fetch(`${GLOBALS.url}/checkSession`, {
      method: "GET",
      mode: "cors",
      cache: "default",
      credentials: "include"
    })
    .then((res) => res.json())
    .then((response) => {
        console.log("Tiene sesion? landing: ", response.authenticated ? 'si' : 'no');
        if (response.authenticated) {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Dashboard' }],
                })
            );
        } 
    })
    .catch((error) => {
        console.error("Error en checkSession:", error);
    });
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <LinearGradient
      colors={['#4A90E2', '#003A6B']}
      style={styles.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.centerContainer}>
        <Image
          source={require('../../assets/soundify-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Millones de canciones.</Text>
        <Text style={styles.title}>Gratis en Soundify.</Text>
      </View>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.signupText}>Regístrate gratis</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>Iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const ACCENT_BLUE = '#1DB0F6';

const styles = StyleSheet.create({
  background: {
    flex: 1,
    position: 'relative',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 80,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center'
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10
  },
  buttonWrapper: {
    position: 'absolute',
    bottom: 40,
    width: width - 40,
    alignSelf: 'center',
    gap: 10
  },
  loginButton: {
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 16,
    alignItems: 'center',
  },
  loginText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  signupButton: {
    backgroundColor: ACCENT_BLUE,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  signupText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default Landing;
