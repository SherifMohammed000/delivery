"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Loader2,
  XCircle,
  Truck
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import { 
  collection, 
  query, 
  onSnapshot,
  orderBy
} from "firebase/firestore";
import { Order } from "@/types/order";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "completed" | "cancelled">("pending");

  useEffect(() => {
    // Listen to ALL orders directly sorted by creation date
    const ordersQuery = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const globalOrders = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Order));
      
      setOrders(globalOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const pendingOrders = orders.filter(
    o => o.status !== "completed" && o.status !== "cancelled"
  );
  const completedOrders = orders.filter(
    o => o.status === "completed"
  );
  const cancelledOrders = orders.filter(
    o => o.status === "cancelled"
  );

  const getActiveOrders = () => {
    if (tab === "pending") return pendingOrders;
    if (tab === "completed") return completedOrders;
    if (tab === "cancelled") return cancelledOrders;
    return [];
  };

  const activeRecords = getActiveOrders();

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4">
          <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-black text-zinc-400 hover:text-zinc-600 uppercase tracking-widest transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Command Center
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase">Global Order Ledger</h1>
            <p className="text-zinc-500 font-medium tracking-tight">Complete historical network operation records</p>
          </div>
        </div>
      </div>

      {/* TABS CONTAINER */}
      <div className="flex bg-zinc-100 p-1.5 rounded-2xl w-full sm:max-w-xl">
        <button
          onClick={() => setTab("pending")}
          className={`flex-1 flex flex-col sm:flex-row justify-center items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
            tab === "pending" 
              ? "bg-white text-zinc-900 shadow-sm" 
              : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <span>Pending</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${tab === "pending" ? "bg-orange-100 text-orange-600" : "bg-zinc-200"}`}>{pendingOrders.length}</span>
        </button>
        
        <button
          onClick={() => setTab("completed")}
          className={`flex-1 flex flex-col sm:flex-row justify-center items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
            tab === "completed" 
              ? "bg-white text-zinc-900 shadow-sm" 
              : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <span>Completed</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${tab === "completed" ? "bg-green-100 text-green-600" : "bg-zinc-200"}`}>{completedOrders.length}</span>
        </button>

        <button
          onClick={() => setTab("cancelled")}
          className={`flex-1 flex flex-col sm:flex-row justify-center items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
            tab === "cancelled" 
              ? "bg-white text-zinc-900 shadow-sm" 
              : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <span>Cancelled</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${tab === "cancelled" ? "bg-red-100 text-red-600" : "bg-zinc-200"}`}>{cancelledOrders.length}</span>
        </button>
      </div>

      {/* FEED LIST */}
      <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50 overflow-hidden">
        {loading ? (
          <div className="p-32 flex flex-col items-center justify-center">
             <Loader2 className="w-10 h-10 text-primary animate-spin" />
             <p className="mt-4 text-zinc-400 font-bold italic">Synchronizing ledger...</p>
          </div>
        ) : activeRecords.length === 0 ? (
          <div className="p-32 text-center space-y-4">
             <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto opacity-30">
                {tab === "cancelled" ? <XCircle className="w-8 h-8" /> : <Package className="w-8 h-8" />}
             </div>
             <p className="text-zinc-400 font-bold">No {tab} orders found in the database.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
             {activeRecords.map((order) => (
                <div key={order.id} className="p-8 hover:bg-zinc-50/50 transition-colors flex flex-col sm:flex-row items-center gap-8 group">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-900 flex flex-col items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                      <span className="text-[10px] font-black opacity-50 uppercase">{order.serviceSize || "GAS"}</span>
                      <span className="text-xs font-black">×{order.quantity || 1}</span>
                   </div>
                   
                   <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                         <p className="font-extrabold text-zinc-900 text-lg">{order.customerName || "Unknown Customer"}</p>
                         <StatusBadge status={order.status} />
                         <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border border-zinc-200 px-2 py-0.5 rounded-md">ID: {order.id.slice(0, 6)}...</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-zinc-400">
                         <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="uppercase tracking-tight truncate max-w-[200px]">{order.address || "No address provided"}</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                               {order.createdAt ? new Date(order.createdAt.toMillis()).toLocaleString() : "Unknown Time"}
                            </span>
                         </div>
                         <div className="flex items-center gap-1.5 border-l border-zinc-200 pl-4">
                            <span className="uppercase tracking-widest">Total: <span className="text-zinc-900">GH₵{order.totalPrice?.toFixed(2) || "0.00"}</span></span>
                         </div>
                      </div>
                   </div>

                   <div className="flex flex-col sm:flex-row items-center gap-6 border-t sm:border-t-0 sm:border-l border-zinc-100 pt-4 sm:pt-0 pl-0 sm:pl-6">
                      <div className="text-center sm:text-right flex flex-col sm:flex-col items-center sm:items-end w-full">
                         <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                           <Truck className="w-3 h-3" /> Assigned Rider
                         </p>
                         <span className={`px-3 py-1.5 rounded-lg text-xs font-extrabold ${order.riderName ? "bg-zinc-100 text-zinc-900" : "bg-red-50 text-red-600 border border-red-100"}`}>
                           {order.riderName || "NO RIDER ASSIGNED"}
                         </span>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string, bg: string, color: string }> = {
    pending: { label: "Requested", bg: "bg-blue-50 border border-blue-100", color: "text-blue-600" },
    accepted: { label: "Dispatched", bg: "bg-orange-50 border border-orange-100", color: "text-orange-600" },
    at_station: { label: "Refilling", bg: "bg-primary/10 border border-primary/20", color: "text-primary" },
    en_route: { label: "Returning", bg: "bg-green-50 border border-green-100", color: "text-green-600" },
    delivered: { label: "Check OTP", bg: "bg-zinc-900 border border-zinc-900", color: "text-white" },
    completed: { label: "Success", bg: "bg-green-600 border border-green-600", color: "text-white shadow-xl shadow-green-600/20" },
    cancelled: { label: "Cancelled", bg: "bg-red-600 border border-red-600", color: "text-white shadow-xl shadow-red-600/20" },
  };

  const config = configs[status] || configs.pending;
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${config.bg} ${config.color}`}>
       {config.label}
    </span>
  );
}
