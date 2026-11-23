/**
 * Ruta de Compras (Expo Router).
 * La lógica, Firestore y la interfaz se mantienen en un solo componente reutilizable.
 * También se usa desde el menú principal en src/app/index.tsx.
 */
import { router } from 'expo-router';
import ComprasScreen from '../screen/ComprasScreen';

export default function ComprasRoute() {
  return (
    <ComprasScreen
      onRegresar={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/');
        }
      }}
    />
  );
}
