"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Activity, Truck, Users, ShieldCheck } from "lucide-react";

export const NetworkPulse = () => {
  const [stats, setStats] = useState({
    activeRiders: 0,
    liveOrders: 0,
    zonesCount: 5, // Static based on current coverage
  });

  useEffect(() => {
    // 1. Listen for active riders
    const ridersQuery = query(
      collection(db, "users"), 
      where("role", "==", "delivery"), 
      where("status", "==", "active")
    );
    const unsubscribeRiders = onSnapshot(ridersQuery, (snapshot) => {
      setStats(prev => ({ ...prev, activeRiders: snapshot.size }));
    });

    // 2. Listen for live orders
    const ordersQuery = query(
      collection(db, "orders"),
      where("status", "!=", "completed")
    );
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      setStats(prev => ({ ...prev, liveOrders: snapshot.size }));
    });

    return () => {
      unsubscribeRiders();
      unsubscribeOrders();
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 relative z-20">
      <div className="bg-zinc-900 rounded-[3rem] p-4 lg:p-6 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 border border-white/5">
        <div className="flex items-center gap-6 px-6">
           <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Network Pulse</span>
           </div>
           <div className="h-4 w-px bg-white/10 hidden lg:block" />
           <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest hidden md:block">Real-time logistics monitoring enabled</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-12 lg:gap-16 flex-1 px-6">
           <StatItem 
             icon={Truck} 
             value={stats.activeRiders.toString()} 
             label="Riders Online" 
             color="text-primary" 
           />
           <StatItem 
             icon={Activity} 
             value={stats.liveOrders.toString()} 
             label="Live Refills" 
             color="text-blue-400" 
           />
           <StatItem 
             icon={ShieldCheck} 
             value={stats.zonesCount.toString()} 
             label="Active Zones" 
             color="text-green-400" 
           />
        </div>

        <div className="hidden xl:flex items-center gap-3 px-8 text-right border-l border-white/10">
           <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ho Municipality</p>
              <p className="text-xs font-black text-white italic">Operational 24/7</p>
           </div>
        </div>
      </div>
    </div>
  );
};

function StatItem({ icon: Icon, value, label, color }: { icon: any, value: string, label: string, color: string }) {
  return (
    <div className="flex items-center gap-4 group">
       <div className={`p-2.5 rounded-xl bg-white/5 ${color} transition-transform group-hover:scale-110`}>
          <Icon className="w-5 h-5" />
       </div>
       <div>
          <p className="text-xl lg:text-2xl font-black text-white tracking-tighter leading-none">{value}</p>
          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">{label}</p>
       </div>
    </div>
  );
}
