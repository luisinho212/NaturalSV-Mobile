import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';

export default function ComprasScreen({ onRegresar }: { onRegresar: () => void }) {
  const [vista, setVista] = useState<'gestion' | 'nueva' | 'seguimiento' | 'detalle'>('gestion');
  const [cancelado, setCancelado] = useState(false);

  if (vista === 'gestion') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerShape} />
        <Text style={styles.title}>Compras</Text>

        <TouchableOpacity style={styles.btnOption} onPress={() => setVista('nueva')}>
          <Text style={styles.btnOptionText}>Nueva compra</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnOption} onPress={() => setVista('seguimiento')}>
          <Text style={styles.btnOptionText}>Consultar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSecondary} onPress={onRegresar}>
          <Text style={styles.btnSecondaryText}>Regresar</Text>
        </TouchableOpacity>

        <View style={styles.bottomShape} />
      </SafeAreaView>
    );
  }

  if (vista === 'nueva') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={{ alignItems: 'center', paddingVertical: 30, width: '100%' }}
        >
          <Text style={styles.title}>Nueva compra</Text>

          <View style={styles.selectBox}>
            <Text style={styles.selectText}>Cliente ▼</Text>
          </View>

          <View style={styles.selectBox}>
            <Text style={styles.selectText}>Fecha de entrega ▼</Text>
          </View>

          <View style={styles.tableCard}>
            <View style={styles.tableRow}>
              <Text style={styles.cell}>Producto 1</Text>
              <Text style={styles.cellRight}>2</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.cell}>Producto 2</Text>
              <Text style={styles.cellRight}>1</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.cellPlaceholder}>Seleccione producto</Text>
              <Text style={styles.cellRightPlaceholder}>Cantidad</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.cellPlaceholder}>Seleccione producto</Text>
              <Text style={styles.cellRightPlaceholder}>Cantidad</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => setCancelado(!cancelado)}>
            <Text style={styles.checkboxLabel}>Cancelado</Text>
            <Text style={styles.checkbox}>{cancelado ? '☑' : '☐'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary} onPress={() => setVista('gestion')}>
            <Text style={styles.btnSecondaryText}>Guardar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnSecondary, { marginTop: 10 }]}
            onPress={() => setVista('gestion')}
          >
            <Text style={styles.btnSecondaryText}>Regresar</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (vista === 'seguimiento') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerShape} />
        <Text style={styles.title}>Seguimiento compra</Text>

        <View style={styles.searchRow}>
          <TextInput style={styles.searchInput} placeholder="" />
          <TouchableOpacity style={styles.btnBuscar}>
            <Text style={styles.btnBuscarText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tableCardList}>
          {['01', '02', '03', '04', '05'].map((num) => (
            <TouchableOpacity key={num} onPress={() => setVista('detalle')}>
              <Text style={styles.listText}>{num} | compra 1 | Detalles</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.btnSecondary} onPress={() => setVista('gestion')}>
          <Text style={styles.btnSecondaryText}>Regresar</Text>
        </TouchableOpacity>

        <View style={styles.bottomShape} />
      </SafeAreaView>
    );
  }

  // vista === 'detalle'
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerShape} />
      <Text style={styles.title}>Compra #01</Text>

      <View style={styles.dataCard}>
        <Text style={styles.dataText}>Fecha de registro: 22-08-2026</Text>
        <Text style={styles.dataText}>Status: En preparacion</Text>
        <Text style={styles.dataText}>Telefono: 76689936</Text>
        <Text style={styles.dataText}>
          Direccion de envio: Fin pje San Julian, casa #18 San Salvador
        </Text>
        <Text style={styles.dataText}>Cliente: Pedro Juan Martinez</Text>
        <Text style={styles.dataText}>ID Compra : #87338</Text>
        <Text style={styles.dataText}>Cantidad de productos: 6</Text>
        <Text style={styles.dataText}>Cantidad de envios del cliente: 2</Text>
      </View>

      <TouchableOpacity style={styles.btnSecondary} onPress={() => setVista('seguimiento')}>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginVertical: 20,
    zIndex: 1,
  },
  btnOption: {
    width: '75%',
    backgroundColor: '#D9D9D9',
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 12,
    zIndex: 1,
  },
  btnOptionText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000',
  },
  selectBox: {
    width: '80%',
    backgroundColor: '#D9D9D9',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  selectText: {
    fontSize: 16,
    color: '#000',
  },
  tableCard: {
    width: '85%',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#EEE',
    padding: 8,
  },
  cell: {
    fontSize: 14,
    color: '#000',
  },
  cellRight: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  cellPlaceholder: {
    fontSize: 14,
    color: '#888',
  },
  cellRightPlaceholder: {
    fontSize: 14,
    color: '#888',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkboxLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  checkbox: {
    fontSize: 22,
  },
  searchRow: {
    flexDirection: 'row',
    width: '85%',
    marginBottom: 15,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#D9D9D9',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  btnBuscar: {
    backgroundColor: '#D9D9D9',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  btnBuscarText: {
    fontWeight: 'bold',
  },
  tableCardList: {
    width: '85%',
    backgroundColor: '#D9D9D9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    zIndex: 1,
  },
  listText: {
    fontSize: 16,
    color: '#000',
    marginVertical: 6,
    fontWeight: '500',
  },
  dataCard: {
    width: '85%',
    backgroundColor: '#D9D9D9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    zIndex: 1,
  },
  dataText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
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