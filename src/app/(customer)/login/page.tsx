"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/contexts/auth-context";
import { AuthInput } from "@/components/auth/AuthInput";
import { SocialAuth } from "@/components/auth/SocialAuth";
import { getRedirectPath, syncSession } from "@/lib/utils/auth";

// import { Flame } from "lucide-react"; (Removed unused import)

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const loginID = email.includes("@") ? email : `${email}@ghova.com`;
      const userCredential = await signInWithEmailAndPassword(auth, loginID, password);
      
      // Fetch role immediately for redirection
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      const role = userDoc.exists() ? userDoc.data().role : "customer";

      // IMPORTANT: Ensure session cookie is synced BEFORE redirecting to protected routes
      await syncSession(userCredential.user);
      
      router.push(getRedirectPath(role));
    } catch (err: any) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      // Auth context will handle the user creation/sync, but we might need to wait for it or fetch again
      // For Google, we can't easily get the user back from signInWithGoogle if it doesn't return anything
      // In auth-context.tsx, signInWithGoogle calls signInWithPopup(auth, provider) but returns nothing.
      // However, after popup returns, auth.currentUser should be set.
      
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        const role = userDoc.exists() ? userDoc.data().role : "customer";

        // IMPORTANT: Ensure session cookie is synced BEFORE redirecting to protected routes
        await syncSession(currentUser);

        router.push(getRedirectPath(role));
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-2xl ring-1 ring-zinc-100">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
        <div className="flex flex-col items-center">
          <Link href="/" className="flex flex-col items-center gap-3 mb-2 group">
            <div className="w-20 h-20 bg-zinc-900 rounded-[1.75rem] flex items-center justify-center p-4 shadow-2xl shadow-zinc-200 group-hover:scale-105 transition-transform">
              <Image 
                src="/ghova.png" 
                alt="GHo-VA Logo" 
                width={64}
                height={64}
                className="object-contain"
                priority
              />
            </div>
            <div className="text-center">
              <span className="text-2xl font-black tracking-tighter uppercase block leading-none text-zinc-900">GHo-VA</span>
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Utility Logistics</span>
            </div>
          </Link>
          <h2 className="mt-6 text-center text-2xl font-extrabold text-zinc-900 tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600">
            Sign in to continue.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <AuthInput
              label="Email or Phone Number"
              id="email-address"
              type="text"
              autoComplete="username"
              required
              placeholder="+233..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <AuthInput
              label="Password"
              id="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/reset-password" id="forgot-password" className="font-semibold text-orange-600 hover:text-orange-500 transition-colors">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl border border-transparent bg-orange-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-orange-400 transition-all"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <SocialAuth onGoogleSignIn={handleGoogleSignIn} loading={loading} />

        <p className="mt-8 text-center text-sm text-zinc-600">
          Don't have an account?{" "}
          <Link href="/signup" className="font-semibold text-orange-600 hover:text-orange-500 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
