"use client";

import React, { useEffect, useState } from "react";
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Loader2,
  TrendingUp,
  Flame,
  Calendar
} from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy 
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Order } from "@/types/order";

export default function DeliveryOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Fetch all orders assigned to this rider
    const q = query(
      collection(db, "orders"),
      where("riderId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      setOrders(ordersData);
      
      // Calculate total earnings from completed orders
      const earnings = ordersData
        .filter(o => o.status === "completed")
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      
      setTotalEarnings(earnings);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight uppercase">My Deliveries</h1>
          <p className="text-zinc-500 font-medium italic">Comprehensive log of your operational performance.</p>
        </div>
        
        <div className="bg-zinc-900 px-8 py-4 rounded-3xl text-white flex items-center gap-6 shadow-xl shadow-zinc-200">
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Revenue</p>
              <p className="text-2xl font-black text-primary">GH₵ {totalEarnings.toFixed(2)}</p>
           </div>
           <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
           </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-zinc-100 shadow-sm">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">Accessing Ledger...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[3rem] border border-zinc-100 shadow-xl shadow-zinc-200/50">
           <div className="w-24 h-24 bg-zinc-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 opacity-50">
             <Package className="w-10 h-10 text-zinc-300" />
           </div>
           <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">No Delivery Records</h3>
           <p className="text-zinc-500 font-medium max-w-sm mx-auto">You haven't completed any deliveries yet. Head to the dashboard to find active requests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <div key={order.id} className="group bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-sm hover:shadow-xl hover:shadow-zinc-200/40 transition-all duration-300">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div className="flex gap-6 items-start">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                    order.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-zinc-50 text-zinc-400'
                  }`}>
                    <Flame className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                         order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'
                       }`}>
                         {order.status}
                       </span>
                       <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">#{order.id.slice(0, 8)}</span>
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tight leading-none">{order.serviceSize} × {order.quantity}</h3>
                    <div className="flex items-center gap-4 mt-4">
                       <p className="text-sm text-zinc-500 font-bold flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" /> {order.address}
                       </p>
                       <p className="text-sm text-zinc-500 font-bold flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> {new Date(order.createdAt?.toMillis() || Date.now()).toLocaleDateString('en-GB')}
                       </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col justify-between items-end w-full lg:w-auto border-t lg:border-t-0 pt-6 lg:pt-0 border-zinc-50">
                   <div className="text-left lg:text-right space-y-1">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Earnings</p>
                      <p className="text-3xl font-black text-zinc-900 tracking-tight">GH₵ {(order.totalPrice || 0).toFixed(2)}</p>
                   </div>
                   {order.status === "completed" && (
                     <div className="mt-2 flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                     </div>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
