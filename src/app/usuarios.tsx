import { useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
export default function UsuariosScreen({ onRegresar }: { onRegresar: () => void }) {
const [vista, setVista] = useState<'registrar' | 'gestion' | 'editar'>('registrar');
if (vista === 'registrar') {
return (
<SafeAreaView style={styles.container}>
<View style={styles.headerShape} />
<Text style={styles.title}>Registrar usuario</Text>
<View style={styles.inputBox}><Text
style={styles.inputText}>Nombre</Text></View>
<View style={styles.inputBox}><Text style={styles.inputText}>User</Text></View>
<View style={styles.inputBox}><Text
style={styles.inputText}>Password</Text></View>
<View style={styles.inputBox}><Text style={styles.inputText}>Rol ▼</Text></View>
<TouchableOpacity style={styles.btnSecondary} onPress={() =>
setVista('gestion')}>
<Text style={styles.btnSecondaryText}>Guardar</Text>
</TouchableOpacity>
<TouchableOpacity style={[styles.btnSecondary, { marginVertical: 8 }]} onPress={()=> setVista('gestion')}>
<Text style={styles.btnSecondaryText}>Gestionar</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.btnSecondary} onPress={onRegresar}>
<Text style={styles.btnSecondaryText}>Regresar</Text>
</TouchableOpacity>
<View style={styles.bottomShape} />
</SafeAreaView>
);
}
if (vista === 'gestion') {
return (
<SafeAreaView style={styles.container}>
<View style={styles.headerShape} />
<Text style={styles.title}>Gestion usuarios</Text>
<View style={styles.listCard}>
<Text style={styles.itemText}>Usuario 2</Text>
<Text style={styles.itemText}>Usuario 3</Text>
<Text style={styles.itemText}>Usuario 4</Text>
<Text style={styles.itemText}>Usuario 5</Text>
<Text style={styles.itemText}>Admin 1</Text>
<Text style={styles.itemText}>Admin 2</Text>
</View>
<TouchableOpacity style={styles.btnSecondary} onPress={() =>
setVista('registrar')}>
<Text style={styles.btnSecondaryText}>Guardar</Text>
</TouchableOpacity>
<TouchableOpacity style={[styles.btnSecondary, { marginVertical: 8 }]} onPress={()=> setVista('editar')}>
<Text style={styles.btnSecondaryText}>Modificar</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.btnSecondary} onPress={() =>
setVista('registrar')}>
<Text style={styles.btnSecondaryText}>Eliminar</Text>
</TouchableOpacity>
<TouchableOpacity style={[styles.btnSecondary, { marginTop: 8 }]} onPress={() =>
setVista('registrar')}>
<Text style={styles.btnSecondaryText}>Regresar</Text>
</TouchableOpacity>
<View style={styles.bottomShape} />
</SafeAreaView>
);
}
return (
<SafeAreaView style={styles.container}>
<View style={styles.headerShape} />
<Text style={styles.title}>Editar usuario</Text>
<View style={styles.inputBox}><Text
style={styles.inputText}>Nombre</Text></View>
<View style={styles.inputBox}><Text style={styles.inputText}>User</Text></View>
<View style={styles.inputBox}><Text
style={styles.inputText}>Password</Text></View>
<View style={styles.inputBox}><Text style={styles.inputText}>Rol ▼</Text></View>
<TouchableOpacity style={styles.btnSecondary} onPress={() => setVista('gestion')}>
<Text style={styles.btnSecondaryText}>Guardar</Text>
</TouchableOpacity>
<TouchableOpacity style={[styles.btnSecondary, { marginTop: 10 }]} onPress={() =>
setVista('gestion')}>
<Text style={styles.btnSecondaryText}>Regresar</Text>
</TouchableOpacity>
<View style={styles.bottomShape} />
</SafeAreaView>
);
}
const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#EBE5D8', alignItems: 'center',
paddingVertical: 35 },
headerShape: { position: 'absolute', top: 0, left: 0, right: 0, height: 100,
backgroundColor: '#A3B18A', borderBottomRightRadius: 80, opacity: 0.6 },
bottomShape: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
backgroundColor: '#A3B18A', borderTopLeftRadius: 80, opacity: 0.6 },
title: { fontSize: 26, fontWeight: 'bold', color: '#000', textAlign: 'center', marginVertical:
15, zIndex: 1 },
inputBox: { width: '80%', backgroundColor: '#D9D9D9', borderRadius: 15,
paddingVertical: 12, paddingHorizontal: 20, marginBottom: 12, zIndex: 1 },
inputText: { fontSize: 16, color: '#333' },
listCard: { width: '80%', backgroundColor: '#D9D9D9', borderRadius: 10, padding: 15,
marginBottom: 15, alignItems: 'center', zIndex: 1 },
itemText: { fontSize: 18, fontWeight: 'bold', color: '#000', marginVertical: 4 },
btnSecondary: { width: '50%', backgroundColor: '#8C8C98', borderRadius: 12,
paddingVertical: 9, alignItems: 'center', zIndex: 1 },
btnSecondaryText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
});