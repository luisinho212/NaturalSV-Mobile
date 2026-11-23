# Guion para José — NaturalSV, Fase 3 (aproximadamente 15 minutos)

## 1. Presentación (2 minutos)

"Mi participación en la fase final fue mejorar el registro de compras de NaturalSV y documentar su integración con el backend. Esta app multiplataforma busca centralizar compras, clientes, productos y usuarios. En el proyecto móvil trabajamos con React Native, Expo SDK 58 y Firebase. En la web existe un proyecto con React y Next.js desplegado en Vercel, cuya persistencia original era local y requiere conectarse al mismo Firebase para sincronizar registros con móvil".

## 2. Código de Compras (4 minutos)

Abre `src/screen/ComprasScreen.tsx` y señala:

- Validación de cliente y detalle, cantidad entera positiva y precio unitario mayor a cero.
- Cálculo automático de total (ejemplo: 2 × $5.25 = $10.50).
- `onAuthStateChanged` identifica al usuario; `where('userId','==', uid)` limita las compras consultadas.
- `onSnapshot` escucha cambios en tiempo real desde Firestore.
- `addDoc`, `updateDoc`, `deleteDoc` realizan el ciclo completo de compras; `serverTimestamp()` registra la hora del servidor.
- `try/catch` muestra errores; el estado `guardando` evita solicitudes duplicadas.
- `src/app/compras.tsx` ahora reutiliza la misma pantalla, sin datos ficticios.

## 3. Demostración práctica (4 minutos)

Abre Expo Go / Android: inicia sesión, entra en Compras, registra un cliente de prueba y dos unidades de un producto a $5.25. Enseña el total $10.50 y el documento en Firestore (`purchases`). Edita el registro y elimina la prueba. **Solo muestra sincronización web↔móvil si antes se ha desplegado una integración web Firebase real.** Si no está lista, explica con transparencia la diferencia entre el `localStorage` web anterior y Firestore móvil.

## 4. Repositorios, mockups y despliegue (3 minutos)

Abre el README móvil y `docs/mockups/` para presentar los diseños de Figma. Muestra el archivo `LICENSE` CC BY 4.0, y el historial real de ramas y colaboradores en GitHub. Menciona que Vercel despliega la capa web de React/Next.js y que las variables Firebase requeridas se configuran en el panel de Vercel. No afirmes que una configuración se ha verificado si no lo hiciste.

## 5. Preguntas frecuentes (2 minutos)

**¿Qué diferencia hay entre el demo web y la base de Firebase?** El demo anterior utiliza `localStorage`, por lo que almacena información solo en el navegador. Firestore permite consulta entre dispositivos y actualización en tiempo real, si ambos usan el mismo proyecto, esquema, permisos y usuario.

**¿Qué evita cantidades negativas o mal calculadas?** Validamos cantidad entera mayor que cero, precio finito positivo y calculamos total dentro del módulo antes de guardar; no confiamos en un texto escrito como total.

**¿Por qué `serverTimestamp()`?** Para registrar creación y actualización según la hora del servidor, y no depender del reloj del teléfono.

**¿Cómo garantizan quién puede ver cada compra?** La consulta filtra por `userId` y Firebase Authentication identifica la cuenta. También se necesitan reglas Firestore adecuadas: el filtro por sí solo no es seguridad.

**¿Qué ocurre si se cae Internet o faltan permisos?** Las operaciones están en `try/catch` y los listeners tienen callback de error. La interfaz informa de la falla y evita reportar una operación como exitosa.

## Conclusión breve

"La mejora principal fue dejar atrás una pantalla de datos estáticos y registrar compras reales, con cantidades, importes y validaciones. Firebase permite llevar esta persistencia a más de una plataforma, y la documentación del repositorio facilita su evaluación y mantenimiento".
