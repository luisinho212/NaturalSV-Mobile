# Cómo integrar tu carpeta de DPS en GitHub sin perder cambios

Este ZIP contiene **el proyecto móvil completo**, derivado del ZIP original de la rama `feature/luis-modulo`. No incluye historial `.git`, porque GitHub Download ZIP no exporta esa carpeta. Evita borrar el repositorio de tus compañeros o usar `git push --force`.

## Método recomendado (sin subir de forma automática)

1. En tu PC: `git clone https://github.com/luisinho212/NaturalSV-Mobile.git`.
2. Entra en la carpeta: `cd NaturalSV-Mobile`.
3. Trae la base: `git fetch origin` y `git switch feature/luis-modulo` (o `git switch --track origin/feature/luis-modulo` si no existe localmente).
4. Crea tu rama: `git switch -c feature/jose-compras-fase3`.
5. Copia **solo los archivos modificados** de esta entrega a la raíz del repositorio clonado, respetando rutas (`src/screen/ComprasScreen.tsx`, `src/app/compras.tsx`, `README.md` y los tres `docs/*.md`). No copies `.git` ni sobrescribas otras carpetas.
6. Revisa: `git diff --stat` y `git diff`.
7. Ejecuta `npm install --legacy-peer-deps`, `npx tsc --noEmit` y `npx expo start -c`.
8. Comprueba las pruebas en `docs/VALIDACION-FIREBASE.md`.
9. Cuando todo esté bien: `git add src/screen/ComprasScreen.tsx src/app/compras.tsx README.md docs/VALIDACION-FIREBASE.md docs/CAMBIOS-JOSE.md docs/GUIA-JOSE-DEFENSA.md docs/COMO-SUBIR-GITHUB.md`.
10. Crea el commit: `git commit -m "feat(compras): validar CRUD y sincronizar compras con Firestore"`.
11. **Solo tú:** `git push -u origin feature/jose-compras-fase3`; crea PR hacia `feature/luis-modulo` después de verificar los cambios.

## Advertencia

Si tus compañeros han subido nuevos cambios desde que descargaste el ZIP, primero haz `git fetch` y compara las versiones. Nunca reemplaces el repositorio remoto con un ZIP sin comprobar el diff. No hagas `git add .` si no has revisado los archivos alterados.
