// src/contexts/AuthContext.jsx
// ============================================================
// Provides authentication state and methods to the entire app.
// Wraps Firebase Auth + syncs user profile from Firestore.
// ============================================================

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "../services/firebase";
import { createUserProfile, getUserProfile } from "../services/firestoreService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);   // Firebase Auth user
  const [profile, setProfile]   = useState(null);   // Firestore profile
  const [loading, setLoading]   = useState(true);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch the Firestore profile
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

  /**
   * Register a new user (student or coaching admin).
   * @param {string} email
   * @param {string} password
   * @param {string} name
   * @param {"admin"|"student"} role
   * @param {object} extra - extra profile fields (coachingId for admin, etc.)
   */
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

  /**
   * Sign in an existing user.
   */
  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const p = await getUserProfile(cred.user.uid);
    setProfile(p);
    return cred.user;
  }

  /**
   * Sign out.
   */
  async function logout() {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  }

  /**
   * Refresh the profile from Firestore (call after approval etc).
   */
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
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context in any component.
 * Usage: const { profile, login, logout } = useAuth();
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
