import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCMIOhxwcXEqbAnie@m1mbyUIpwDNBYeuA",
  authDomain: "naturalsv-mobile.firebaseapp.com",
  projectId: "naturalsv-mobile",
  storageBucket: "naturalsv-mobile.firebasestorage.app",
  messagingSenderId: "380942880440",
  appId: "1:380942880440:web:a5d0b46efb1f5b2eebee4d",
  measurementId: "G-B7MK7WJG9C"
};

const app = initializeApp(firebaseConfig);

// Inicialización limpia evitando el conflicto de tipos de persistencia en el editor
export const auth = initializeAuth(app);
export const db = getFirestore(app);