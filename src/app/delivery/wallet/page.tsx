"use client";

import React from "react";
import { Wallet, TrendingUp, AlertCircle, ArrowRight, History } from "lucide-react";

export default function WalletPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-zinc-900 tracking-tight uppercase">My Wallet</h1>
        <p className="text-zinc-500 font-medium italic">Manage your earnings and system commissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-zinc-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-zinc-200">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Wallet className="w-24 h-24" />
           </div>
           <div className="relative z-10 space-y-6">
              <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Total Balance</p>
              <h2 className="text-6xl font-black text-primary tracking-tight">GH₵ 0.00</h2>
              <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">
                 Withdraw Funds <ArrowRight className="w-4 h-4" />
              </button>
           </div>
        </div>

        <div className="bg-white rounded-[3rem] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/50 flex flex-col justify-between">
           <div className="space-y-2">
              <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Pending Commission</p>
              <h2 className="text-4xl font-black text-zinc-900">GH₵ 0.00</h2>
           </div>
           <div className="mt-8 flex items-start gap-4 p-5 bg-orange-50 rounded-2xl border border-orange-100">
              <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-orange-800 font-bold uppercase tracking-widest leading-relaxed">
                Clear your commission balance to keep receiving live orders.
              </p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-zinc-100 p-12 text-center">
         <History className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
         <h3 className="text-xl font-black text-zinc-900 uppercase">Transaction History</h3>
         <p className="text-sm text-zinc-400 font-medium">No recent transactions to display.</p>
      </div>
    </div>
  );
}
