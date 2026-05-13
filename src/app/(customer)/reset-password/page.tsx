"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/firebase/config";
import { AuthInput } from "@/components/auth/AuthInput";
import { ArrowLeft } from "lucide-react";

// import { Flame } from "lucide-react"; (Removed unused import)

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send reset email");

      setMessage("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-2xl ring-1 ring-zinc-100">
        {/* Back Button */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>
        <div className="flex flex-col items-center">
          <Link href="/" className="relative w-40 h-16 mb-2 transition-transform hover:scale-105">
            <Image 
              src="/ghova.png" 
              alt="GHo-VA Logo" 
              fill
              className="object-contain"
              priority
            />
          </Link>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-zinc-900 tracking-tight">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600">
            Enter your email to receive a reset link.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleReset}>
          <div className="space-y-4">
            <AuthInput
              label="Email address"
              id="email-address"
              type="email"
              autoComplete="email"
              required
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {message && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
              <p className="text-xs text-green-600 font-medium">{message}</p>
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl border border-transparent bg-orange-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-orange-400 transition-all"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-600">
          Remembered your password?{" "}
          <Link href="/login" className="font-semibold text-orange-600 hover:text-orange-500 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
