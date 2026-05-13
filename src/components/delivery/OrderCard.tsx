"use client";

import React from "react";
import { Order } from "@/types/order";
import { Package, MapPin, ChevronRight, Clock, DollarSign } from "lucide-react";

interface OrderCardProps {
  order: Order;
  onAccept: (orderId: string) => void;
  loading?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onAccept, loading }) => {
  return (
    <div className="group bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-xl shadow-zinc-200/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
      
      <div className="relative z-10 space-y-8">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center">
               <Package className="w-7 h-7" />
             </div>
             <div>
                <h4 className="text-xl font-black text-zinc-900 uppercase tracking-tight">{order.serviceSize}</h4>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Requested 2m ago</span>
                </div>
             </div>
          </div>
          <div className="px-4 py-2 bg-green-50 rounded-xl">
             <span className="text-sm font-black text-green-600">GH₵ 15.00 Earned</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
             <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
             <div>
                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">Pickup Information</p>
                <p className="text-sm font-extrabold text-zinc-900 leading-relaxed uppercase">{order.address}</p>
             </div>
          </div>
        </div>

        <button 
          disabled={loading}
          onClick={() => onAccept(order.id)}
          className="w-full relative group/btn bg-primary py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all overflow-hidden"
        >
          <div className="relative z-10 flex items-center gap-3">
             <span className="text-white font-black uppercase tracking-widest text-sm italic">
               {loading ? "Accepting Job..." : "Claim This Order"}
             </span>
             {!loading && <ChevronRight className="w-5 h-5 text-white transition-transform group-hover/btn:translate-x-1" />}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
        </button>
      </div>
    </div>
  );
};
