# NaturalSV Mobile – cómo iniciar sesión y probar Compras

## Opción A: ya tienes un usuario autorizado
1. Inicia la app con `npm install --legacy-peer-deps` y `npx expo start -c`.
2. Ingresa el **correo y contraseña reales de una cuenta de prueba** de Firebase Authentication (proyecto `naturalsv-mobile`).
3. Las cuentas del sitio web anterior (demostración en localStorage) **no sirven** para este inicio de sesión.
4. Después de iniciar sesión, abre **Compras** y prueba crear, editar y eliminar un registro.

## Opción B: crear una cuenta para probar
1. En la pantalla inicial, pulsa **¿No tenés cuenta? Crear una para probar**.
2. Introduce tu correo y contraseña de al menos 6 caracteres, repítela y pulsa **Crear cuenta**.
3. Si está habilitado Email/Password en Firebase, la cuenta se registra y se abre el menú.
4. Si muestra **auth/operation-not-allowed**, pide al administrador habilitar **Firebase Console → naturalsv-mobile → Authentication → Sign-in method → Email/Password**.
5. Si indica falta de permisos al entrar a Compras, el problema es de las **reglas de Firestore** y debe revisarse con el responsable del proyecto, no desactivar autenticación ni abrir la base públicamente.

## Opción C: el administrador agrega una cuenta
Firebase Console → Authentication → Users → Add user. Usa un correo de prueba y una contraseña temporal; nunca pongas esas credenciales en GitHub ni en chats.

## Códigos frecuentes
- `auth/invalid-credential`: correo o contraseña incorrectos, o usuario inexistente.
- `auth/email-already-in-use`: la cuenta ya existe; inicia sesión.
- `auth/operation-not-allowed`: proveedor correo/contraseña deshabilitado.
- `auth/network-request-failed`: sin conexión o Firebase inaccesible.
- `auth/too-many-requests`: demasiados intentos de acceso.

## Comprobación de Compras
El módulo escribe en **Firestore → purchases**, no en `compras`. Se requiere usuario autenticado y reglas que autoricen las operaciones correspondientes. Usa una compra de prueba (cliente Carlos Pérez; descripción Vitaminas; cantidad 2; precio unitario 5.25; total 10.50). Comprueba crear, editar y eliminar.

## Cambios realizados
- Añadida la opción voluntaria de crear una cuenta con Firebase Authentication (sin bypass de seguridad).
- Confirmación de contraseña, validación del correo, carga y errores claros.
- El botón Logout ahora invoca `signOut(auth)` realmente.
- No se modificó la configuración Firebase ni los módulos de los otros integrantes.

**Advertencia:** La funcionalidad de crear cuentas requiere habilitación por parte del administrador. No se pueden prometer accesos sin comprobar los permisos de Firebase.
