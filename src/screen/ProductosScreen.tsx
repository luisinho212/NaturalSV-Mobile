
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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
} from 'firebase/firestore';

import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '../config/firebase';

type Producto = {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  userId: string;
};

export default function ProductosScreen({
  onRegresar,
}: {
  onRegresar: () => void;
}) {
  const [vista, setVista] = useState<'inventario' | 'formulario' | 'existencias'>('inventario');
  const [usuario, setUsuario] = useState<User | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);

  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const notificar = (titulo: string, detalle: string) => {
    setMensaje(`${titulo}: ${detalle}`);
    if (Platform.OS !== 'web') {
      Alert.alert(titulo, detalle);
    }
  };

  // Detectar la sesión de Firebase
  useEffect(() => {
    return onAuthStateChanged(auth, setUsuario);
  }, []);

  // Escuchar los productos del usuario en tiempo real
  useEffect(() => {
    if (!usuario) {
      setProductos([]);
      setCargando(false);
      return;
    }

    setCargando(true);

    const consulta = query(
      collection(db, 'products'),
      where('userId', '==', usuario.uid)
    );

    const unsubscribe = onSnapshot(
      consulta,
      (snapshot) => {
        const lista: Producto[] = snapshot.docs.map((documento) => {
          const data = documento.data();
          return {
            id: documento.id,
            nombre: String(data.nombre ?? ''),
            precio: Number(data.precio ?? 0),
            stock: Number(data.stock ?? 0),
            userId: String(data.userId ?? ''),
          };
        });

        lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
        setProductos(lista);
        setCargando(false);
      },
      (error) => {
        console.error('Error consultando productos:', error);
        notificar('Error', error.message);
        setCargando(false);
      }
    );

    return () => unsubscribe();
  }, [usuario]);

  const limpiarFormulario = () => {
    setNombre('');
    setPrecio('');
    setStock('');
    setEditId(null);
    setMensaje('');
  };

  const nuevoProducto = () => {
    limpiarFormulario();
    setVista('formulario');
  };

  const editarProducto = (producto: Producto) => {
    setEditId(producto.id);
    setNombre(producto.nombre);
    setPrecio(String(producto.precio));
    setStock(String(producto.stock));
    setMensaje('');
    setVista('formulario');
  };

  const guardarProducto = async () => {
    const precioTexto = precio.trim();
    const stockTexto = stock.trim();

    const precioNumero = Number(precioTexto);
    const stockNumero = Number(stockTexto);

    if (!nombre.trim() || !precioTexto || !stockTexto) {
      notificar('Atención', 'Completa todos los campos.');
      return;
    }

    if (!Number.isFinite(precioNumero) || precioNumero <= 0) {
      notificar('Error', 'El precio debe ser mayor que cero.');
      return;
    }

    if (
      !Number.isSafeInteger(stockNumero) ||
      stockNumero < 0
    ) {
      notificar('Error', 'El stock debe ser un entero igual o mayor que cero.');
      return;
    }

    if (!usuario) {
      notificar('Error', 'Debes iniciar sesión primero.');
      return;
    }

    setGuardando(true);

    try {
      const datos = {
        nombre: nombre.trim(),
        precio: precioNumero,
        stock: stockNumero,
      };

      if (editId) {
        await updateDoc(doc(db, 'products', editId), datos);
      } else {
        await addDoc(collection(db, 'products'), {
          ...datos,
          userId: usuario.uid,
          creadoEn: serverTimestamp(),
        });
      }

      limpiarFormulario();
      setVista('existencias');
      notificar('Éxito', 'Producto guardado correctamente.');
    } catch (error: any) {
      console.error('Error guardando producto:', error);
      notificar('Error', error.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarProducto = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      notificar('Éxito', 'Producto eliminado correctamente.');
    } catch (error: any) {
      console.error('Error eliminando producto:', error);
      notificar('Error', error.message);
    }
  };

  const confirmarEliminar = (producto: Producto) => {
    if (Platform.OS === 'web') {
      if (
        typeof window !== 'undefined' &&
        window.confirm(`¿Eliminar el producto ${producto.nombre}?`)
      ) {
        void eliminarProducto(producto.id);
      }
      return;
    }

    Alert.alert(
      'Eliminar producto',
      `¿Deseas eliminar ${producto.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => void eliminarProducto(producto.id),
        },
      ]
    );
  };

  const Boton = ({
    titulo,
    onPress,
    secundario = false,
    disabled = false,
  }: {
    titulo: string;
    onPress: () => void;
    secundario?: boolean;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.boton,
        secundario && styles.botonSecundario,
        disabled && styles.botonDeshabilitado,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.textoBoton}>{titulo}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>NaturalSV - Productos</Text>

      {vista === 'inventario' && (
        <View style={styles.contenido}>
          <Text style={styles.subtitulo}>Inventario de productos</Text>

          <Boton titulo="Ingresar producto" onPress={nuevoProducto} />

          <Boton
            titulo="Consultas y gestiones"
            onPress={() => {
              setMensaje('');
              setVista('existencias');
            }}
          />

          <Boton
            titulo="Regresar"
            secundario
            onPress={onRegresar}
          />
        </View>
      )}

      {vista === 'formulario' && (
        <View style={styles.contenido}>
          <Text style={styles.subtitulo}>
            {editId ? 'Editar producto' : 'Nuevo producto'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre del producto"
            value={nombre}
            onChangeText={setNombre}
          />

          <TextInput
            style={styles.input}
            placeholder="Precio en USD"
            keyboardType="decimal-pad"
            value={precio}
            onChangeText={setPrecio}
          />

          <TextInput
            style={styles.input}
            placeholder="Cantidad en existencia"
            keyboardType="number-pad"
            value={stock}
            onChangeText={setStock}
          />

          <Boton
            titulo={guardando ? 'Guardando...' : 'Guardar producto'}
            onPress={guardarProducto}
            disabled={guardando || !usuario}
          />

          <Boton
            titulo="Cancelar"
            secundario
            onPress={() => {
              limpiarFormulario();
              setVista('inventario');
            }}
          />
        </View>
      )}

      {vista === 'existencias' && (
        <View style={styles.listaContenedor}>
          <Text style={styles.subtitulo}>Productos registrados</Text>

          {cargando ? (
            <ActivityIndicator size="large" color="#3E5F2A" />
          ) : (
            <FlatList
              data={productos}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text style={styles.vacio}>
                  No hay productos registrados.
                </Text>
              }
              renderItem={({ item }) => (
                <View style={styles.tarjeta}>
                  <Text style={styles.nombre}>{item.nombre}</Text>
                  <Text>Precio: ${item.precio.toFixed(2)}</Text>
                  <Text>Stock: {item.stock}</Text>

                  <View style={styles.acciones}>
                    <TouchableOpacity onPress={() => editarProducto(item)}>
                      <Text style={styles.editar}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => confirmarEliminar(item)}>
                      <Text style={styles.eliminar}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}

          <Boton titulo="Agregar producto" onPress={nuevoProducto} />

          <Boton
            titulo="Regresar"
            secundario
            onPress={() => setVista('inventario')}
          />
        </View>
      )}

      {!usuario && !cargando && (
        <Text style={styles.aviso}>
          Inicia sesión para gestionar tus productos.
        </Text>
      )}

      {mensaje !== '' && (
        <Text style={styles.mensaje}>{mensaje}</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBE5D8',
    padding: 20,
  },
  titulo: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#3E5F2A',
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 25,
  },
  contenido: {
    width: '100%',
    alignItems: 'center',
  },
  listaContenedor: {
    flex: 1,
    width: '100%',
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#FFF',
    padding: 13,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#A3B18A',
  },
  boton: {
    backgroundColor: '#3E5F2A',
    width: '100%',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  botonSecundario: {
    backgroundColor: '#8C8C98',
  },
  botonDeshabilitado: {
    opacity: 0.5,
  },
  textoBoton: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tarjeta: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D5D5D5',
  },
  nombre: {
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 5,
    color: '#3E5F2A',
  },
  acciones: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  editar: {
    color: '#1E56A0',
    fontWeight: 'bold',
  },
  eliminar: {
    color: '#B02A37',
    fontWeight: 'bold',
  },
  vacio: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 25,
  },
  mensaje: {
    color: '#333',
    textAlign: 'center',
    marginTop: 12,
  },
  aviso: {
    color: '#B45309',
    textAlign: 'center',
    marginTop: 10,
  },
});
