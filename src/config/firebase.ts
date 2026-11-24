<<<<<<< HEAD
import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCMIOhxwcXEqbAnie@m1mbyUIpwDNBYeuA",
=======
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCMIohxwcXEqbAnie0m1mbyUIpwDNBYeuA",
>>>>>>> d967d860e3304e98de0d7a3668267aab0051a5a7
  authDomain: "naturalsv-mobile.firebaseapp.com",
  projectId: "naturalsv-mobile",
  storageBucket: "naturalsv-mobile.firebasestorage.app",
  messagingSenderId: "380942880440",
  appId: "1:380942880440:web:a5d0b46efb1f5b2eebee4d",
  measurementId: "G-B7MK7WJG9C"
};

<<<<<<< HEAD
const app = initializeApp(firebaseConfig);

// Inicialización limpia evitando el conflicto de tipos de persistencia en el editor
export const auth = initializeAuth(app);
export const db = getFirestore(app);
=======
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth: Auth;
try {
  auth = initializeAuth(app);
} catch {
  auth = getAuth(app);
}

export const db = getFirestore(app);
export { auth };
export default app;
>>>>>>> d967d860e3304e98de0d7a3668267aab0051a5a7
