// src/services/firebase.js
// ============================================================
// Firebase Configuration
// Replace the firebaseConfig object with YOUR project's config
// from Firebase Console → Project Settings → Your apps → Web app
// ============================================================

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey:            "AIzaSyBtyr2p40s7OE5gzQf0kl98bP81tdOBmnE",
  authDomain:        "project-main-cms.firebaseapp.com",
  projectId:         "project-main-cms",
  storageBucket:     "project-main-cms.firebasestorage.app",
  messagingSenderId: "784301098734",
  appId:             "1:784301098734:web:87634a6c32ceda4ae055ff",
};

const app = initializeApp(firebaseConfig);

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);

export default app;
