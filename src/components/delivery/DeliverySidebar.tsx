"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Map, 
  Truck, 
  User, 
  Wallet,
  LogOut
} from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import Image from "next/image";

const navItems = [
  { name: "Dashboard", href: "/delivery", icon: LayoutDashboard },
  { name: "My Orders", href: "/delivery/orders", icon: Truck },
  { name: "Service Areas", href: "/delivery/zones", icon: Map },
  { name: "Wallet", href: "/delivery/wallet", icon: Wallet },
  { name: "Profile", href: "/delivery/profile", icon: User },
];

export const DeliverySidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-zinc-100 shadow-sm z-40">
        <div className="flex items-center gap-2 px-6 py-8">
           <Link href="/" className="relative w-32 h-10">
            <Image 
              src="/ghova.png" 
              alt="GHo-VA Logo" 
              fill
              className="object-contain"
              priority
            />
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                  isActive 
                    ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100" 
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-50 space-y-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 rounded-[1.5rem] border border-zinc-100/50">
            <div className="w-10 h-10 rounded-xl bg-zinc-200 overflow-hidden relative shrink-0">
              {user?.photoURL ? (
                <Image 
                  src={user.photoURL} 
                  alt={user.displayName || "Rider"} 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-5 h-5 text-zinc-400" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-zinc-900 truncate uppercase tracking-tighter">{user?.displayName}</p>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Online</p>
            </div>
          </div>
          
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-zinc-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-zinc-100 px-2 py-1 flex justify-around items-center z-50 shadow-lg">
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-xl transition-all ${
                isActive ? "text-blue-600" : "text-zinc-400"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
