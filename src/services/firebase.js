// src/services/firebase.js
// ============================================================
// Firebase Configuration — credentials loaded from .env
// Never hardcode keys here. Add .env to .gitignore always.
// ============================================================

import { initializeApp } from "firebase/app";
import { getAuth }       from "firebase/auth";
import { getFirestore }  from "firebase/firestore";
import { getStorage }    from "firebase/storage";

// Firebase config — env vars are preferred; hardcoded fallbacks are safe
// because these values are public client-side constants (visible in any built bundle).
const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY            || "AIzaSyBtyr2p40s7OE5gzQf0kl98bP81tdOBmnE",
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN        || "project-main-cms.firebaseapp.com",
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID         || "project-main-cms",
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET     || "project-main-cms.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "784301098734",
  appId:             process.env.REACT_APP_FIREBASE_APP_ID             || "1:784301098734:web:87634a6c32ceda4ae055ff",
};

// Warn in development if authDomain is missing (causes Google Sign-In to fail)
if (!firebaseConfig.authDomain) {
  console.error("[Firebase] authDomain is missing! Google Sign-In will fail. Check your .env file and restart the dev server.");
}

const app = initializeApp(firebaseConfig);

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);

export default app;
