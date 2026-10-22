import React, { useState } from 'react';

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

export default function ProductosScreen({
  onRegresar,
}: {
  onRegresar: () => void;
}) {
  const [vista, setVista] = useState<
    'inventario' | 'nuevo' | 'existencias'
  >('inventario');

  if (vista === 'inventario') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerShape} />

        <Text style={styles.title}>Inventarios de productos</Text>

        <TouchableOpacity
          style={styles.btnOption}
          onPress={() => setVista('nuevo')}
        >
          <Text style={styles.btnOptionText}>Ingresar producto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnOption}
          onPress={() => setVista('existencias')}
        >
          <Text style={styles.btnOptionText}>Consultas y gestiones</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={onRegresar}
        >
          <Text style={styles.btnSecondaryText}>Regresar</Text>
        </TouchableOpacity>

        <View style={styles.bottomShape} />
      </SafeAreaView>
    );
  }

  if (vista === 'nuevo') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerShape} />

        <Text style={styles.title}>Nuevo Producto</Text>

        <View style={styles.selectBox}>
          <Text style={styles.selectText}>Nombre ▼</Text>
        </View>

        <View style={styles.selectBox}>
          <Text style={styles.selectText}>Cantidad</Text>
        </View>

        <View style={styles.selectBox}>
          <Text style={styles.selectText}>Proveedor ▼</Text>
        </View>

        <View style={styles.selectBox}>
          <Text style={styles.selectText}>Marca ▼</Text>
        </View>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => setVista('inventario')}
        >
          <Text style={styles.btnSecondaryText}>Guardar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnSecondary, { marginTop: 12 }]}
          onPress={() => setVista('inventario')}
        >
          <Text style={styles.btnSecondaryText}>Regresar</Text>
        </TouchableOpacity>

        <View style={styles.bottomShape} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerShape} />

      <Text style={styles.title}>
        Existencias por{"\n"}producto
      </Text>

      <View style={styles.tableCard}>
        <Text style={styles.tableHeader}>
          ID | Producto | Cantidad
        </Text>

        <Text style={styles.tableRow}>02 | Te de limon | 6</Text>
        <Text style={styles.tableRow}>03 | Reductor | 25</Text>
        <Text style={styles.tableRow}>04 | Te de framb | 49</Text>
        <Text style={styles.tableRow}>05 | Shake verde | 2</Text>
        <Text style={styles.tableRow}>06 | Crema rejuv | 38</Text>
      </View>

      <TouchableOpacity
        style={styles.btnSecondary}
        onPress={() => setVista('inventario')}
      >
        <Text style={styles.btnSecondaryText}>Regresar</Text>
      </TouchableOpacity>

      <View style={styles.bottomShape} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBE5D8',
    alignItems: 'center',
    paddingVertical: 40,
  },

  headerShape: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#A3B18A',
    borderBottomRightRadius: 80,
    opacity: 0.6,
  },

  bottomShape: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#A3B18A',
    borderTopLeftRadius: 80,
    opacity: 0.6,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginVertical: 20,
    zIndex: 1,
  },

  btnOption: {
    width: '80%',
    backgroundColor: '#D9D9D9',
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 12,
    zIndex: 1,
  },

  btnOptionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
  },

  selectBox: {
    width: '80%',
    backgroundColor: '#D9D9D9',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 14,
    zIndex: 1,
  },

  selectText: {
    fontSize: 16,
    color: '#333',
  },

  tableCard: {
    width: '85%',
    backgroundColor: '#D9D9D9',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    zIndex: 1,
  },

  tableHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    fontFamily: 'monospace',
  },

  tableRow: {
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
    fontFamily: 'monospace',
  },

  btnSecondary: {
    width: '50%',
    backgroundColor: '#8C8C98',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    zIndex: 1,
  },

  btnSecondaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});