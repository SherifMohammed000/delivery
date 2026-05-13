"use client";

import React, { useEffect, useState } from "react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Order } from "@/types/order";
import { 
  X, 
  Package, 
  Clock, 
  MapPin, 
  Truck, 
  Calendar,
  ChevronRight,
  Loader2,
  TrendingUp
} from "lucide-react";

interface CustomerOrderHistoryProps {
  customer: {
    id: string;
    name: string;
    email: string;
  };
  onClose: () => void;
}

export default function CustomerOrderHistory({ customer, onClose }: CustomerOrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customer.id) return;

    const ordersQuery = query(
      collection(db, "orders"),
      where("customerId", "==", customer.id),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching customer orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [customer.id]);

  const totalSpent = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-zinc-950/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-zinc-200 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 sm:p-10 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-primary/20">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter leading-tight">
                {customer.name}
              </h2>
              <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">
                Transaction Archive • {orders.length} Orders
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-4 bg-white border border-zinc-200 rounded-2xl text-zinc-400 hover:text-zinc-900 hover:border-zinc-900 transition-all shadow-sm"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Summary */}
        <div className="px-8 sm:px-10 py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div className="bg-zinc-900 rounded-2xl p-5 text-white flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Volume</p>
                 <p className="text-2xl font-black tracking-tighter">GH₵ {totalSpent.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary opacity-50" />
           </div>
           <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10 flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary">Last Order</p>
                 <p className="text-lg font-black tracking-tight text-zinc-900">
                    {orders[0] ? orders[0].createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
                 </p>
              </div>
              <Calendar className="w-8 h-8 text-primary opacity-50" />
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-6 pt-2">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="mt-4 text-zinc-400 font-bold italic">Retrieving archive...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto opacity-30">
                <Package className="w-10 h-10" />
              </div>
              <p className="text-zinc-400 font-bold text-lg">No orders found for this customer.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="group bg-white border border-zinc-100 rounded-3xl p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden"
                >
                   {/* Background Glow */}
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

                   <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex flex-col items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                      <span className="text-[9px] font-black opacity-50 uppercase">{order.serviceSize}</span>
                      <span className="text-xs font-black">×{order.quantity}</span>
                   </div>

                   <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                         <span className="text-sm font-black text-zinc-900 uppercase tracking-tight">#{order.id.slice(-6).toUpperCase()}</span>
                         <StatusBadge status={order.status} />
                         <span className="text-xs font-bold text-zinc-400 ml-auto sm:ml-0">
                            {order.createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                         </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-zinc-400">
                         <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            <span className="truncate max-w-[200px] uppercase tracking-tight">{order.address}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <Truck className="w-3.5 h-3.5 text-primary" />
                            <span>{order.riderName || "Searching..." }</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>{order.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                      </div>
                   </div>

                   <div className="text-right shrink-0">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Order Value</p>
                      <p className="text-lg font-black text-zinc-900">GH₵ {order.totalPrice.toFixed(2)}</p>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 sm:p-10 border-t border-zinc-100 bg-zinc-50/30">
          <button 
            onClick={onClose}
            className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all shadow-xl shadow-zinc-900/20 active:scale-[0.98]"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string, bg: string, color: string }> = {
    pending: { label: "Requested", bg: "bg-blue-50", color: "text-blue-600" },
    accepted: { label: "Dispatched", bg: "bg-orange-50", color: "text-orange-600" },
    at_station: { label: "Refilling", bg: "bg-primary/10", color: "text-primary" },
    en_route: { label: "Returning", bg: "bg-green-50", color: "text-green-600" },
    delivered: { label: "Check OTP", bg: "bg-zinc-900", color: "text-white" },
    completed: { label: "Success", bg: "bg-green-600", color: "text-white" },
    cancelled: { label: "Cancelled", bg: "bg-red-50", color: "text-red-600" },
  };

  const config = configs[status] || configs.pending;
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${config.bg} ${config.color}`}>
       {config.label}
    </span>
  );
}
