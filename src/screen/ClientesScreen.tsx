
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform
} from 'react-native';

import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';

import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';

import { db, auth } from '../config/firebase';

type Cliente = {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string;
  userId: string;
  fechaRegistro: string;
};

export default function ClientesScreen({
  onVolver
}: {
  onVolver: () => void
}) {

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const mostrarMensaje = (titulo: string, texto: string) => {
    setMensaje(`${titulo}: ${texto}`);

    if (Platform.OS !== 'web') {
      Alert.alert(titulo, texto);
    }
  };

  // Consultar los clientes del usuario autenticado
  const cargarClientes = async (uid: string) => {
    try {
      const q = query(
        collection(db, 'clients'),
        where('userId', '==', uid)
      );

      const resultado = await getDocs(q);

      const lista = resultado.docs.map(documento => ({
        ...(documento.data() as Omit<Cliente, 'id'>),
        id: documento.id
      }));

      setClientes(lista);

    } catch (error: any) {
      console.error('Error consultando clientes:', error);

      mostrarMensaje(
        'Error al consultar clientes',
        error.message
      );
    }
  };

  // Detectar cambios de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        setUsuario(user);
        setCargando(true);

        if (user) {
          await cargarClientes(user.uid);
        } else {
          setClientes([]);
        }

        setCargando(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Registrar clientes en Firestore
  const guardarCliente = async () => {

    if (
      !nombre.trim() ||
      !telefono.trim() ||
      !direccion.trim()
    ) {
      mostrarMensaje(
        'Atención',
        'Complete todos los campos.'
      );
      return;
    }

    if (!usuario) {
      mostrarMensaje(
        'Autenticación requerida',
        'Debes iniciar sesión en Firebase Authentication antes de guardar clientes.'
      );
      return;
    }

    setGuardando(true);
    setMensaje('');

    try {
      await addDoc(collection(db, 'clients'), {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        userId: usuario.uid,
        fechaRegistro: new Date().toISOString()
      });

      setNombre('');
      setTelefono('');
      setDireccion('');

      await cargarClientes(usuario.uid);

      mostrarMensaje(
        'Éxito',
        'Cliente registrado correctamente en Firestore.'
      );

    } catch (error: any) {
      console.error('Error guardando cliente:', error);

      mostrarMensaje(
        'Error al guardar cliente',
        error.message
      );

    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Gestión de Clientes (Firestore)
      </Text>

      {cargando ? (
        <Text>Verificando sesión de Firebase...</Text>
      ) : usuario ? (
        <Text style={styles.estado}>
          Usuario autenticado: {usuario.email || usuario.uid}
        </Text>
      ) : (
        <Text style={styles.aviso}>
          No hay una sesión activa de Firebase.
          Inicia sesión antes de registrar clientes.
        </Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Nombre del cliente"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        keyboardType="phone-pad"
        value={telefono}
        onChangeText={setTelefono}
      />

      <TextInput
        style={styles.input}
        placeholder="Dirección"
        value={direccion}
        onChangeText={setDireccion}
      />

      <TouchableOpacity
        style={[
          styles.button,
          (guardando || cargando) && styles.disabled
        ]}
        onPress={guardarCliente}
        disabled={guardando || cargando}
      >
        <Text style={styles.buttonText}>
          {guardando ? 'Guardando...' : 'Guardar Cliente'}
        </Text>
      </TouchableOpacity>

      {mensaje !== '' && (
        <Text style={styles.mensaje}>
          {mensaje}
        </Text>
      )}

      <Text style={styles.subtitle}>
        Clientes Registrados:
      </Text>

      <FlatList
        data={clientes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text>
            No hay clientes registrados para este usuario.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {item.nombre}
            </Text>
            <Text>Tel: {item.telefono}</Text>
            <Text>Dir: {item.direccion}</Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.button, styles.backButton]}
        onPress={onVolver}
      >
        <Text style={styles.buttonText}>
          Regresar al Menú
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F4F4F0'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333'
  },
  estado: {
    color: '#2A6B3C',
    marginBottom: 15
  },
  aviso: {
    color: '#B45309',
    marginBottom: 15,
    fontWeight: 'bold'
  },
  input: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DDD'
  },
  button: {
    backgroundColor: '#4A5D4E',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  disabled: {
    opacity: 0.5
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16
  },
  mensaje: {
    marginTop: 12,
    marginBottom: 8,
    color: '#333'
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#444'
  },
  card: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2A3B2E'
  },
  backButton: {
    backgroundColor: '#8C8C98',
    marginTop: 10
  }
});
