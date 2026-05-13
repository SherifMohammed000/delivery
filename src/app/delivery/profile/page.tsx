"use client";

import React from "react";
import { User, ShieldCheck, Phone, Mail, Award, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-zinc-900 tracking-tight uppercase">Partner Profile</h1>
        <p className="text-zinc-500 font-medium italic">Verified delivery personnel credentials.</p>
      </div>

      <div className="bg-white rounded-[3rem] border border-zinc-100 p-12 shadow-xl shadow-zinc-200/50">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-32 h-32 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center text-white text-5xl font-black">
            {user?.displayName?.substring(0, 1) || "R"}
          </div>
          
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="space-y-1">
              <h2 className="text-4xl font-black text-zinc-900 tracking-tight uppercase">{user?.displayName || "Rider"}</h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-green-600">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Verified Partner</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
               <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100">
                  <Mail className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-bold text-zinc-600">{user?.email}</span>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100">
                  <Phone className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-bold text-zinc-600">{user?.phoneNumber || "No Phone Linked"}</span>
               </div>
            </div>
          </div>

          <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 text-center">
             <Award className="w-10 h-10 text-blue-600 mx-auto mb-2" />
             <p className="text-2xl font-black text-blue-600">4.9</p>
             <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Rider Rating</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6">
           <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Identity Documents</h3>
           <div className="space-y-4">
              {[ "Government ID Card", "Driver's License", "Bike Registration" ].map((doc) => (
                <div key={doc} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                   <span className="text-sm font-bold text-zinc-600">{doc}</span>
                   <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Verified</span>
                </div>
              ))}
           </div>
        </div>

        <div className="p-8 bg-zinc-900 rounded-[2.5rem] text-white flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Loader2 className="w-20 h-20 animate-spin" />
           </div>
           <h3 className="text-xl font-black uppercase tracking-tight italic">System Updates</h3>
           <p className="text-zinc-400 text-sm font-medium leading-relaxed">
             Our team periodically audits partner documents. Keep your profile updated to avoid service interruptions.
           </p>
           <button className="px-8 py-3 bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/5">
              Contact Support
           </button>
        </div>
      </div>
    </div>
  );
}
