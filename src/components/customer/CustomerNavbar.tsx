"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Flame, ShoppingBag, LogOut, User, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

const navLinks = [
  {
    href: "/products",
    label: "Place Order",
    icon: Flame,
    description: "Order a refill",
  },
  {
    href: "/orders",
    label: "My Orders",
    icon: ShoppingBag,
    description: "All orders & tracking",
  },
];

export function CustomerNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <nav className="max-w-5xl mx-auto bg-white/80 backdrop-blur-xl border border-zinc-200/80 rounded-2xl shadow-lg shadow-zinc-200/40 px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/products" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-zinc-900 rounded-xl flex items-center justify-center p-1.5 group-hover:scale-105 transition-transform shadow-md">
              <Image src="/ghova.png" alt="GHo-VA" width={28} height={28} className="object-contain" />
            </div>
            <span className="text-base font-black tracking-tighter uppercase text-zinc-900 hidden sm:block">GHo-VA</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-zinc-900 text-white shadow-md"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* User + Logout */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 border border-zinc-100 rounded-xl">
              <div className="w-6 h-6 bg-zinc-200 rounded-lg flex items-center justify-center">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-lg object-cover" />
                ) : (
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                )}
              </div>
              <span className="text-xs font-bold text-zinc-700 max-w-[120px] truncate">
                {user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "Customer"}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="md:hidden max-w-5xl mx-auto mt-2 bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-top-4 duration-200">
            <div className="p-4 space-y-1">
              {navLinks.map(({ href, label, icon: Icon, description }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? "bg-white/10" : "bg-zinc-100"}`}>
                      <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-zinc-500"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight">{label}</p>
                      <p className={`text-[10px] font-medium ${isActive ? "text-zinc-400" : "text-zinc-400"}`}>{description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-zinc-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-100 rounded-xl flex items-center justify-center">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-zinc-500" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-black text-zinc-900 truncate max-w-[160px]">
                    {user?.displayName || user?.email?.split("@")[0] || "Customer"}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-medium">Customer Account</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Bottom Tab Bar (Mobile PWA-style) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-zinc-200 safe-area-bottom">
        <div className="flex items-center justify-around px-4 py-3">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-5 py-1 rounded-xl transition-all ${
                  isActive ? "text-zinc-900" : "text-zinc-400"
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  isActive ? "bg-zinc-900 shadow-lg" : "bg-transparent"
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-zinc-400"}`} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-wider ${isActive ? "text-zinc-900" : "text-zinc-400"}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
