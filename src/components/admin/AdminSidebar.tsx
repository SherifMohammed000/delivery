"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Map, // Added for Zones
  Users, 
  Truck, 
  Settings, 
  LogOut,
  Flame,
  Wrench // Added for Service Settings
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/contexts/auth-context";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Riders", href: "/admin/partners", icon: Users },
  { name: "Zones", href: "/admin/zones", icon: Map },
  { name: "Orders", href: "/admin/orders", icon: Truck },
  { name: "Service Settings", href: "/admin/settings/services", icon: Wrench },
];

export const AdminSidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-zinc-100 shadow-sm z-40">
        <Link href="/" className="flex items-center gap-2 px-6 py-8 group transition-transform hover:scale-105 active:scale-95">
          <div className="relative w-40 h-16">
            <Image 
              src="/ghova.png" 
              alt="GHo-VA Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === "/admin" 
              ? pathname === "/admin" 
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                  isActive 
                    ? "bg-orange-50 text-orange-600 shadow-sm shadow-orange-100" 
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-50">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-zinc-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-zinc-100 px-2 py-1 flex justify-around items-center z-50 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => {
          const isActive = item.href === "/admin" 
            ? pathname === "/admin" 
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-lg transition-all ${
                isActive ? "text-orange-600 scale-105" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
        <button
          onClick={() => logout()}
          className="flex flex-col items-center gap-1 p-2 min-w-[64px] text-zinc-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </nav>
    </>
  );
};
