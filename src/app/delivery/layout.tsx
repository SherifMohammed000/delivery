"use client";

import React, { useEffect, useState } from "react";
import { DeliverySidebar } from "@/components/delivery/DeliverySidebar";
import { useAuth } from "@/lib/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useRiderTracking } from "@/lib/hooks/useRiderTracking";

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  
  // Start location tracking for riders
  const { locationError } = useRiderTracking();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (role !== "delivery" && role !== "admin") {
        router.push("/");
      }
    }
  }, [user, role, loading, router]);

  if (loading || !user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="mt-4 text-zinc-500 font-bold tracking-tight italic">Securely entering workspace...</p>
      </div>
    );
  }

  if (locationError) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-900 p-8 text-center">
        <div className="w-24 h-24 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mb-8 border border-red-500/20">
           <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10z"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
           </div>
        </div>
        <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic">Location Mandated</h2>
        <p className="text-zinc-400 font-medium max-w-md mx-auto leading-relaxed mb-10">
          As a delivery rider, your live location is required to receive orders. Please enable location permissions in your browser or device settings to continue.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-white text-zinc-900 px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5"
        >
          Check Permissions Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <DeliverySidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pb-24 lg:pb-8">
        {children}
      </main>
    </div>
  );
}
