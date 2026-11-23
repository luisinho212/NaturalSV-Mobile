"use client";

import React, { useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const webConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const webApp = getApps().length === 0 ? initializeApp(webConfig) : getApp();
const webAuth = getAuth(webApp);

export default function AuthPanelWeb() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(webAuth, email, password);
      setMsg("Sesión iniciada con correo.");
    } catch {
      await createUserWithEmailAndPassword(webAuth, email, password);
      setMsg("Cuenta creada e iniciada con correo.");
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(webAuth, provider);
    setMsg("Sesión iniciada con Google.");
  };

  return (
    <form onSubmit={handleEmailLogin}>
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Ingresar / Registrar con Correo</button>
      <button type="button" onClick={handleGoogleLogin}>
        Continuar con Google
      </button>
      {msg && <p>{msg}</p>}
    </form>
  );
}