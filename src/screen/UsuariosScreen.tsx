import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../config/firebase';

export default function UsuariosScreen({ onVolver }: { onVolver: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuthAction = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor complete todos los campos requeridos.');
      return;
    }
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          nombre: nombre,
          email: email,
          rol: 'Operador',
          fechaCreacion: new Date().toISOString()
        });
        Alert.alert('Éxito', 'Usuario registrado y almacenado en Firestore.');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        Alert.alert('Éxito', 'Sesión iniciada correctamente.');
      }
    } catch (error: any) {
      Alert.alert('Error de Autenticación', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isRegistering ? 'Registro de Usuario' : 'Iniciar Sesión'}</Text>
      {isRegistering && (
        <TextInput style={styles.input} placeholder="Nombre completo" placeholderTextColor="#8C8C98" value={nombre} onChangeText={setNombre} />
      )}
      <TextInput style={styles.input} placeholder="Correo electrónico" placeholderTextColor="#8C8C98" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor="#8C8C98" secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity style={styles.button} onPress={handleAuthAction}>
        <Text style={styles.buttonText}>{isRegistering ? 'Registrarse' : 'Entrar'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
        <Text style={styles.switchText}>{isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: '#8C8C98', marginTop: 20 }]} onPress={onVolver}>
        <Text style={styles.buttonText}>Regresar al Menú</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#F4F4F0' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  input: { backgroundColor: '#FFF', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#DDD' },
  button: { backgroundColor: '#4A5D4E', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  switchText: { marginTop: 15, textAlign: 'center', color: '#2A3B2E' }
});