
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert
} from 'react-native';

import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';

import { db, auth } from '../config/firebase';

export default function ClientesScreen({
  onVolver
}: {
  onVolver: () => void
}) {

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [clientes, setClientes] = useState<any[]>([]);

  // Obtener clientes asociados al usuario
  const cargarClientes = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        Alert.alert('Atención', 'Debes iniciar sesión.');
        return;
      }

      const q = query(
        collection(db, 'clients'),
        where('userId', '==', user.uid)
      );

      const querySnapshot = await getDocs(q);

      const lista = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setClientes(lista);

    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  // Guardar nuevo cliente en Firebase
  const guardarCliente = async () => {

    if (
      !nombre.trim() ||
      !telefono.trim() ||
      !direccion.trim()
    ) {
      Alert.alert('Atención', 'Complete todos los campos.');
      return;
    }

    try {
      const user = auth.currentUser;

      if (!user) {
        Alert.alert('Atención', 'Debes iniciar sesión.');
        return;
      }

      await addDoc(collection(db, 'clients'), {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        userId: user.uid,
        fechaRegistro: new Date().toISOString()
      });

      Alert.alert(
        'Éxito',
        'Cliente registrado en la nube.'
      );

      setNombre('');
      setTelefono('');
      setDireccion('');

      await cargarClientes();

    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Gestión de Clientes (Firestore)
      </Text>

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
        style={styles.button}
        onPress={guardarCliente}
      >
        <Text style={styles.buttonText}>
          Guardar Cliente
        </Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>
        Clientes Registrados:
      </Text>

      <FlatList
        data={clientes}
        keyExtractor={(item) => item.id}
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
        style={[
          styles.button,
          {
            backgroundColor: '#8C8C98',
            marginTop: 10
          }
        ]}
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

  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#444'
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

  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16
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
  }
});
