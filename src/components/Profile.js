import React, { use, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    Modal,
    TouchableOpacity,
    Keyboard,
    Alert,
    ScrollView,
    TextInput
} from 'react-native';
import { Avatar, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import GLOBALS from '../../Globals';
import { useIsFocused } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const MODAL_WIDTH = width * 0.85;
const ACCENT_BLUE = '#1DB0F6';

const Profile = ({ navigation, visibleProfile, setVisibleProfile, logout }) => {
    const slideAnim = useRef(new Animated.Value(-MODAL_WIDTH)).current;
    const [shouldRender, setShouldRender] = useState(visibleProfile);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [lastname, setLastname] = useState('');
    const [password, setPassword] = useState('');

    const [originalUserData, setOriginalUserData] = useState({
        userid: '',
        username: '',
        email: '',
        name: '',
        lastname: '',
        initials: '',
        personid: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);

    const nameRegex = /^[A-Za-zÀ-ÿ\s]{1,50}$/;
    const lastNameRegex = /^[A-Za-zÀ-ÿ\s]{1,50}$/;
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/;
    const usernameRegex = /^[a-z0-9_-]{3,16}$/;
    const isFocused = useIsFocused();

    const getUserById = async () => {
        fetch(`${GLOBALS.url}/ToProcess`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    objectName: 'UserBO',
                    methodName: 'getUserById',
                    params: {}
                })
            })
            .then((resUser) => resUser.json())
            .then((responseUser) => {
                if(responseUser.sts) {
                setOriginalUserData({
                    userid: responseUser.data.id_user,
                    username: responseUser.data.username,
                    email: responseUser.data.email,
                    name: responseUser.data.name,
                    lastname: responseUser.data.last_name,
                    initials: responseUser.data.name[0] + responseUser.data.last_name[0],
                    personid: responseUser.data.fk_id_person,
                    password: responseUser.data.password
                });
            }
        })
    }
    const checkSession = async () => {
        fetch(`${GLOBALS.url}/checkSession`, {
        method: "GET",
        mode: "cors",
        cache: "default",
        credentials: "include"
        })
        .then((res) => res.json())
        .then((response) => {
            if (!response.authenticated) {
                setVisibleProfile(false);
                Alert.alert(
                'No tiene sesión',
                'Debe iniciar sesión',
                [{text: 'Aceptar', onPress: () => navigation.navigate('Landing')}]
                );
            } else {
                getUserById();
            }
        })
        .catch((error) => {
            console.error("Error en checkSession:", error);
        });
    };

    useEffect(() => {
        getUserById();

        setUsername(originalUserData.username || '');
        setEmail(originalUserData.email || '');
        setLastname(originalUserData.lastname || '');
        setName(originalUserData.name || '');
        setPassword(originalUserData.password || '');

        if (visibleProfile) {
            setShouldRender(true);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -MODAL_WIDTH,
                duration: 250,
                useNativeDriver: true,
            }).start(() => setShouldRender(false));
        }
    }, [visibleProfile, slideAnim]);

    const handleSaveProfile = async (field, fieldValue) => {
        Keyboard.dismiss();

        if (!fieldValue.trim()) {
            Alert.alert('Valor obligatorio', 'Debe ingresar un valor válido.');
            return;
        }

        let objectName;
        let methodName;
        let params = {};
        let isValid = true;
        let alertTitle = '';
        let alertMessage = '';

        switch (field) {
            case 'name':
                if (!nameRegex.test(fieldValue)) { isValid = false; alertTitle = 'El nombre es inválido'; alertMessage = 'Solo se permiten letras y espacios (máx 50 caracteres).'; }
                objectName = 'PersonBO'; methodName = 'updatePersonName'; params = { personId: originalUserData.personid, name: fieldValue };
                break;
            case 'lastname':
                if (!lastNameRegex.test(fieldValue)) { isValid = false; alertTitle = 'El apellido es inválido'; alertMessage = 'Solo se permiten letras y espacios (máx 50 caracteres).'; }
                objectName = 'PersonBO'; methodName = 'updatePersonLastName'; params = { personId: originalUserData.personid, lastName: fieldValue };
                break;
            case 'email':
                if (fieldValue.length > 50 || !emailRegex.test(fieldValue)) { isValid = false; alertTitle = 'Mail inválido'; alertMessage = 'Por favor, ingresa un email válido (máx 50 caracteres).'; }
                objectName = 'UserBO'; methodName = 'updateUserEmail'; params = { email: fieldValue };
                break;
            case 'username':
                if (!usernameRegex.test(fieldValue)) { isValid = false; alertTitle = 'El nombre de usuario es inválido'; alertMessage = 'Se permiten letras minúsculas, dígitos, guiones medio/bajo, longitud 3–16.'; }
                objectName = 'UserBO'; methodName = 'updateUserName'; params = { userName: fieldValue };
                break;
            case 'password':
                if (!passwordRegex.test(fieldValue)) { isValid = false; alertTitle = 'La contraseña es inválida'; alertMessage = 'La contraseña debe tener entre 6 y 20 caracteres, y contener al menos una letra y un número.'; }
                objectName = 'UserBO'; methodName = 'updateUserPassword'; params = { password: fieldValue };
                break;
            default:
                Alert.alert("Error", "Campo no reconocido.");
                return;
        }

        if (!isValid) {
            Alert.alert(alertTitle, alertMessage);
            return;
        }

        try {
            const response = await fetch(`${GLOBALS.url}/ToProcess`, {
                method: 'POST',
                mode: 'cors',
                cache: 'default',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    objectName: objectName,
                    methodName: methodName,
                    params: params
                })
            });
            const data = await response.json();

            if (data.sts) {
                Alert.alert('Éxito', `Los cambios han sido guardados correctamente.`);
                await getUserById();
            } else {
                Alert.alert('Error', data.msg || `No se pudo actualizar el ${field}.`);
            }
        } catch (error) {
            console.error(`Error en handleSaveProfile para ${field}:`, error);
            Alert.alert('Error', 'Ocurrió un error al guardar. Intenta de nuevo.');
        }
    };

    const handleDeleteAccount = async () => {
        Alert.alert(
        'Borrar cuenta',
        '¿Estás seguro de que quieres borrar tu cuenta?',
            [
                { text: 'Cancelar' },
                { text: 'Borrar mi cuenta',
                    onPress: () => {
                        fetch(`${GLOBALS.url}/ToProcess`, {
                            method: 'POST',
                            mode: 'cors',
                            cache: 'default',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                objectName: 'UserBO',
                                methodName: 'deleteUser',
                                params: {}
                        })
                        })
                        .then((res) => res.json())
                        .then((response) => {
                            console.log(response.msg);
                            if (response.sts) {
                                Alert.alert('Cuenta eliminada', 'Tu cuenta ha sido borrada satisfactoriamente.');
                                logout();
                            } else {
                            Alert.alert('Error', response.msg || 'No se pudo borrar la cuenta.');
                            }
                        })
                        .catch((error) => {
                            console.error('Error en handleDeleteAccount:', error);
                            Alert.alert('Error', 'Ocurrió un error. Intenta de nuevo.');
                        });
                    }
                },
                
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert(
        'Cerrar sesión',
        '¿Estás seguro de que quieres cerrar la sesión?',
        [
            { text: 'Cancelar' },
            {
            text: 'Cerrar sesión',
            onPress: async () => {
                const response = await logout();
                console.log("respuesta del sts:", response);
                
                if (response.sts) {
                    setVisibleProfile(false);
                } else {
                    Alert.alert("Error", response.msg || "No se pudo cerrar la sesión.");
                }
            }
            }
        ]
        );
    };

    if (!shouldRender) return null;

    return (
        <Modal transparent visible={shouldRender} animationType="none">
            <LinearGradient
                colors={['#4A90E2', '#003A6B']}
                style={styles.wrapper}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <TouchableWithoutFeedback onPress={() => setVisibleProfile(false)}>
                    <View style={styles.overlay} />
                </TouchableWithoutFeedback>
                <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
                    <LinearGradient
                        colors={['#4A90E2', '#003A6B']}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                    <View style={styles.innerContent}>
                        <View style={styles.navbar}>
                            <Avatar.Text size={50} label={originalUserData.initials} labelStyle={styles.labelStyle} style={styles.avatar}/>
                            <View style={styles.avatarTextContainer}>
                                <Text style={styles.avatarTextTop}>{originalUserData.username}</Text>
                                <Text style={styles.avatarTextBottom}>Editar perfil</Text>
                            </View>
                        </View>
                        
                        <ScrollView style={styles.editFieldsContainer} showsVerticalScrollIndicator={false}>
                            <View style={styles.fieldItem}>
                                <View style={styles.textAndInputWrapper}>
                                    <Text style={styles.fieldLabel}>NOMBRE DE USUARIO</Text>
                                    <TextInput
                                        style={styles.fieldValue}
                                        value={username}
                                        onChangeText={(text) => setUsername(text)}
                                    />
                                </View>
                                <View style={styles.iconButtonWrapper}>
                                    <IconButton
                                        icon="content-save"
                                        iconColor={username === originalUserData.username ? 'rgba(255,255,255,0.5)' : '#FFFFFF'}
                                        size={23}
                                        onPress={() => handleSaveProfile('username', username)}
                                        disabled={username === originalUserData.username}
                                    />
                                </View>
                            </View>

                            <View style={styles.fieldItem}>
                                <View style={styles.textAndInputWrapper}>
                                    <Text style={styles.fieldLabel}>CORREO ELECTRÓNICO</Text>
                                    <TextInput
                                        style={styles.fieldValue}
                                        value={email}
                                        onChangeText={setEmail}
                                    />
                                </View>
                                <View style={styles.iconButtonWrapper}>
                                    <IconButton
                                        icon="content-save"
                                        iconColor={email === originalUserData.email ? 'rgba(255,255,255,0.5)' : '#FFFFFF'}
                                        size={23}
                                        onPress={() => handleSaveProfile('email', email)}
                                        disabled={email === originalUserData.email}
                                    />
                                </View>
                            </View>

                            <View style={styles.fieldItem}>
                                <View style={styles.textAndInputWrapper}>
                                    <Text style={styles.fieldLabel}>NOMBRE</Text>
                                    <TextInput
                                        style={styles.fieldValue}
                                        value={name}
                                        onChangeText={setName}
                                    />
                                </View>
                                <View style={styles.iconButtonWrapper}>
                                    <IconButton
                                        icon="content-save"
                                        iconColor={name === originalUserData.name ? 'rgba(255,255,255,0.5)' : '#FFFFFF'}
                                        size={23}
                                        onPress={() => handleSaveProfile('name', name)}
                                        disabled={name === originalUserData.name}
                                    />
                                </View>
                            </View>

                            <View style={styles.fieldItem}>
                                <View style={styles.textAndInputWrapper}>
                                    <Text style={styles.fieldLabel}>APELLIDO</Text>
                                    <TextInput
                                        style={styles.fieldValue}
                                        value={lastname}
                                        onChangeText={setLastname}
                                    />
                                </View>
                                <View style={styles.iconButtonWrapper}>
                                    <IconButton
                                        icon="content-save"
                                        iconColor={lastname === originalUserData.lastname ? 'rgba(255,255,255,0.5)' : '#FFFFFF'}
                                        size={23}
                                        onPress={() => handleSaveProfile('lastname', lastname)}
                                        disabled={lastname === originalUserData.lastname}
                                    />
                                </View>
                            </View>

                            <View style={styles.fieldItem}>
                                <View style={styles.textAndInputWrapper}>
                                    <Text style={styles.fieldLabel}>CONTRASEÑA</Text>
                                    <TextInput
                                        secureTextEntry={!showPassword}
                                        style={styles.fieldValue}
                                        value={password}
                                        onChangeText={setPassword}
                                    />
                                </View>
                                <View style={styles.iconButtonWrapperPassword}>
                                    <IconButton
                                        icon={showPassword ? "eye-off" : "eye"}
                                        iconColor={!showPassword ? 'rgba(0, 0, 0, 0.28)' : '#FFFFFF'}
                                        size={23}
                                        onPress={() => {setShowPassword(!showPassword)}}
                                    />
                                    <IconButton
                                        icon="content-save"
                                        iconColor={password === originalUserData.password ? 'rgba(255,255,255,0.5)' : '#FFFFFF'}
                                        size={23}
                                        onPress={() => handleSaveProfile('password', password)}
                                        disabled={password === originalUserData.password}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={handleDeleteAccount}
                            >
                                <Text style={styles.deleteText}>Borrar cuenta</Text>
                            </TouchableOpacity>

                        </ScrollView>

                    </View>

                    <View style={styles.fixedBottom}>
                        <TouchableOpacity onPress={() => {Keyboard.dismiss(); handleLogout();}} style={styles.logoutButton}>
                        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </LinearGradient>
        </Modal>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.58)',
    },
    container: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: MODAL_WIDTH,
        backgroundColor: 'transparent',
        overflow: 'hidden',
    },

    innerContent: {
        flex: 1,
        flexDirection: 'column',
        alignContent: 'center',
        paddingTop: 40,
        paddingHorizontal: 20,
    },
    navbar: {
        height: 98,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
        marginBottom: 15,
        gap: 20,
    },
    deleteButton: {
        borderWidth: 1,
        borderColor: '#fff',
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: 30,
        marginBottom: 16,
        alignItems: 'center',
        alignSelf: 'center',
        width: 'auto',
        minWidth: 140, 
        maxWidth: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    navItem: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    labelStyle: {
        fontSize: 14,
        fontWeight: 'bold'
    },
    fixedBottom: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    avatar: {
        backgroundColor: 'rgba(34, 20, 228, 0.27)',
    },
    avatarTextContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
    },
    avatarTextTop: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    avatarTextBottom: {
        color: '#fff',
        fontSize: 12,
        opacity: 0.9,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#fff'
    },
    item: {
        fontSize: 16,
        marginVertical: 10,
        color: '#fff'
    },
    logoutButton: {
        backgroundColor: ACCENT_BLUE,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 20,
        alignSelf: 'center',
        width: 200
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    editFieldsContainer: {
        flex: 1,
        marginTop: 20,
    },
    fieldItem: {
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    fieldLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    textAndInputWrapper: {
        flex: 1,
        marginRight: 10,
    },
    fieldValue: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    iconButtonWrapper: {
    },
    iconButtonWrapperPassword: {
        flexDirection: 'row',
        alignItems: 'center'
    }
});

export default Profile;