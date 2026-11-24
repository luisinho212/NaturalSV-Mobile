import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../config/firebase";

export interface UsuarioItem {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  activo: boolean;
}

interface UsuariosScreenProps {
  onVolver?: () => void;
}

export default function UsuariosScreen({ onVolver }: UsuariosScreenProps) {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("Operador");
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "usuarios"), orderBy("nombre", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rows: UsuarioItem[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            nombre: String(data.nombre ?? ""),
            correo: String(data.correo ?? ""),
            rol: String(data.rol ?? "Operador"),
            activo: Boolean(data.activo ?? true),
          };
        });
        setUsuarios(rows);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        Alert.alert("Error", "No se pudieron cargar los usuarios.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const limpiarFormulario = () => {
    setNombre("");
    setCorreo("");
    setRol("Operador");
    setEditId(null);
  };

  const guardarUsuario = async () => {
    if (!nombre.trim() || !correo.trim()) {
      Alert.alert("Campos requeridos", "Ingresa nombre y correo.");
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        await updateDoc(doc(db, "usuarios", editId), {
          nombre: nombre.trim(),
          correo: correo.trim().toLowerCase(),
          rol: rol.trim() || "Operador",
        });
        Alert.alert("Éxito", "Usuario actualizado correctamente.");
      } else {
        await addDoc(collection(db, "usuarios"), {
          nombre: nombre.trim(),
          correo: correo.trim().toLowerCase(),
          rol: rol.trim() || "Operador",
          activo: true,
          creadoEn: serverTimestamp(),
        });
        Alert.alert("Éxito", "Usuario agregado correctamente.");
      }
      limpiarFormulario();
    } catch (err: unknown) {
      console.error(err);
      Alert.alert("Error", "No se pudo guardar el usuario.");
    } finally {
      setSaving(false);
    }
  };

  const eliminarUsuario = async (id: string) => {
    try {
      await deleteDoc(doc(db, "usuarios", id));
      Alert.alert("Éxito", "Usuario eliminado.");
    } catch (err: unknown) {
      console.error(err);
      Alert.alert("Error", "No se pudo eliminar el usuario.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Usuarios</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        placeholderTextColor="#8C8C98"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#8C8C98"
        keyboardType="email-address"
        autoCapitalize="none"
        value={correo}
        onChangeText={setCorreo}
      />
      <TextInput
        style={styles.input}
        placeholder="Rol (Ej. Administrador, Operador)"
        placeholderTextColor="#8C8C98"
        value={rol}
        onChangeText={setRol}
      />

      <TouchableOpacity
        style={styles.btn}
        onPress={guardarUsuario}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.btnText}>
            {editId ? "Actualizar Usuario" : "Agregar Usuario"}
          </Text>
        )}
      </TouchableOpacity>

      {editId && (
        <TouchableOpacity
          style={[styles.btn, styles.cancelBtn]}
          onPress={limpiarFormulario}
        >
          <Text style={styles.btnText}>Cancelar Edición</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#3E5F2A" />
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.nombre}</Text>
                <Text>
                  {item.correo} · {item.rol}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setEditId(item.id);
                  setNombre(item.nombre);
                  setCorreo(item.correo);
                  setRol(item.rol);
                }}
              >
                <Text style={styles.edit}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => eliminarUsuario(item.id)}>
                <Text style={styles.del}>Borrar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {onVolver && (
        <TouchableOpacity
          style={[styles.btn, styles.backBtn]}
          onPress={onVolver}
        >
          <Text style={styles.btnText}>Regresar al Menú</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F6F5F0" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12, color: "#333" },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  btn: {
    backgroundColor: "#3E5F2A",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  cancelBtn: { backgroundColor: "#6C757D" },
  backBtn: { backgroundColor: "#8C8C98", marginTop: 10 },
  btnText: { color: "#FFF", fontWeight: "700" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 10,
  },
  name: { fontWeight: "700", fontSize: 15 },
  edit: { color: "#1E56A0", fontWeight: "600" },
  del: { color: "#B02A37", fontWeight: "600" },
});