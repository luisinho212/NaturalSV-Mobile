# Registro de cambios — aporte de José (fase 3)

**Base:** ZIP `NaturalSV-Mobile-feature-luis-modulo.zip` proporcionado para esta actividad. No se ha hecho commit ni push.

### Archivos modificados

- `src/screen/ComprasScreen.tsx`: reemplazada consulta manual por listener Firestore `onSnapshot` ligado a `onAuthStateChanged`. Validación robusta, cálculo automático de montos, manejo de carga/errores, edición, eliminación con confirmación y compatibilidad con documentos antiguos.
- `src/app/compras.tsx`: eliminada pantalla con órdenes fijas/placeholder; reutiliza la pantalla real de Compras del proyecto, sin alterar la navegación principal.
- `README.md`: documentación académica, ejecución, arquitectura, mockups, módulos y enlaces.
- `docs/VALIDACION-FIREBASE.md`: pruebas y observaciones de seguridad.
- `docs/GUIA-JOSE-DEFENSA.md`: demostración práctica y discurso.
- `docs/COMO-SUBIR-GITHUB.md`: procedimiento de actualización segura.

### Archivos que deliberadamente NO se modifican

- `src/config/firebase.ts`: preserva la configuración Firebase funcional original.
- `package.json`, `package-lock.json`, `app.json`: se preservan las dependencias Expo SDK 58 que estabilizó Luis.
- Pantallas de Clientes, Productos y Usuarios: cambios ajenos a tu módulo.
- `LICENSE`: el archivo CC BY 4.0 ya existe y se conserva.

### Límites de verificación

Se comprueba sintaxis TSX con el compilador TypeScript disponible. En este entorno no se pudieron instalar dependencias de npm ni iniciar Expo/Firebase en un teléfono; el build real y las pruebas de red se deben realizar antes de crear un Pull Request. La web de la fase anterior aún necesita integración real con Firebase para afirmar sincronización entre plataformas.
