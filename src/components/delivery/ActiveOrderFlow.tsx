"use client";

import React from "react";
import { Order, OrderStatus } from "@/types/order";
import { 
  Phone, 
  MapPin, 
  Navigation, 
  PackageCheck, 
  Flame, 
  CheckCircle2, 
  AlertTriangle,
  Loader2
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

interface ActiveOrderFlowProps {
  order: Order;
}

export const ActiveOrderFlow: React.FC<ActiveOrderFlowProps> = ({ order }) => {
  const [loading, setLoading] = React.useState(false);

  const updateStatus = async (newStatus: OrderStatus) => {
    setLoading(true);
    try {
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "accepted": return <Navigation className="w-6 h-6 text-blue-500" />;
      case "at_station": return <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />;
      case "refilling": return <Flame className="w-6 h-6 text-orange-600" />;
      case "en_route": return <Navigation className="w-6 h-6 text-green-500" />;
      default: return <PackageCheck className="w-6 h-6 text-zinc-400" />;
    }
  };

  const getStepDescription = (status: OrderStatus) => {
    switch (status) {
      case "accepted": return "Heading to pickup location";
      case "at_station": return "At the gas station";
      case "refilling": return "Refilling gas cylinders";
      case "en_route": return "Returning to customer's location";
      default: return "Pending action";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Info */}
      <div className="bg-zinc-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <Navigation className="w-24 h-24 rotate-45" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <p className="text-zinc-400 text-xs font-black uppercase tracking-widest">Active Delivery</p>
            <h2 className="text-4xl font-black tracking-tight">{order.serviceSize} × {order.quantity}</h2>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-primary text-[10px] font-black uppercase rounded-lg">LIVE TRACKING</span>
              <span className="text-zinc-400 text-sm font-bold">Ref: {order.id.slice(0, 8)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Customer</p>
                <p className="text-lg font-black">{order.customerName}</p>
             </div>
             <a href={`tel:${order.customerPhone}`} className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-colors border border-white/5">
                <Phone className="w-6 h-6 text-primary" />
             </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Progress Card */}
        <div className="lg:col-span-12">
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-xl shadow-zinc-200/50">
               <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-zinc-50 rounded-xl">
                     {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1 italic">Current Action</p>
                    <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">{getStepDescription(order.status)}</h3>
                  </div>
               </div>

               {/* Action Buttons based on status */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <WorkflowButton 
                    label="At Station" 
                    icon={Loader2} 
                    active={order.status === "accepted"} 
                    completed={["at_station", "refilling", "en_route", "delivered", "completed"].includes(order.status)}
                    onClick={() => updateStatus("at_station")}
                    loading={loading}
                  />
                  <WorkflowButton 
                    label="Refilling" 
                    icon={Flame} 
                    active={order.status === "at_station"} 
                    completed={["refilling", "en_route", "delivered", "completed"].includes(order.status)}
                    onClick={() => updateStatus("refilling")}
                    loading={loading}
                  />
                  <WorkflowButton 
                    label="En Route" 
                    icon={Navigation} 
                    active={order.status === "refilling"} 
                    completed={["en_route", "delivered", "completed"].includes(order.status)}
                    onClick={() => updateStatus("en_route")}
                    loading={loading}
                  />
                  <WorkflowButton 
                    label="Delivered" 
                    icon={CheckCircle2} 
                    active={order.status === "en_route"} 
                    completed={["delivered", "completed"].includes(order.status)}
                    onClick={() => updateStatus("delivered")}
                    loading={loading}
                  />
               </div>

               {/* OTP Verification Section */}
               {order.status === "delivered" && (
                 <div className="mt-10 p-8 bg-primary/5 rounded-[2.5rem] border-2 border-primary/20 border-dashed text-center space-y-4 animate-in zoom-in-95 duration-500">
                    <div>
                       <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-2">Handoff Verification Code</p>
                       <h4 className="text-5xl font-black text-zinc-900 tracking-[0.3em]">{order.otp || "------"}</h4>
                    </div>
                    <p className="text-sm font-medium text-zinc-500 max-w-xs mx-auto">
                       Ask the customer to enter this code in their app to confirm receipt and release your payment.
                    </p>
                 </div>
               )}
            </div>
        </div>

        {/* Address Card */}
        <div className="lg:col-span-12">
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-xl shadow-zinc-200/50 flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center shrink-0">
                  <MapPin className="w-10 h-10 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                   <p className="text-xs font-black text-zinc-400 uppercase tracking-widest italic">Delivery Destination</p>
                   <p className="text-2xl font-black text-zinc-900 uppercase">{order.address}</p>
                </div>
                <button className="px-10 py-5 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:translate-y-1 transition-all flex items-center gap-3">
                   <Navigation className="w-5 h-5 text-primary" />
                   Open Maps
                </button>
            </div>
        </div>
      </div>
      
      {/* Help Section */}
      <div className="flex items-center gap-4 p-8 bg-zinc-100 rounded-[2.5rem]">
         <AlertTriangle className="w-10 h-10 text-zinc-400 shrink-0" />
         <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider leading-relaxed">
           Help: Always verify the cylinder QR code at the station before refilling. If there is a price mismatch, call the customer immediately.
         </p>
      </div>
    </div>
  );
};

function WorkflowButton({ label, icon: Icon, active, completed, onClick, loading }: { label: string, icon: any, active: boolean, completed: boolean, onClick: () => void, loading: boolean }) {
  if (completed) {
    return (
      <div className="p-6 bg-green-50 border border-green-100 rounded-[2rem] flex flex-col items-center gap-3 text-green-600">
         <CheckCircle2 className="w-8 h-8" />
         <span className="text-[10px] font-black uppercase tracking-widest">{label} Done</span>
      </div>
    );
  }

  return (
    <button 
      disabled={!active || loading}
      onClick={onClick}
      className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 group ${
        active 
          ? "border-primary bg-white shadow-xl shadow-primary/10 hover:-translate-y-1" 
          : "border-zinc-100 bg-zinc-50 opacity-40 cursor-not-allowed"
      }`}
    >
      <Icon className={`w-8 h-8 transition-colors ${active ? "text-primary group-hover:scale-110" : "text-zinc-300"}`} />
      <span className={`text-[10px] font-black uppercase tracking-widest ${active ? "text-zinc-900" : "text-zinc-400"}`}>
        {loading && active ? "Setting..." : label}
      </span>
    </button>
  );
}
