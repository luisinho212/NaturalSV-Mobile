import React, { useMemo, useState } from 'react';
import { router } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Vista = 'clientes' | 'historial' | 'detalle';

type ProductoCompra = {
  nombre: string;
  cantidad: number;
  precio: number;
};

type Compra = {
  id: string;
  fecha: string;
  estado: 'Pendiente' | 'En preparación' | 'Entregado';
  productos: ProductoCompra[];
};

type Cliente = {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string;
  fechaRegistro: string;
  comentario: string;
  compras: Compra[];
};

type ClientesScreenProps = {
  onRegresar?: () => void;
};

// Datos locales de demostración. En una etapa futura pueden reemplazarse
// por información obtenida desde una API sin cambiar las vistas del módulo.
const clientes: Cliente[] = [
  {
    id: 'C001',
    nombre: 'Ana Paula Mejía',
    telefono: '7896-3524',
    direccion: 'Antiguo Cuscatlán, La Libertad',
    fechaRegistro: '09/2025',
    comentario: 'Solamente entregas los días martes y jueves.',
    compras: [
      {
        id: '2545',
        fecha: '18/08/2026',
        estado: 'Entregado',
        productos: [
          { nombre: 'Té reductor', cantidad: 2, precio: 8.5 },
          { nombre: 'Multivitamina B12', cantidad: 1, precio: 12 },
        ],
      },
      {
        id: '2543',
        fecha: '03/08/2026',
        estado: 'Entregado',
        productos: [{ nombre: 'Shake verde', cantidad: 2, precio: 10 }],
      },
      {
        id: '2320',
        fecha: '15/07/2026',
        estado: 'Entregado',
        productos: [{ nombre: 'Té de limón', cantidad: 3, precio: 6 }],
      },
    ],
  },
  {
    id: 'C002',
    nombre: 'Pedro Juan Martínez',
    telefono: '7668-9936',
    direccion: 'San Salvador, San Salvador',
    fechaRegistro: '04/2026',
    comentario: 'Llamar antes de realizar la entrega.',
    compras: [
      {
        id: '87338',
        fecha: '22/08/2026',
        estado: 'En preparación',
        productos: [
          { nombre: 'Crema rejuvenecedora', cantidad: 1, precio: 15 },
          { nombre: 'Té de frambuesa', cantidad: 2, precio: 7.5 },
        ],
      },
    ],
  },
  {
    id: 'C003',
    nombre: 'María López',
    telefono: '7123-4567',
    direccion: 'Santa Tecla, La Libertad',
    fechaRegistro: '06/2026',
    comentario: 'Puede recibir pedidos durante la tarde.',
    compras: [],
  },
];

const money = (value: number) => `$${value.toFixed(2)}`;

export default function ClientesScreen({ onRegresar }: ClientesScreenProps) {
  // Controla las tres vistas del módulo y los registros seleccionados.
  const [vista, setVista] = useState<Vista>('clientes');
  const [busqueda, setBusqueda] = useState('');
  const [busquedaAplicada, setBusquedaAplicada] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [compraSeleccionada, setCompraSeleccionada] = useState<Compra | null>(null);

  const clientesFiltrados = useMemo(() => {
    const texto = busquedaAplicada.trim().toLowerCase();

    if (!texto) {
      return clientes;
    }

    return clientes.filter((cliente) =>
      cliente.nombre.toLowerCase().includes(texto),
    );
  }, [busquedaAplicada]);

  const regresarAlMenu = () => {
    if (onRegresar) {
      onRegresar();
      return;
    }

    router.replace('/');
  };

  const abrirHistorial = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setCompraSeleccionada(null);
    setVista('historial');
  };

  const abrirDetalle = (compra: Compra) => {
    setCompraSeleccionada(compra);
    setVista('detalle');
  };

  if (vista === 'detalle' && clienteSeleccionado && compraSeleccionada) {
    const total = compraSeleccionada.productos.reduce(
      (suma, producto) => suma + producto.precio * producto.cantidad,
      0,
    );

    return (
      <ScreenContainer>
        <Text style={styles.title}>Compra #{compraSeleccionada.id}</Text>
        <Text style={styles.subtitle}>{clienteSeleccionado.nombre}</Text>

        <View style={styles.card}>
          <InfoRow label="Fecha" value={compraSeleccionada.fecha} />
          <InfoRow label="Estado" value={compraSeleccionada.estado} />

          <Text style={styles.sectionTitle}>Productos</Text>

          {compraSeleccionada.productos.map((producto) => (
            <View key={producto.nombre} style={styles.productRow}>
              <View style={styles.productInformation}>
                <Text style={styles.productName}>{producto.nombre}</Text>
                <Text style={styles.mutedText}>
                  {producto.cantidad} × {money(producto.precio)}
                </Text>
              </View>
              <Text style={styles.productTotal}>
                {money(producto.cantidad * producto.precio)}
              </Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{money(total)}</Text>
          </View>
        </View>

        <SecondaryButton
          text="Regresar al historial"
          onPress={() => setVista('historial')}
        />
      </ScreenContainer>
    );
  }

  if (vista === 'historial' && clienteSeleccionado) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>Historial de compras</Text>
        <Text style={styles.subtitle}>{clienteSeleccionado.nombre}</Text>

        <View style={styles.card}>
          {clienteSeleccionado.compras.length === 0 ? (
            <Text style={styles.emptyText}>Este cliente todavía no tiene compras.</Text>
          ) : (
            clienteSeleccionado.compras.map((compra) => (
              <TouchableOpacity
                key={compra.id}
                style={styles.purchaseRow}
                activeOpacity={0.75}
                onPress={() => abrirDetalle(compra)}>
                <View>
                  <Text style={styles.purchaseTitle}>Compra #{compra.id}</Text>
                  <Text style={styles.mutedText}>{compra.fecha}</Text>
                </View>
                <View style={styles.purchaseRight}>
                  <Text style={styles.statusText}>{compra.estado}</Text>
                  <Text style={styles.viewDetailText}>Ver detalle ›</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <SecondaryButton
          text="Regresar a clientes"
          onPress={() => setVista('clientes')}
        />
      </ScreenContainer>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topShape} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Clientes</Text>
          <Text style={styles.subtitle}>Busca y consulta el historial de compras.</Text>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Nombre del cliente"
              placeholderTextColor="#737373"
              value={busqueda}
              onChangeText={setBusqueda}
              onSubmitEditing={() => setBusquedaAplicada(busqueda)}
              returnKeyType="search"
            />

            <TouchableOpacity
              style={styles.searchButton}
              activeOpacity={0.8}
              onPress={() => setBusquedaAplicada(busqueda)}>
              <Text style={styles.searchButtonText}>Buscar</Text>
            </TouchableOpacity>
          </View>

          {busquedaAplicada.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setBusqueda('');
                setBusquedaAplicada('');
              }}>
              <Text style={styles.clearButtonText}>Limpiar búsqueda</Text>
            </TouchableOpacity>
          )}

          {clientesFiltrados.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.emptyText}>
                No encontramos un cliente con ese nombre.
              </Text>
            </View>
          ) : (
            clientesFiltrados.map((cliente) => (
              <View key={cliente.id} style={styles.card}>
                <Text style={styles.clientName}>{cliente.nombre}</Text>
                <InfoRow label="Código" value={cliente.id} />
                <InfoRow label="Teléfono" value={cliente.telefono} />
                <InfoRow label="Dirección" value={cliente.direccion} />
                <InfoRow label="Registro" value={cliente.fechaRegistro} />
                <InfoRow
                  label="Compras"
                  value={String(cliente.compras.length)}
                />
                <InfoRow label="Comentario" value={cliente.comentario} />

                <TouchableOpacity
                  style={styles.primaryButton}
                  activeOpacity={0.8}
                  onPress={() => abrirHistorial(cliente)}>
                  <Text style={styles.primaryButtonText}>Historial de compras</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <SecondaryButton text="Regresar al menú" onPress={regresarAlMenu} />
        </ScrollView>

        <View style={styles.bottomShape} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ScreenContainer({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topShape} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {children}
      </ScrollView>
      <View style={styles.bottomShape} />
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SecondaryButton({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.secondaryButton}
      activeOpacity={0.8}
      onPress={onPress}>
      <Text style={styles.secondaryButtonText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EBE5D8',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 125,
  },
  topShape: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 105,
    backgroundColor: '#A3B18A',
    borderBottomRightRadius: 85,
    opacity: 0.65,
  },
  bottomShape: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: 90,
    backgroundColor: '#A3B18A',
    borderTopLeftRadius: 80,
    opacity: 0.65,
  },
  title: {
    zIndex: 1,
    marginTop: 8,
    color: '#1A1A1A',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    zIndex: 1,
    marginTop: 6,
    marginBottom: 24,
    color: '#4F5B52',
    fontSize: 15,
    textAlign: 'center',
  },
  searchRow: {
    zIndex: 1,
    width: '100%',
    maxWidth: 650,
    flexDirection: 'row',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#C7CFC1',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    color: '#1A1A1A',
    fontSize: 16,
  },
  searchButton: {
    minHeight: 48,
    justifyContent: 'center',
    marginLeft: 10,
    borderRadius: 14,
    backgroundColor: '#55732F',
    paddingHorizontal: 18,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  clearButtonText: {
    color: '#55732F',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    zIndex: 1,
    width: '100%',
    maxWidth: 650,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#D2D7CE',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 18,
  },
  clientName: {
    marginBottom: 12,
    color: '#355222',
    fontSize: 21,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E7E1',
  },
  infoLabel: {
    width: '32%',
    color: '#687069',
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    width: '65%',
    color: '#252925',
    fontSize: 14,
    textAlign: 'right',
  },
  primaryButton: {
    alignItems: 'center',
    marginTop: 18,
    borderRadius: 14,
    backgroundColor: '#55732F',
    paddingVertical: 13,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    zIndex: 1,
    width: '70%',
    maxWidth: 360,
    alignItems: 'center',
    marginTop: 24,
    borderRadius: 14,
    backgroundColor: '#8C8C98',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  purchaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D7DCD4',
  },
  purchaseTitle: {
    color: '#252925',
    fontSize: 17,
    fontWeight: 'bold',
  },
  purchaseRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  statusText: {
    color: '#55732F',
    fontSize: 13,
    fontWeight: 'bold',
  },
  viewDetailText: {
    marginTop: 4,
    color: '#7A817B',
    fontSize: 13,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 5,
    color: '#355222',
    fontSize: 18,
    fontWeight: 'bold',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D7DCD4',
  },
  productInformation: {
    flex: 1,
  },
  productName: {
    color: '#252925',
    fontSize: 16,
    fontWeight: '600',
  },
  productTotal: {
    marginLeft: 12,
    color: '#252925',
    fontSize: 15,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  totalLabel: {
    color: '#252925',
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#355222',
    fontSize: 20,
    fontWeight: 'bold',
  },
  mutedText: {
    marginTop: 3,
    color: '#747B75',
    fontSize: 13,
  },
  emptyText: {
    color: '#636A64',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
