import React, { useEffect, useState } from "react";
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
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface CompraItem {
  id: string;
  cliente: string;
  detalle: string;
  total: number;
}

export default function ComprasScreen() {
  const [compras, setCompras] = useState<CompraItem[]>([]);
  const [cliente, setCliente] = useState("");
  const [detalle, setDetalle] = useState("");
  const [total, setTotal] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "compras"), orderBy("cliente", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rows: CompraItem[] = snapshot.docs.map((d) => ({
        id: d.id,
        cliente: String(d.data().cliente ?? ""),
        detalle: String(d.data().detalle ?? ""),
        total: Number(d.data().total ?? 0),
      }));
      setCompras(rows);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const registrarCompra = async () => {
    const monto = Number(total);
    if (!cliente.trim() || !detalle.trim() || Number.isNaN(monto) || monto <= 0) {
      Alert.alert("Datos incompletos", "Ingresa cliente, detalle y total mayor que 0.");
      return;
    }

    try {
      await addDoc(collection(db, "compras"), {
        cliente: cliente.trim(),
        detalle: detalle.trim(),
        total: monto,
        creadoEn: serverTimestamp(),
      });
      setCliente("");
      setDetalle("");
      setTotal("");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo registrar la compra.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Compras</Text>
      <TextInput
        style={styles.input}
        placeholder="Cliente"
        value={cliente}
        onChangeText={setCliente}
      />
      <TextInput
        style={styles.input}
        placeholder="Productos / Detalle de compra"
        value={detalle}
        onChangeText={setDetalle}
      />
      <TextInput
        style={styles.input}
        placeholder="Total (USD)"
        keyboardType="numeric"
        value={total}
        onChangeText={setTotal}
      />
      <TouchableOpacity style={styles.btn} onPress={registrarCompra}>
        <Text style={styles.btnText}>Registrar Compra</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={compras}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.cliente}</Text>
                <Text>{item.detalle} • Total: ${item.total.toFixed(2)}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteDoc(doc(db, "compras", item.id))}>
                <Text style={styles.del}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F6F5F0" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
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
    marginBottom: 12,
  },
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
  del: { color: "#B02A37", fontWeight: "600" },
});