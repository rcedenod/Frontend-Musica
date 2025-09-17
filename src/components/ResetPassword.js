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
  Alert
} from 'react-native';
import { TextInput, IconButton } from 'react-native-paper'
import { LinearGradient } from 'expo-linear-gradient';
import GLOBALS from '../../Globals';

const { width } = Dimensions.get('window');
const ACCENT_BLUE = '#1DB0F6';
const BOTTOM_PADDING = 40;

const ResetPassword = ({ navigation }) => {
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/;

    const [isDisabled, setIsDisabled] = useState(true);

    const checkDisabled = () => {
        if(code.length > 0 && newPassword.length > 0) {
            setIsDisabled(false);
        } else {
            setIsDisabled(true);
        }
    }

    const handleResetPassword = async () => {
        if (!passwordRegex.test(newPassword)) {
            setMessage(
            'La contraseña debe tener entre 6 y 20 caracteres, y contener al menos una letra y un número.'
            );
            return;
        }

    try {
        const response = await fetch(`${GLOBALS.url}/confirmResetPassword`, {
            method: 'POST',
            body: JSON.stringify({ code, newPassword }),
            headers: { 'Content-Type': 'application/json' },
            cache: 'default',
            credentials: 'include',
        });

        const data = await response.json();
        setMessage(data.msg);

        if (data.sts) {
        setTimeout(() => {
            setMessage('');
            navigation.navigate('Login');
        }, 1500);
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
        setMessage('Error al actualizar la contraseña.');
    }
    };

    useEffect(() => {
        checkDisabled();
    }, [code, newPassword]);

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
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.backButton}
            />

            <View style={styles.headerContainer}>
                <Image source={require('../../assets/soundify-logo.png')} style={styles.logo} resizeMode="contain" />
                <Text style={styles.heading}>Reestablecer mi contraseña</Text>
            </View>

            <View style={styles.formContainer}>
                <TextInput
                mode="flat"
                placeholder='Ingresa el código'
                placeholderTextColor={'#ccc'}
                value={code}
                onChangeText={(code) => {
                    setCode(code);
                }}
                style={styles.inputWrapper}
                textColor='white'
                underlineColor='transparent'
                activeUnderlineColor='#ccc'
                />
                <TextInput
                mode="flat"
                placeholder='Ingresa la nueva contraseña'
                placeholderTextColor={'#ccc'}
                value={newPassword}
                onChangeText={(newPassword) => {
                    setNewPassword(newPassword);
                }}
                style={styles.inputWrapper}
                textColor='white'
                underlineColor='transparent'
                activeUnderlineColor='#ccc'
                />

                {message ? <Text style={styles.subtitle}>{message}</Text> : null}

                <TouchableOpacity onPress={handleResetPassword} style={isDisabled ? styles.resetButtonDisabled : styles.resetButtonEnabled} disabled={isDisabled}>
                <Text style={styles.resetButtonText}>Enviar código</Text>
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
    resetButtonEnabled: {
        backgroundColor: ACCENT_BLUE,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 20,
    },
    resetButtonDisabled: {
        backgroundColor: 'rgba(200, 200, 200, 0.4)',
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 20
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ResetPassword;