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
  Keyboard,
  Alert
} from 'react-native';
import { TextInput, IconButton } from 'react-native-paper'
import { LinearGradient } from 'expo-linear-gradient';
import GLOBALS from '../../Globals';

const { width } = Dimensions.get('window');
const ACCENT_BLUE = '#1DB0F6';
const BOTTOM_PADDING = 40;

const Register = ({ navigation }) => {
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState('');

    const nameRegex = /^[A-Za-zÀ-ÿ\s]{1,50}$/;
    const lastNameRegex = /^[A-Za-zÀ-ÿ\s]{1,50}$/;
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/;
    const usernameRegex = /^[a-z0-9_-]{3,16}$/;

    const [isDisabled, setIsDisabled] = useState(true);

    const checkDisabled = () => {
        if(email.length > 0 && password.length > 0 && name.length > 0 && lastName.length > 0 && username.length > 0 && confirmPassword.length > 0) {
            setIsDisabled(false);
        } else {
            setIsDisabled(true);
        }
    }

    const handleRegister = () => {
        if (
            !name ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword ||
            !username
        ) {
            Alert.alert(
            'Todos los campos son obligatorios',
            'Por favor, completa todos los campos antes de continuar.'
            );
            return;
        }

        if (!nameRegex.test(name)) {
            Alert.alert(
            'El nombre es inválido',
            'Solo se permiten letras y espacios (máx 50 caracteres).'
            );
            return;
        }

        if (!lastNameRegex.test(lastName)) {
            Alert.alert(
            'El apellido es inválido',
            'Solo se permiten letras y espacios (máx 50 caracteres).'
            );
            return;
        }

        if (email.length > 50) {
            Alert.alert('Mail inválido', 'El email no puede superar los 50 caracteres.');
            return;
        }

        if (!emailRegex.test(email)) {
            Alert.alert('Mail inválido', 'Por favor, ingresa un email válido.');
            return;
        }

        if (!usernameRegex.test(username)) {
            Alert.alert(
            'El username es inválido',
            'Se permiten letras minúsculas, dígitos, guiones medio/bajo, longitud 3–16:'
            );
            return;
        }

        if (!passwordRegex.test(password)) {
            Alert.alert(
            'La contraseña es inválida',
            'La contraseña debe tener entre 6 y 20 caracteres, y contener al menos una letra y un número.'
            );
            return;
        }

        if (!passwordRegex.test(confirmPassword)) {
            Alert.alert(
            'La contraseña es inválida',
            'La contraseña repetida debe tener entre 6 y 20 caracteres, y contener al menos una letra y un número.'
            );
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Las contraseñas no coinciden.', '');
            return;
        }

        const info = {
            name: name,
            last_name: lastName,
            email: email,
            password: password,
            userName: username
        };

        fetch(`${GLOBALS.url}/createUser`, {
            method: 'POST',
            body: JSON.stringify(info),
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            cache: 'default'
        })
            .then((data) => data.json())
            .then((response) => {
              if (response.sts) {
                setMessage('Registro exitoso. ¡Ahora puedes iniciar sesion!.')
                    setTimeout(() => {
                      setName('');
                      setLastName('');
                      setUsername('');
                      setEmail('');
                      setPassword('');
                      setConfirmPassword('');
                    navigation.navigate('Login');
                  }, 1500);
              } else {
                Alert.alert(response.msg, 'Intenta con otros datos!'|| 'Por favor, inténtalo de nuevo más tarde.');
              }
            })
            .catch((error) => {
              Alert.alert('Error de conexión', 'Por favor, verifica tu conexión a internet.');
            });
    };

    useEffect(() => {
        checkDisabled();
    }, [email, password, confirmPassword, username, lastName, name]);

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
            <Image source={require('../../assets/soundify-logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.heading}>Regístrate en Soundify</Text>
        </View>

        <View style={styles.formContainer}>

            <View style={styles.names}>
                <TextInput
                mode="flat"
                autoCapitalize='words'
                placeholder="Nombre"
                placeholderTextColor={'#ccc'}
                textColor={'#fff'}
                value={name}
                onChangeText={setName}
                style={[styles.inputWrapper, styles.halfInput ]}
                underlineColor='transparent'
                activeUnderlineColor='#ccc'
                />
                <TextInput
                mode="flat"
                placeholder="Apellido"
                placeholderTextColor={'#ccc'}
                autoCapitalize='words'
                value={lastName}
                onChangeText={setLastName}
                style={[styles.inputWrapper, styles.halfInput, { marginLeft: 10 }]}
                textColor='white'
                underlineColor='transparent'
                activeUnderlineColor='#ccc'
                />
            </View>
            
            <TextInput
            mode="flat"
            placeholder="Nombre de usuario"
            placeholderTextColor={'#ccc'}
            autoCapitalize='none'
            value={username}
            onChangeText={setUsername}
            style={styles.inputWrapper}
            textColor='white'
            underlineColor='transparent'
            activeUnderlineColor='#ccc'
            />
            <TextInput
            mode="flat"
            placeholder='Email'
            placeholderTextColor={'#ccc'}
            autoCapitalize='none'
            value={email}
            onChangeText={setEmail}
            style={styles.inputWrapper}
            textColor='white'
            underlineColor='transparent'
            activeUnderlineColor='#ccc'
            keyboardType='email-address'
            />
            <TextInput
            mode="flat"
            placeholder='Contraseña'
            autoCapitalize='none'
            placeholderTextColor={'#ccc'}
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
            <TextInput
            mode="flat"
            placeholder='Confirmar contraseña'
            autoCapitalize='none'
            placeholderTextColor={'#ccc'}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            style={styles.inputWrapper}
            underlineColor='transparent'
            activeUnderlineColor='#ccc'
            textColor='#fff'
            right={
                <TextInput.Icon
                icon={showConfirmPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowConfirmPassword((prev) => !prev)}
                color="#ccc"
                />
            }
            />

            {message ? <Text style={styles.subtitle}>{message}</Text> : null}

            <TouchableOpacity style={isDisabled ? styles.registerButtonDisabled : styles.registerButtonEnabled} onPress={() => {handleRegister(); Keyboard.dismiss()}} disabled={isDisabled}>
            <Text style={styles.buttonText}>Regístrate</Text>
            </TouchableOpacity>
            <View style={styles.footer}>
            <View style={styles.footerTextContainer}>
                <Text style={styles.footerText}>¿Ya tienes una cuenta?</Text>
            </View>
            <TouchableOpacity style={styles.loginContainer} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}>Iniciar sesión</Text>
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
    marginBottom: 30,
  },
  names: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'stretch'
  },
  halfInput: {
    flex: 1,
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
registerButtonEnabled: {
  backgroundColor: ACCENT_BLUE,
  height: 50,
  borderRadius: 25,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 15,
  marginBottom: 20,
},
registerButtonDisabled: {
  backgroundColor: 'rgba(200, 200, 200, 0.4)',
  height: 50,
  borderRadius: 25,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 15,
  marginBottom: 20
},
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerTextContainer: {
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#ddd',
  },
  loginContainer: {
    marginTop: 0,
  },
  footerLink: {
    fontSize: 14,
    color: ACCENT_BLUE,
    fontWeight: '600',
  },
});

export default Register;
