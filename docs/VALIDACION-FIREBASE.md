# Validación de Firebase en NaturalSV

## Qué existe y qué falta comprobar

- La app **móvil** ya apunta al proyecto Firebase `naturalsv-mobile` mediante `src/config/firebase.ts`.
- La colección de compras utilizada por esta rama es `purchases`; **no** la colección `compras` de ejemplo del PDF, para no crear datos incompatibles.
- La app web de la etapa 2 tiene persistencia local (`localStorage`). La sincronización real web ↔ móvil requiere configurar Firebase también en la web y redeplegarla.

## Pruebas de tu módulo

1. Ejecuta `npm install --legacy-peer-deps` y `npx expo start -c`.
2. Inicia sesión con **una cuenta de prueba** autorizada en Firebase Authentication.
3. Entra en Compras desde el menú y registra cliente, detalle, cantidad `2`, precio `5.25`.
4. Confirma total calculado `$10.50`; revisa que exista en **Firestore → purchases**.
5. Cambia cantidad a `3`, guarda y comprueba actualización.
6. Borra un registro de prueba; comprueba que ya no aparezca en la app ni en Firestore.
7. Desde otra instancia **con la misma cuenta** verifica actualización sin recargar, usando `onSnapshot`.
8. Cierra sesión y entra con otro usuario; verifica que no aparezcan las compras de la cuenta anterior.
9. Prueba valores inválidos (cantidad vacía, `0`, `-1`, `1.5`, precio vacío, `abc`, `0`, negativos) y confirma que no se escriban documentos.
10. Simula pérdida de red o deniega permisos de lectura en un entorno de pruebas; comprueba el mensaje de error.

## Seguridad y restricciones

La consulta filtra compras por `userId`, pero el filtro visual **no sustituye reglas de seguridad**. Un patrón mínimo ilustrativo sería exigir `request.auth.uid == resource.data.userId` al leer/modificar/borrar y `request.auth.uid == request.resource.data.userId` al crear. Diseña y prueba reglas completas con el administrador del proyecto; no apliques reglas a producción sin validar efectos sobre otras colecciones y roles.

No compartas claves privadas, cuentas de acceso reales, archivos de servicio ni contraseñas en README o commits. Los identificadores Firebase de cliente no reemplazan las reglas de seguridad.

## Vercel

La integración web requiere `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` (mismo proyecto que móvil) y un despliegue actualizado; la configuración del panel Vercel requiere acceso autorizado. Habilita Email/Password y Google en Firebase Authentication, registra el dominio de Vercel como dominio autorizado y comprueba que el proveedor esté habilitado. Luego realiza en ambas plataformas operaciones sobre `purchases` con el mismo `userId`.
