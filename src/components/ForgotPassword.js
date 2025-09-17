import { useState, useRef } from 'react';
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
  Keyboard
} from 'react-native';
import { TextInput, IconButton } from 'react-native-paper'
import { LinearGradient } from 'expo-linear-gradient';
import logo from '../../assets/soundify-logo.png';
import GLOBALS from '../../Globals';

const { width } = Dimensions.get('window');
const DEFAULT_MESSAGE = 'Te enviaremos un email con un código para iniciar sesión.';
const ACCENT_BLUE = '#1DB0F6';
const BOTTOM_PADDING = 40;

const ForgotPassword = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const emailRegex = /^\S+@\S+\.\S+$/;
    const maxEmailLength = 50;
    const [message, setMessage] = useState(DEFAULT_MESSAGE);

    const [isDisabled, setIsDisabled] = useState(true);

    const checkDisabled = (email) => {
        if(email.length > 0) {
            setIsDisabled(false);
        } else {
            setIsDisabled(true);
        }
    }

    const handleForgotPassword = async () => {
        if (email.length > maxEmailLength) {
            setMessage('Email muy largo, el email no puede superar los 50 caracteres.')
           //  Alert.alert('Mail muy largo', 'El email no puede superar los 50 caracteres.');
            return;
        }
        if (!emailRegex.test(email)) {
            setMessage('Email inválido, por favor, ingresa un email válido.');
            // Alert.alert('Mail inválido', 'Por favor, ingresa un email válido.');
            return;
        }

        try {
            const response = await fetch(`${GLOBALS.url}/resetPassword`, {
                method: 'POST',
                body: JSON.stringify({ email }),
                headers: { 'Content-Type': 'application/json' },
                cache: 'default',
                credentials: 'include'
            });

            const data = await response.json();
            console.log(data.msg);

            if (data.sts) {
                setMessage('El código ha sido enviado correctamente a su email.')
                setTimeout(() => {
                    setEmail('');
                    setIsDisabled(true);
                    navigation.navigate('ResetPassword');
                }, 2000)
            } else {
                setMessage(data.msg);
            }

        } catch (error) {
            console.error('Error en la solicitud:', error);
            setMessage('Error al enviar el correo.');
        }
    };

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
            onPress={() => navigation.navigate('Login')}
            style={styles.backButton}
        />

        <View style={styles.headerContainer}>
            <Image source={require('../../assets/soundify-logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.heading}>Olvidé mi contraseña</Text>
        </View>

        <View style={styles.formContainer}>
            <TextInput
            mode="flat"
            placeholder='Ingresa tu email'
            placeholderTextColor={'#ccc'}
            value={email}
            keyboardType='email-address'
            autoCapitalize='none'
            onChangeText={(email) => {
                setEmail(email);
                checkDisabled(email);
            }}
            style={styles.inputWrapper}
            textColor='white'
            underlineColor='transparent'
            activeUnderlineColor='#ccc'
            />

            {message ? <Text style={styles.subtitle}>{message}</Text> : null}

            <TouchableOpacity onPress={() => {handleForgotPassword(); Keyboard.dismiss()}} style={isDisabled ? styles.forgotButtonDisabled : styles.forgotButtonEnabled} disabled={isDisabled}>
            <Text style={styles.forgotButtonText}>Enviar código</Text>
            </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
    </LinearGradient>
    );
}

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
    subtitle: {
        fontSize: 12,
        color: '#fff',
        textAlign: 'left'
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
    forgotButtonEnabled: {
        backgroundColor: ACCENT_BLUE,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 20,
    },
    forgotButtonDisabled: {
        backgroundColor: 'rgba(200, 200, 200, 0.4)',
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 20
    },
    forgotButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    },
});

export default ForgotPassword;