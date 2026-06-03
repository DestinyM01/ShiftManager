// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // opcional
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios principales
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Inicializar Analytics solo si está disponible (evita errores en servidores o navegadores no soportados)
export const analytics = await isSupported().then(
  (supported) => (supported ? getAnalytics(app) : null)
);

if (import.meta.env.DEV) {
  console.log("✅ Firebase inicializado correctamente:", firebaseConfig.projectId);
}
