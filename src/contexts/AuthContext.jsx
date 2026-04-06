// src/contexts/AuthContext.jsx
// ============================================================
// Provides authentication state and methods to the entire app.
// Supports: Email/Password, Google OAuth, Phone OTP.
// ============================================================

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "../services/firebase";
import { createUserProfile, getUserProfile } from "../services/firestoreService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const p = await getUserProfile(firebaseUser.uid);
        setProfile(p);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ── Email / Password Register ───────────────────────────────
  async function register(email, password, name, role, extra = {}) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });

    const profileData = {
      uid:    cred.user.uid,
      email,
      name,
      role,
      status: role === "student" ? "pending" : "active",
      ...extra,
    };

    await createUserProfile(cred.user.uid, profileData);
    setProfile(profileData);
    return cred.user;
  }

  // ── Email / Password Login ──────────────────────────────────
  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const p = await getUserProfile(cred.user.uid);
    setProfile(p);
    return cred.user;
  }

  // ── Google OAuth ────────────────────────────────────────────
  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;

    // Check if profile exists
    let p = await getUserProfile(firebaseUser.uid);

    if (!p) {
      // New Google user — return null profile so UI can ask for role
      setUser(firebaseUser);
      setProfile(null);
      return { user: firebaseUser, isNew: true };
    }

    setProfile(p);
    return { user: firebaseUser, isNew: false };
  }

  // ── Create profile for new social/phone users ───────────────
  async function createSocialProfile(firebaseUser, name, role, extra = {}) {
    const profileData = {
      uid:    firebaseUser.uid,
      email:  firebaseUser.email || "",
      phone:  firebaseUser.phoneNumber || "",
      name:   name || firebaseUser.displayName || "User",
      role,
      status: role === "student" ? "pending" : "active",
      ...extra,
    };
    await createUserProfile(firebaseUser.uid, profileData);
    setProfile(profileData);
    return profileData;
  }

  // ── Phone Auth — Step 1: Send OTP ──────────────────────────
  async function sendPhoneOTP(phoneNumber, recaptchaContainerId) {
    // Clear previous verifier if exists
    if (window._recaptchaVerifier) {
      try { window._recaptchaVerifier.clear(); } catch {}
    }

    const appVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size: "invisible",
      callback: () => {},
    });
    window._recaptchaVerifier = appVerifier;

    // Ensure phone has country code
    const phone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;
    const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
    window._phoneConfirmation = confirmationResult;
    return confirmationResult;
  }

  // ── Phone Auth — Step 2: Verify OTP ────────────────────────
  async function verifyPhoneOTP(confirmationResult, otp) {
    const result = await confirmationResult.confirm(otp);
    const firebaseUser = result.user;

    let p = await getUserProfile(firebaseUser.uid);

    if (!p) {
      setUser(firebaseUser);
      setProfile(null);
      return { user: firebaseUser, isNew: true };
    }

    setProfile(p);
    return { user: firebaseUser, isNew: false };
  }

  // ── Sign Out ────────────────────────────────────────────────
  async function logout() {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  }

  // ── Refresh Profile ─────────────────────────────────────────
  async function refreshProfile() {
    if (user) {
      const p = await getUserProfile(user.uid);
      setProfile(p);
      return p;
    }
  }

  const value = {
    user,
    profile,
    loading,
    register,
    login,
    loginWithGoogle,
    sendPhoneOTP,
    verifyPhoneOTP,
    createSocialProfile,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
