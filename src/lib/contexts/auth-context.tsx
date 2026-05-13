"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { syncSession } from "@/lib/utils/auth";

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch role from Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (currentUser.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
          const adminDoc = {
            name: "System Admin",
            email: currentUser.email,
            phone: process.env.NEXT_PUBLIC_ADMIN_PHONE || "",
            role: "admin",
            isActive: true,
            updatedAt: serverTimestamp(),
          };
          await setDoc(userDocRef, adminDoc, { merge: true });
          setRole("admin");
        } else if (userDoc.exists()) {
          const fetchedRole = userDoc.data().role;
          setRole(fetchedRole?.toLowerCase() || "customer");
        } else {
          // New user (possibly from Google), create default document
          const newUserDoc = {
            name: currentUser.displayName || "",
            email: currentUser.email || "",
            phone: currentUser.phoneNumber || "",
            role: "customer",
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(userDocRef, newUserDoc);
          setRole("customer");
        }

        await syncSession(currentUser);
      } else {
        setRole(null);
        // Clear session cookie
        await syncSession(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google sign-in error", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
