import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export default function ComprasScreen({ onRegresar }: { onRegresar: () => void }) {
  const [total, setTotal] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [compras, setCompras] = useState<any[]>([]);

  const cargarCompras = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, 'purchases'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const lista = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompras(lista);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    cargarCompras();
  }, []);

  const registrarCompra = async () => {
    if (!total.trim() || !descripcion.trim()) {
      Alert.alert('Atención', 'Ingrese descripción y total.');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(collection(db, 'purchases'), {
        total: parseFloat(total),
        descripcion,
        userId: user.uid,
        timestamp: new Date().toISOString(),
      });

      Alert.alert('Éxito', 'Compra registrada en Firestore.');
      setTotal('');
      setDescripcion('');
      cargarCompras();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Compras</Text>

      <TextInput
        style={styles.input}
        placeholder="Descripción de la compra"
        value={descripcion}
        onChangeText={setDescripcion}
      />
      <TextInput
        style={styles.input}
        placeholder="Total ($)"
        keyboardType="numeric"
        value={total}
        onChangeText={setTotal}
      />

      <TouchableOpacity style={styles.button} onPress={registrarCompra}>
        <Text style={styles.buttonText}>Registrar Compra</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Transacciones Almacenadas:</Text>

      <FlatList
        data={compras}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.descripcion}</Text>
            <Text>Total: ${item.total}</Text>
            <Text>Fecha: {new Date(item.timestamp).toLocaleDateString()}</Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#8C8C98', marginTop: 10 }]}
        onPress={onRegresar}
      >
        <Text style={styles.buttonText}>Regresar al Menú</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F4F4F0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#444',
  },
  input: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  button: {
    backgroundColor: '#4A5D4E',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2A3B2E',
  },
});