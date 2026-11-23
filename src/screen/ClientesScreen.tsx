
import React, { useEffect, useState } from 'react';

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

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '../config/firebase';

type Cliente = {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string;
  correo?: string;
  userId: string;
  fechaRegistro?: string;
};

export default function ClientesScreen({
  onVolver,
}: {
  onVolver: () => void;
}) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [verificandoSesion, setVerificandoSesion] = useState(true);

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [correo, setCorreo] = useState('');

  const [editId, setEditId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState('');

  const notificar = (titulo: string, detalle: string) => {
    setMensaje(`${titulo}: ${detalle}`);

    if (Platform.OS !== 'web') {
      Alert.alert(titulo, detalle);
    }
  };

  // 1. Verificar autenticacion
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setVerificandoSesion(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Consultar clientes en tiempo real
  useEffect(() => {
    if (!usuario) {
      setClientes([]);
      setCargando(false);
      return;
    }

    setCargando(true);

    const consulta = query(
      collection(db, 'clients'),
      where('userId', '==', usuario.uid)
    );

    const unsubscribe = onSnapshot(
      consulta,
      (snapshot) => {
        const lista: Cliente[] = snapshot.docs.map((documento) => {
          const data = documento.data();

          return {
            id: documento.id,
            nombre: String(data.nombre ?? ''),
            telefono: String(data.telefono ?? ''),
            direccion: String(data.direccion ?? ''),
            correo: String(data.correo ?? ''),
            userId: String(data.userId ?? ''),
            fechaRegistro: String(data.fechaRegistro ?? ''),
          };
        });

        lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
        setClientes(lista);
        setCargando(false);
      },
      (error) => {
        console.error('Error consultando clientes:', error);
        setCargando(false);
        notificar('Error', error.message);
      }
    );

    return () => unsubscribe();
  }, [usuario]);

  // 3. Limpiar formulario
  const limpiarFormulario = () => {
    setNombre('');
    setTelefono('');
    setDireccion('');
    setCorreo('');
    setEditId(null);
  };

  // 4. Registrar o actualizar cliente
  const guardarCliente = async () => {
    const nombreLimpio = nombre.trim();
    const telefonoLimpio = telefono.trim();
    const direccionLimpia = direccion.trim();
    const correoLimpio = correo.trim().toLowerCase();

    if (!nombreLimpio || !telefonoLimpio || !direccionLimpia) {
      notificar(
        'Campos requeridos',
        'Ingresa nombre, telefono y direccion.'
      );
      return;
    }

    if (!/^[0-9+\s()-]{7,20}$/.test(telefonoLimpio)) {
      notificar('Telefono invalido', 'Verifica el numero telefonico.');
      return;
    }

    if (
      correoLimpio &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)
    ) {
      notificar('Correo invalido', 'Ingresa un correo valido.');
      return;
    }

    if (!usuario) {
      notificar('Error', 'Debes iniciar sesion primero.');
      return;
    }

    setGuardando(true);
    setMensaje('');

    try {
      const datos = {
        nombre: nombreLimpio,
        telefono: telefonoLimpio,
        direccion: direccionLimpia,
        correo: correoLimpio,
      };

      if (editId) {
        await updateDoc(doc(db, 'clients', editId), datos);
        notificar('Exito', 'Cliente actualizado correctamente.');
      } else {
        await addDoc(collection(db, 'clients'), {
          ...datos,
          userId: usuario.uid,
          fechaRegistro: new Date().toISOString(),
        });

        notificar('Exito', 'Cliente registrado correctamente.');
      }

      limpiarFormulario();
    } catch (error: any) {
      console.error('Error guardando cliente:', error);
      notificar('Error', error.message);
    } finally {
      setGuardando(false);
    }
  };

  // 5. Cargar cliente para editar
  const editarCliente = (cliente: Cliente) => {
    setEditId(cliente.id);
    setNombre(cliente.nombre);
    setTelefono(cliente.telefono);
    setDireccion(cliente.direccion);
    setCorreo(cliente.correo ?? '');
    setMensaje('');
  };

  // 6. Eliminar cliente en Firestore
  const eliminarCliente = async (id: string) => {
    if (!usuario) {
      notificar('Error', 'Debes iniciar sesion primero.');
      return;
    }

    setEliminandoId(id);

    try {
      await deleteDoc(doc(db, 'clients', id));

      if (editId === id) {
        limpiarFormulario();
      }

      notificar('Exito', 'Cliente eliminado correctamente.');
    } catch (error: any) {
      console.error('Error eliminando cliente:', error);
      notificar('Error', error.message);
    } finally {
      setEliminandoId(null);
    }
  };

  // 7. Confirmacion antes de eliminar
  const confirmarEliminar = (cliente: Cliente) => {
    if (Platform.OS === 'web') {
      if (
        typeof window !== 'undefined' &&
        window.confirm(`¿Eliminar al cliente ${cliente.nombre}?`)
      ) {
        void eliminarCliente(cliente.id);
      }
      return;
    }

    Alert.alert(
      'Eliminar cliente',
      `¿Deseas eliminar a ${cliente.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => void eliminarCliente(cliente.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion de Clientes</Text>

      {verificandoSesion ? (
        <ActivityIndicator color="#3E5F2A" />
      ) : usuario ? (
        <Text style={styles.estado}>
          Usuario: {usuario.email || usuario.uid}
        </Text>
      ) : (
        <Text style={styles.aviso}>
          Inicia sesion para gestionar clientes.
        </Text>
      )}

      <Text style={styles.subtitle}>
        {editId ? 'Editar cliente' : 'Registrar cliente'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del cliente"
        value={nombre}
        onChangeText={setNombre}
        editable={!guardando}
      />

      <TextInput
        style={styles.input}
        placeholder="Telefono"
        keyboardType="phone-pad"
        value={telefono}
        onChangeText={setTelefono}
        editable={!guardando}
      />

      <TextInput
        style={styles.input}
        placeholder="Direccion"
        value={direccion}
        onChangeText={setDireccion}
        editable={!guardando}
      />

      <TextInput
        style={styles.input}
        placeholder="Correo electronico (opcional)"
        keyboardType="email-address"
        autoCapitalize="none"
        value={correo}
        onChangeText={setCorreo}
        editable={!guardando}
      />

      <TouchableOpacity
        style={[
          styles.button,
          (guardando || !usuario) && styles.disabled,
        ]}
        onPress={guardarCliente}
        disabled={guardando || !usuario}
      >
        <Text style={styles.buttonText}>
          {guardando
            ? 'Guardando...'
            : editId
              ? 'Actualizar cliente'
              : 'Guardar cliente'}
        </Text>
      </TouchableOpacity>

      {editId && (
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => {
            limpiarFormulario();
            setMensaje('');
          }}
          disabled={guardando}
        >
          <Text style={styles.buttonText}>Cancelar edicion</Text>
        </TouchableOpacity>
      )}

      {mensaje !== '' && (
        <Text style={styles.mensaje}>{mensaje}</Text>
      )}

      <Text style={styles.subtitle}>Clientes registrados</Text>

      {cargando ? (
        <ActivityIndicator size="large" color="#3E5F2A" />
      ) : (
        <FlatList
          style={styles.lista}
          data={clientes}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.vacio}>
              No hay clientes registrados.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.nombre}</Text>
              <Text>Telefono: {item.telefono}</Text>
              <Text>Direccion: {item.direccion}</Text>

              {!!item.correo && (
                <Text>Correo: {item.correo}</Text>
              )}

              <View style={styles.acciones}>
                <TouchableOpacity
                  onPress={() => editarCliente(item)}
                  disabled={guardando || eliminandoId !== null}
                >
                  <Text style={styles.editar}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => confirmarEliminar(item)}
                  disabled={guardando || eliminandoId !== null}
                >
                  <Text style={styles.eliminar}>
                    {eliminandoId === item.id
                      ? 'Eliminando...'
                      : 'Eliminar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={[styles.button, styles.backButton]}
        onPress={onVolver}
      >
        <Text style={styles.buttonText}>Regresar al menu</Text>
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
    fontSize: 23,
    fontWeight: 'bold',
    color: '#3E5F2A',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3E5F2A',
    marginVertical: 12,
  },
  estado: {
    color: '#2A6B3C',
    marginBottom: 8,
  },
  aviso: {
    color: '#B45309',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FFF',
    padding: 11,
    borderRadius: 10,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: '#A3B18A',
  },
  button: {
    backgroundColor: '#3E5F2A',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 9,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.5,
  },
  cancelButton: {
    backgroundColor: '#B45309',
  },
  backButton: {
    backgroundColor: '#8C8C98',
    marginTop: 10,
  },
  lista: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#3E5F2A',
    marginBottom: 5,
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
  mensaje: {
    color: '#333',
    marginVertical: 8,
    textAlign: 'center',
  },
  vacio: {
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
});
