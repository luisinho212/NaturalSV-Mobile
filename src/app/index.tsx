import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import UsuariosScreen from './usuarios';
import ClientesScreen from './clientes';

export default function App() {
  const [screen, setScreen] = useState<
    'login' | 'menu' | 'usuarios' | 'clientes'
  >('login');
  
  // Estados para Login y Validaciones
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!usuario.trim() || !password.trim()) {
      Alert.alert('Error de Validación', 'Por favor ingrese su usuario y contraseña.');
      return;
    }

    if (password.length < 4) {
      Alert.alert('Error de Validación', 'La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    // Si pasa la validación, navega al Menú
    setScreen('menu');
  };

  const handleLogout = () => {
    setUsuario('');
    setPassword('');
    setScreen('login');
  };
  if (screen === 'usuarios') {
    return <UsuariosScreen onRegresar={() => setScreen('menu')} />;
  }

  if (screen === 'clientes') {
    return <ClientesScreen onRegresar={() => setScreen('menu')} />;
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
              onPress={() => setScreen('clientes')}>
              <Text style={styles.btnMenuOptionText}>Clientes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnMenuOption}>
              <Text style={styles.btnMenuOptionText}>Compras</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnMenuOption}>
              <Text style={styles.btnMenuOptionText}>Productos</Text>
            </TouchableOpacity>

          <TouchableOpacity style={styles.btnMenuOption} onPress={() => setScreen('usuarios')}>
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
            <Text style={styles.brandTagline}>SALUD • BIENESTAR • EQUILIBRIO</Text>
          </View>

          <Text style={styles.welcomeTitle}>Bienvenido</Text>

          {/* Formulario de Login */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Usuario"
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

            <TouchableOpacity style={styles.btnLogin} onPress={handleLogin}>
              <Text style={styles.btnLoginText}>Iniciar sesion</Text>
            </TouchableOpacity>
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
