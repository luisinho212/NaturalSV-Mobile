import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * Se conserva 'purchases', la colección que ya usa NaturalSV-Mobile.
 * La pantalla web /integracion utiliza exactamente el mismo esquema.
 */
const COLECCION = 'purchases';

interface Compra {
  id: string;
  cliente: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  userId: string;
  fecha: Date | null;
}

function numeroValido(value: unknown, respaldo = 0): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : respaldo;
}

function fechaDesdeFirestore(value: unknown): Date | null {
  if (!value) return null;
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    const fecha = value.toDate();
    return fecha instanceof Date && !Number.isNaN(fecha.getTime()) ? fecha : null;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const fecha = new Date(value);
    return Number.isNaN(fecha.getTime()) ? null : fecha;
  }
  return null;
}

function mapearCompra(id: string, data: DocumentData): Compra {
  // Documentos anteriores guardaban 'descripcion', 'total' y 'timestamp' ISO.
  const total = numeroValido(data.total);
  const cantidad = numeroValido(data.cantidad, 1) > 0 ? numeroValido(data.cantidad, 1) : 1;
  return {
    id,
    cliente: String(data.cliente ?? 'Sin cliente especificado'),
    descripcion: String(data.descripcion ?? data.detalle ?? ''),
    cantidad,
    precioUnitario: numeroValido(data.precioUnitario, total / cantidad),
    total,
    userId: String(data.userId ?? ''),
    fecha: fechaDesdeFirestore(data.creadoEn ?? data.timestamp),
  };
}

function notificar(titulo: string, mensaje: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(`${titulo}: ${mensaje}`);
  } else {
    Alert.alert(titulo, mensaje);
  }
}

export default function ComprasScreen({ onRegresar }: { onRegresar: () => void }) {
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [cliente, setCliente] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelarCompras: (() => void) | undefined;
    const cancelarAuth = onAuthStateChanged(auth, (user) => {
      cancelarCompras?.();
      cancelarCompras = undefined;
      setUsuarioId(user?.uid ?? null);
      setCompras([]);
      setError('');
      if (!user) {
        setCargando(false);
        setError('Inicia sesión para consultar y registrar compras.');
        return;
      }
      setCargando(true);
      // El filtro por usuario es consistente con los registros existentes.
      const consulta = query(collection(db, COLECCION), where('userId', '==', user.uid));
      cancelarCompras = onSnapshot(
        consulta,
        (snapshot) => {
          const filas = snapshot.docs.map((registro) => mapearCompra(registro.id, registro.data()));
          filas.sort((a, b) => (b.fecha?.getTime() ?? 0) - (a.fecha?.getTime() ?? 0));
          setCompras(filas);
          setCargando(false);
          setError('');
        },
        (err) => {
          setError(`No se pudieron cargar las compras: ${err.message}`);
          setCargando(false);
        },
      );
    });
    return () => {
      cancelarCompras?.();
      cancelarAuth();
    };
  }, []);

  const totalCalculado = useMemo(() => {
    const unidades = Number(cantidad);
    const precio = Number(precioUnitario);
    if (!cantidad.trim() || !precioUnitario.trim() || !Number.isFinite(unidades) || !Number.isFinite(precio)) {
      return 0;
    }
    const precioEnCentavos = Math.round(precio * 100) / 100;
    return Math.round(unidades * precioEnCentavos * 100) / 100;
  }, [cantidad, precioUnitario]);

  function limpiar() {
    setCliente('');
    setDescripcion('');
    setCantidad('1');
    setPrecioUnitario('');
    setEditandoId(null);
  }

  function editar(item: Compra) {
    setEditandoId(item.id);
    setCliente(item.cliente === 'Sin cliente especificado' ? '' : item.cliente);
    setDescripcion(item.descripcion);
    setCantidad(String(item.cantidad));
    setPrecioUnitario(String(item.precioUnitario));
    setError('');
  }

  async function guardarCompra() {
    if (guardando) return;
    const unidades = Number(cantidad);
    const precio = Number(precioUnitario);
    if (!usuarioId) {
      notificar('Sesión requerida', 'Debes iniciar sesión antes de guardar.');
      return;
    }
    if (!cliente.trim() || !descripcion.trim()) {
      notificar('Campos requeridos', 'Ingresa el cliente y el detalle de la compra.');
      return;
    }
    if (!cantidad.trim() || !Number.isInteger(unidades) || unidades <= 0) {
      notificar('Cantidad inválida', 'La cantidad debe ser un entero mayor que cero.');
      return;
    }
    if (!precioUnitario.trim() || !Number.isFinite(precio) || Math.round(precio * 100) / 100 <= 0 || totalCalculado <= 0) {
      notificar('Precio inválido', 'Ingresa un precio unitario válido, mayor que cero.');
      return;
    }
    if (unidades > 100000 || totalCalculado > 100000000) {
      notificar('Importe inválido', 'La cantidad o el total supera el límite permitido.');
      return;
    }
    setGuardando(true);
    setError('');
    const datos = {
      cliente: cliente.trim(),
      descripcion: descripcion.trim(),
      detalle: descripcion.trim(),
      cantidad: unidades,
      precioUnitario: Math.round(precio * 100) / 100,
      total: totalCalculado,
      userId: usuarioId,
    };
    try {
      if (editandoId) {
        const existente = compras.find((item) => item.id === editandoId);
        if (!existente || existente.userId !== usuarioId) {
          throw new Error('No se puede modificar una compra de otra cuenta.');
        }
        await updateDoc(doc(db, COLECCION, editandoId), {
          ...datos,
          actualizadoEn: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, COLECCION), {
          ...datos,
          creadoEn: serverTimestamp(),
          // Compatibilidad con los registros anteriores de NaturalSV-Mobile.
          timestamp: new Date().toISOString(),
        });
      }
      limpiar();
      notificar('Éxito', editandoId ? 'Compra actualizada.' : 'Compra registrada en Firestore.');
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error desconocido';
      setError(`No se pudo guardar la compra: ${mensaje}`);
      notificar('Error', mensaje);
    } finally {
      setGuardando(false);
    }
  }

  function eliminarCompra(item: Compra) {
    async function confirmarEliminacion() {
      if (!usuarioId || item.userId !== usuarioId) return;
      try {
        await deleteDoc(doc(db, COLECCION, item.id));
        if (editandoId === item.id) limpiar();
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : 'No se pudo eliminar';
        setError(mensaje);
        notificar('Error', mensaje);
      }
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm('¿Eliminar esta compra permanentemente?')) {
        void confirmarEliminacion();
      }
    } else {
      Alert.alert('Confirmar eliminación', '¿Eliminar esta compra permanentemente?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => void confirmarEliminacion() },
      ]);
    }
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
      data={compras}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>Gestión de Compras</Text>
          <Text style={styles.intro}>Registra y consulta compras sincronizadas con Firebase.</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre del cliente"
            value={cliente}
            onChangeText={setCliente}
            accessibilityLabel="Nombre del cliente"
          />
          <TextInput
            style={styles.input}
            placeholder="Producto o detalle de la compra"
            value={descripcion}
            onChangeText={setDescripcion}
            accessibilityLabel="Detalle de compra"
          />
          <View style={styles.fila}>
            <TextInput
              style={[styles.input, styles.mitad]}
              placeholder="Cantidad"
              keyboardType="number-pad"
              value={cantidad}
              onChangeText={setCantidad}
              accessibilityLabel="Cantidad"
            />
            <TextInput
              style={[styles.input, styles.mitad]}
              placeholder="Precio unitario ($)"
              keyboardType="decimal-pad"
              value={precioUnitario}
              onChangeText={setPrecioUnitario}
              accessibilityLabel="Precio unitario"
            />
          </View>
          <Text style={styles.total}>Total calculado: ${totalCalculado.toFixed(2)}</Text>
          <TouchableOpacity
            style={[styles.button, (guardando || !usuarioId) && styles.deshabilitado]}
            disabled={guardando || !usuarioId}
            onPress={() => void guardarCompra()}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>
              {guardando ? 'Guardando...' : editandoId ? 'Actualizar compra' : 'Registrar compra'}
            </Text>
          </TouchableOpacity>
          {editandoId ? (
            <TouchableOpacity style={styles.secundario} onPress={limpiar}>
              <Text style={styles.secundarioTexto}>Cancelar edición</Text>
            </TouchableOpacity>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.subtitle}>Historial de compras ({compras.length})</Text>
          {cargando ? <ActivityIndicator size="large" color="#3E5F2A" /> : null}
        </View>
      }
      ListEmptyComponent={!cargando ? <Text style={styles.vacio}>No hay compras registradas para esta cuenta.</Text> : null}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{item.cliente}</Text>
          <Text style={styles.detalle}>{item.descripcion}</Text>
          <Text style={styles.detalle}>{item.cantidad} × ${item.precioUnitario.toFixed(2)} = ${item.total.toFixed(2)}</Text>
          <Text style={styles.fecha}>Fecha: {item.fecha ? item.fecha.toLocaleDateString('es-SV') : 'No disponible'}</Text>
          <View style={styles.acciones}>
            <TouchableOpacity onPress={() => editar(item)} style={styles.accion}>
              <Text style={styles.editar}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => eliminarCompra(item)} style={styles.accion}>
              <Text style={styles.eliminar}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListFooterComponent={
        <TouchableOpacity style={[styles.button, styles.regresar]} onPress={onRegresar}>
          <Text style={styles.buttonText}>Regresar al menú</Text>
        </TouchableOpacity>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F5F0' },
  contenido: { padding: 18, paddingBottom: 40 },
  title: { fontSize: 25, fontWeight: '700', color: '#31502D', marginBottom: 6 },
  intro: { fontSize: 14, color: '#536353', marginBottom: 20 },
  subtitle: { fontSize: 19, fontWeight: '700', color: '#31502D', marginTop: 24, marginBottom: 12 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#D0D9CB', borderRadius: 10, padding: 13, marginBottom: 11, color: '#263726' },
  fila: { flexDirection: 'row', gap: 10 },
  mitad: { flex: 1, minWidth: 0 },
  total: { fontSize: 18, fontWeight: '700', color: '#31502D', marginBottom: 14 },
  button: { backgroundColor: '#3E5F2A', padding: 15, borderRadius: 11, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 15 },
  deshabilitado: { opacity: 0.55 },
  secundario: { padding: 12, alignItems: 'center' },
  secundarioTexto: { color: '#31502D', fontWeight: '600' },
  error: { color: '#AE253A', marginTop: 10, fontSize: 13 },
  vacio: { color: '#596859', paddingVertical: 18, textAlign: 'center' },
  card: { padding: 15, backgroundColor: 'white', borderRadius: 11, marginBottom: 10, borderWidth: 1, borderColor: '#DFE6DA' },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#31502D', marginBottom: 5 },
  detalle: { color: '#334134', marginBottom: 4 },
  fecha: { color: '#667466', marginTop: 3, fontSize: 12 },
  acciones: { flexDirection: 'row', gap: 20, marginTop: 10 },
  accion: { paddingVertical: 4 },
  editar: { color: '#245CB4', fontWeight: '700' },
  eliminar: { color: '#AF2933', fontWeight: '700' },
  regresar: { backgroundColor: '#7C817B', marginTop: 20 },
});
