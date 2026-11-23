import { getApp } from 'firebase/app';
import {
  browserPopupRedirectResolver,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../config/firebase';
import ClientesScreen from '../screen/ClientesScreen';
import ComprasScreen from '../screen/ComprasScreen';
import ProductosScreen from '../screen/ProductosScreen';
import UsuariosScreen from './usuarios';

export default function App() {
  const [screen, setScreen] = useState<
    'login' | 'menu' | 'usuarios' | 'clientes' | 'productos' | 'compras'
  >('login');

  // Estados para Login y Validaciones
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [modoRegistro, setModoRegistro] = useState(false);
  const [procesandoAcceso, setProcesandoAcceso] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const mostrarError = (titulo: string, mensaje: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(`${titulo}: ${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };


// Los usuarios de esta pantalla son de Firebase Authentication, no del mock web.
const mensajeErrorAuth = (codigo?: string): string => {
  switch (codigo) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Correo o contraseña incorrectos, o no existe una cuenta con ese correo.';
    case 'auth/email-already-in-use':
      return 'Este correo ya está registrado. Usa Iniciar sesión.';
    case 'auth/invalid-email':
      return 'El correo electrónico no es válido.';
    case 'auth/weak-password':
      return 'La contraseña es demasiado débil. Usa al menos 6 caracteres.';
    case 'auth/operation-not-allowed':
    case 'auth/configuration-not-found':
      return 'El registro con correo está desactivado en Firebase. El responsable del proyecto debe activarlo en Authentication > Sign-in method.';
    case 'auth/network-request-failed':
      return 'No se pudo conectar a Firebase. Comprueba tu conexión a internet.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera un momento y vuelve a intentarlo.';
    case 'auth/user-disabled':
      return 'Esta cuenta ha sido deshabilitada por el administrador.';
    case 'auth/invalid-api-key':
      return 'La configuración de Firebase no es válida. Revisa src/config/firebase.ts.';
    default:
      return `No se pudo autenticar. Código: ${codigo ?? 'desconocido'}.`;
  }
};

const handleLogin = async () => {
  if (procesandoAcceso) return;
  const correo = usuario.trim().toLowerCase();
  if (!correo || !password) {
    mostrarError('Campos requeridos', 'Ingresa tu correo electrónico y contraseña.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    mostrarError('Correo inválido', 'Escribe un correo real (por ejemplo, prueba@correo.com).');
    return;
  }
  if (modoRegistro && (password.length < 6 || password !== confirmarPassword)) {
    mostrarError(
      'Revisa la contraseña',
      password.length < 6
        ? 'Firebase requiere una contraseña de al menos 6 caracteres.'
        : 'Las dos contraseñas deben coincidir.'
    );
    return;
  }

  setProcesandoAcceso(true);
  try {
    const resultado = modoRegistro
      ? await createUserWithEmailAndPassword(auth, correo, password)
      : await signInWithEmailAndPassword(auth, correo, password);

    console.log('Autenticación correcta para:', resultado.user.uid);
    setPassword('');
    setConfirmarPassword('');
    setScreen('menu');
  } catch (error: unknown) {
    const codigo = error && typeof error === 'object' && 'code' in error
      ? String(error.code)
      : undefined;
    console.error('Firebase Authentication:', codigo);
    mostrarError(modoRegistro ? 'Error al crear cuenta' : 'Error al iniciar sesión', mensajeErrorAuth(codigo));
  } finally {
    setProcesandoAcceso(false);
  }
};

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      if (Platform.OS === 'web') {
        const webAuth = getAuth(getApp());
        const resultado = await signInWithPopup(
          webAuth,
          provider,
          browserPopupRedirectResolver
        );
        console.log('Sesión Google iniciada:', resultado.user.email);
        setScreen('menu');
      } else {
        mostrarError(
          'Inicio con Google',
          'Usa el inicio con correo y contraseña o configura el flujo nativo de Google.'
        );
      }
    } catch (error: any) {
      console.error('Error con Google:', error);
      mostrarError(
        'Error con Google',
        error?.message || 'No se pudo iniciar sesión con Google.'
      );
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('No se pudo cerrar la sesión:', error);
      mostrarError('Cerrar sesión', 'Hubo un problema cerrando la sesión en Firebase.');
      return;
    }
    setUsuario('');
    setPassword('');
    setConfirmarPassword('');
    setModoRegistro(false);
    setScreen('login');
  };

  if (screen === 'usuarios') {
    return <UsuariosScreen onRegresar={() => setScreen('menu')} />;
  }

  if (screen === 'clientes') {
    return <ClientesScreen onVolver={() => setScreen('menu')} />;
  }

  if (screen === 'productos') {
    return <ProductosScreen onRegresar={() => setScreen('menu')} />;
  }

  if (screen === 'compras') {
    return <ComprasScreen onRegresar={() => setScreen('menu')} />;
  }

  if (screen === 'menu') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.cardContainer}>
          {/* Adorno superior verde de Figma */}
          <View style={styles.topShape} />

          <Text style={styles.menuTitle}>Menu</Text>

          <View style={styles.menuButtonsGroup}>
            <TouchableOpacity
              style={styles.btnMenuOption}
              onPress={() => setScreen('clientes')}
            >
              <Text style={styles.btnMenuOptionText}>Clientes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnMenuOption}
              onPress={() => setScreen('compras')}
            >
              <Text style={styles.btnMenuOptionText}>Compras</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnMenuOption}
              onPress={() => setScreen('productos')}
            >
              <Text style={styles.btnMenuOptionText}>Productos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnMenuOption}
              onPress={() => setScreen('usuarios')}
            >
              <Text style={styles.btnMenuOptionText}>Usuarios</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
            <Text style={styles.btnLogoutText}>Logout</Text>
          </TouchableOpacity>

          {/* Adorno inferior verde de Figma */}
          <View style={styles.bottomShape} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.loginCard}>
          {/* Isotipo / Logo de NaturalSV */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoCross}>+</Text>
            </View>
            <Text style={styles.brandTitle}>
              Natural<Text style={styles.brandSub}>SV</Text>
            </Text>
            <Text style={styles.brandTagline}>
              SALUD • BIENESTAR • EQUILIBRIO
            </Text>
          </View>

          <Text style={styles.welcomeTitle}>{modoRegistro ? 'Crear cuenta de prueba' : 'Bienvenido'}</Text>

          {/* Formulario de Login */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              keyboardType="email-address"
              autoComplete="email"
              placeholderTextColor="#666"
              value={usuario}
              onChangeText={setUsuario}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#666"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {modoRegistro && (
              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                placeholderTextColor="#666"
                secureTextEntry
                value={confirmarPassword}
                onChangeText={setConfirmarPassword}
              />
            )}

            <TouchableOpacity
              style={[styles.btnLogin, procesandoAcceso && styles.btnGoogleDisabled]}
              onPress={handleLogin}
              disabled={procesandoAcceso}
            >
              <Text style={styles.btnLoginText}>
                {procesandoAcceso
                  ? 'Conectando con Firebase...'
                  : modoRegistro ? 'Crear cuenta' : 'Iniciar sesión'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnRegister}
              onPress={() => {
                setModoRegistro(!modoRegistro);
                setPassword('');
                setConfirmarPassword('');
              }}
              disabled={procesandoAcceso}
            >
              <Text style={styles.btnRegisterText}>
                {modoRegistro ? 'Ya tengo cuenta: iniciar sesión' : '¿No tenés cuenta? Crear una para probar'}
              </Text>
            </TouchableOpacity>

            {modoRegistro && (
              <Text style={styles.helperText}>
                La cuenta se crea en Firebase Authentication. Debe estar habilitado el acceso con correo y contraseña.
              </Text>
            )}

            {!modoRegistro && <TouchableOpacity
              style={[
                styles.btnGoogle,
                loadingGoogle && styles.btnGoogleDisabled,
              ]}
              onPress={handleGoogleLogin}
              disabled={loadingGoogle}
              activeOpacity={0.8}
            >
              <Text style={styles.btnGoogleText}>
                {loadingGoogle ? 'Conectando...' : 'Continuar con Google'}
              </Text>
            </TouchableOpacity>}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBE5D8', // Fondo crema claro de Figma
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 40,
    paddingHorizontal: 25,
    alignItems: 'center',
    elevation: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#55732F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoCross: {
    fontSize: 32,
    color: '#B0A382',
    fontWeight: 'bold',
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#55732F',
  },
  brandSub: {
    color: '#A89262',
  },
  brandTagline: {
    fontSize: 10,
    color: '#55732F',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1A1A1A',
    marginVertical: 20,
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '90%',
    backgroundColor: '#D9D9D9',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  btnLogin: {
    width: '90%',
    backgroundColor: '#55732F', // Verde oliva de Figma
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  btnLoginText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  btnRegister: {
    marginTop: 14,
    width: '95%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnRegisterText: {
    color: '#44641F',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  helperText: {
    width: '90%',
    marginTop: 6,
    textAlign: 'center',
    fontSize: 12,
    color: '#555',
  },
  btnGoogle: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#55732F',
    borderRadius: 15,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 12,
    opacity: 1,
  },
  btnGoogleDisabled: {
    opacity: 0.6,
  },
  btnGoogleText: {
    color: '#55732F',
    fontSize: 16,
    fontWeight: '600',
  },

  // Estilos Pantalla Menú
  cardContainer: {
    flex: 1,
    backgroundColor: '#EBE5D8',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 25,
  },
  topShape: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: '#A3B18A',
    borderBottomRightRadius: 100,
    opacity: 0.6,
  },
  bottomShape: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: '#A3B18A',
    borderTopLeftRadius: 100,
    opacity: 0.6,
  },
  menuTitle: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 30,
    zIndex: 1,
  },
  menuButtonsGroup: {
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  btnMenuOption: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginVertical: 10,
    elevation: 2,
  },
  btnMenuOptionText: {
    fontSize: 20,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  btnLogout: {
    width: '50%',
    backgroundColor: '#8C8C98',
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
    zIndex: 1,
  },
  btnLogoutText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});