"use client";

import React from "react";
import { Map, MapPin, Navigation, Info } from "lucide-react";

export default function ZonesPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-zinc-900 tracking-tight uppercase">Service Areas</h1>
        <p className="text-zinc-500 font-medium italic">Your active operational zones in Ho.</p>
      </div>

      <div className="bg-zinc-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #f27a18 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10">
                  <Navigation className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live GPS Tracking</span>
               </div>
               <h2 className="text-5xl font-black tracking-tight uppercase leading-none">Ho Central <br /> <span className="text-zinc-500">Logistics</span></h2>
            </div>
            <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group hover:border-primary transition-all">
               <Map className="w-12 h-12 text-primary" />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["Ho Central", "Bankoe", "Anlokodzi", "Fiave", "SSNIT"].map((area) => (
          <div key={area} className="p-8 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm flex items-center gap-4 group hover:border-primary transition-all">
            <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-primary group-hover:text-white transition-all">
               <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-zinc-900 uppercase tracking-tight">{area}</p>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Zone</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 bg-zinc-100 rounded-[2.5rem] flex items-center gap-4">
         <Info className="w-6 h-6 text-zinc-400 shrink-0" />
         <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
           You are currently assigned to all primary zones in Ho. For zone changes, please contact support.
         </p>
      </div>
    </div>
  );
}
