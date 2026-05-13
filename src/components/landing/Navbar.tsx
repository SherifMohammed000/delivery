"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { LogOut, LayoutDashboard, ChevronRight } from "lucide-react";
import { InstallPWA } from "@/components/InstallPWA";

export const Navbar = () => {
  const { user, role, logout } = useAuth();
  const pathname = usePathname();
  const [showRiderCTA, setShowRiderCTA] = useState(false);

  const isDashboard = pathname === "/products" || pathname === "/delivery" || pathname === "/admin";

  useEffect(() => {
    // Only show "Become a Rider" if they haven't seen it, handled it yet, and NOT on a dashboard
    const hasSeen = localStorage.getItem("ghova_rider_cta_seen");
    if (!hasSeen && user && role === "customer" && !isDashboard) {
      setShowRiderCTA(true);
    } else {
      setShowRiderCTA(false);
    }
  }, [user, role, isDashboard]);

  const handleRiderCTAClick = () => {
    localStorage.setItem("ghova_rider_cta_seen", "true");
    setShowRiderCTA(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-zinc-100/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-32 h-12 transition-transform duration-300 group-hover:scale-105">
            <Image 
              src="/ghova.png" 
              alt="GHo-VA Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Fast & Reliable</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">How it Works</Link>
          <Link href="#pricing" className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">Pricing</Link>
          <Link href="#support" className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">Support</Link>
        </div>

        {/* Auth Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <InstallPWA />
          {user ? (
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
              {!isDashboard && (
                <Link 
                  href={role === "admin" ? "/admin" : (role === "delivery" ? "/delivery" : "/products")} 
                  className="flex items-center gap-2 text-sm font-bold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-5 py-2.5 rounded-xl transition-all active:scale-95"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              )}
              {showRiderCTA && (
                <Link 
                  href="/account/become-rider" 
                  onClick={handleRiderCTAClick}
                  className="hidden lg:flex items-center gap-2 text-sm font-bold text-primary bg-primary/5 hover:bg-primary/10 px-5 py-2.5 rounded-xl transition-all active:scale-95 border border-primary/10"
                >
                  Become a Rider
                </Link>
              )}
              <button 
                onClick={() => logout()}
                className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="group flex items-center gap-2 px-6 py-3 text-sm font-black text-white bg-primary rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 overflow-hidden relative"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
