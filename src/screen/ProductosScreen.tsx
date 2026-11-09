import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function ProductosScreen({ onVolver }: { onVolver: () => void }) {
  const [productos, setProductos] = useState<any[]>([]);

  const obtenerProductos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const lista = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductos(lista);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventario de Productos (Cloud)</Text>

      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.nombre}</Text>
            <Text>Precio: ${item.precio}</Text>
            <Text>Stock disponible: {item.stock}</Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#8C8C98', marginTop: 15 }]}
        onPress={onVolver}
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
  card: {
    backgroundColor: '#FFF',
    padding: 15,
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
});