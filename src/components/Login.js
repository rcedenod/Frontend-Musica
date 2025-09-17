import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
  Alert,
  Keyboard
} from 'react-native';
import { TextInput, IconButton } from 'react-native-paper'
import { LinearGradient } from 'expo-linear-gradient';
import logo from '../../assets/soundify-logo.png';

const { width } = Dimensions.get('window');
const ACCENT_BLUE = '#1DB0F6';
const BOTTOM_PADDING = 40;

// Recibe solo la función de login de tu backend
const Login = ({ navigation, login }) => { 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const maxEmailLength = 50;
    const [isDisabled, setIsDisabled] = useState(true);

    const checkDisabled = () => {
        if(email.length > 0 && password.length > 0) {
            setIsDisabled(false);
        } else {
            setIsDisabled(true);
        }
    }
    
    const handleLogin = async () => {
        if (email.length > maxEmailLength) {
            Alert.alert("Mail inválido","El email no puede superar los 50 caracteres.");
            return;
        }
        if (!emailRegex.test(email)) {
            Alert.alert("Mail inválido","Por favor, ingresa un email válido.");
            return;
        }
        
        const info = { email: email, password: password };
        const response = await login(info);
        
        if (!response.sts) {
            Alert.alert("Error de autenticacion", response.msg || "Credenciales incorrectas");
        } else {
            console.log("Login de usuario exitoso, redirigiendo a Dashboard.");
        }
    };
    
    useEffect(() => {
        checkDisabled();
    }, [email, password]);

    return (
        <LinearGradient
        colors={['#4A90E2', '#003A6B']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        >
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <IconButton
                icon="arrow-left"
                iconColor={'#fff'}
                size={25}
                onPress={() => navigation.navigate('Landing')}
                style={styles.backButton}
            />

            <View style={styles.headerContainer}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.heading}>Iniciar sesión en Soundify</Text>
            </View>

            <View style={styles.formContainer}>
            <TextInput
                mode="flat"
                placeholder='Email'
                autoCapitalize='none'
                placeholderTextColor={'#ccc'}
                value={email}
                onChangeText={setEmail}
                style={styles.inputWrapper}
                textColor='#fff'
                underlineColor='transparent'
                activeUnderlineColor='#ccc'
            />
            <TextInput
                mode="flat"
                placeholder='Contraseña'
                placeholderTextColor={'#ccc'}
                autoCapitalize='none'
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.inputWrapper}
                underlineColor='transparent'
                activeUnderlineColor='#ccc'
                textColor='#fff'
                right={
                    <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword((prev) => !prev)}
                    color="#ccc"
                    />
                }
            />
            <TouchableOpacity style={isDisabled ? styles.loginButtonDisabled : styles.loginButtonEnabled} onPress={handleLogin} disabled={isDisabled}>
                <Text style={styles.loginButtonText} onPress={() => {handleLogin(); Keyboard.dismiss()}}>Iniciar sesión</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <TouchableOpacity
                style={styles.forgotButton}
                >
                <Text style={styles.forgotText} onPress={() => navigation.navigate('ForgotPassword')}>Olvidé mi contraseña</Text>
                </TouchableOpacity>

                <Text style={styles.footerText}>¿No tienes una cuenta?</Text>

                <TouchableOpacity style={styles.signupContainer} onPress={() => navigation.navigate('Register')}>
                <Text style={styles.footerLink}>Regístrate</Text>
                </TouchableOpacity>
            </View>
            </View>
        </KeyboardAvoidingView>
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
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingBottom: BOTTOM_PADDING,
    },
    backButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 50 : 20,
      left: 10,
      zIndex: 10,
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    logo: {
      width: 80,
      height: 80,
      marginBottom: 16,
    },
    heading: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
    },
    formContainer: {
      width: width - 40,
      alignSelf: 'center',
    },
    inputWrapper: {
      text: '#fff',
      backgroundColor: 'rgba(255,255,255,0.2)',
      marginVertical: 5,
    },
    loginButtonEnabled: {
          backgroundColor: ACCENT_BLUE,
          height: 50,
          borderRadius: 25,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 15,
          marginBottom: 20,
      },
      loginButtonDisabled: {
          backgroundColor: 'rgba(200, 200, 200, 0.4)',
          height: 50,
          borderRadius: 25,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 15,
          marginBottom: 20
      },
    loginButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
      forgotButton: {
      borderWidth: 1,
      borderColor: '#fff',
      paddingVertical: 3,
      paddingHorizontal: 10,
      borderRadius: 30,
      marginBottom: 16,
      alignItems: 'center',
    },
    forgotText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
    },
    footer: {
      alignItems: 'center',
    },
    signupContainer: {
      marginTop: 8,
    },
    footerText: {
      fontSize: 14,
      color: '#ddd',
    },
    footerLink: {
      fontSize: 14,
      color: ACCENT_BLUE,
      fontWeight: '600',
    },
  });

export default Login;