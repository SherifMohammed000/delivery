"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Truck, 
  Users, 
  TrendingUp, 
  Loader2,
  Package,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  UserCheck,
  CheckCircle2
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import { 
  collection, 
  query, 
  where, 
  onSnapshot
} from "firebase/firestore";
import { Order } from "@/types/order";
import CustomerOrderHistory from "@/components/admin/CustomerOrderHistory";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    liveOps: 0,
    activePartners: 0,
    totalCustomers: 0,
    commission: 0,
  });
  const [pendingPartnersCount, setPendingPartnersCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  
  // Network Directory States
  const [riders, setRiders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [directoryTab, setDirectoryTab] = useState<"riders" | "customers">("riders");
  
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  useEffect(() => {
    // 1. Listen for Live Operations (Non-completed orders)
    const liveOpsQuery = query(
      collection(db, "orders"), 
      where("status", "!=", "completed")
    );
    const unsubscribeOrders = onSnapshot(liveOpsQuery, (snapshot) => {
      setStats(prev => ({ ...prev, liveOps: snapshot.size }));
      
      const sortedOrders = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Order))
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
        .slice(0, 5);
      setRecentOrders(sortedOrders);
    });

    // 2. Listen for User Profiles (Populating Directory & Counts)
    const usersQuery = query(collection(db, "users"));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      let partnersCount = 0;
      let customersCount = 0;
      let pendingCount = 0;

      const loadedRiders: any[] = [];
      const loadedCustomers: any[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const userExt = { id: doc.id, ...data };

        if (data.role === "delivery") {
          loadedRiders.push(userExt);
          if (data.status === "active") partnersCount++;
          if (data.status === "pending") pendingCount++;
        } else if (data.role === "customer") {
          customersCount++;
          loadedCustomers.push(userExt);
        }
      });

      loadedRiders.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      loadedCustomers.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));

      setRiders(loadedRiders);
      setCustomers(loadedCustomers);

      setStats(prev => ({ 
        ...prev, 
        activePartners: partnersCount, 
        totalCustomers: customersCount 
      }));
      setPendingPartnersCount(pendingCount);
      setLoading(false);
    });

    // 3. Listen for Commission (Completed orders - estimating 20%)
    const completedQuery = query(
      collection(db, "orders"), 
      where("status", "==", "completed")
    );
    const unsubscribeCommission = onSnapshot(completedQuery, (snapshot) => {
      const totalVolume = snapshot.docs.reduce((acc, doc) => acc + (doc.data().totalPrice || 0), 0);
      setStats(prev => ({ ...prev, commission: totalVolume * 0.2 }));
    });

    return () => {
      unsubscribeOrders();
      unsubscribeUsers();
      unsubscribeCommission();
    };
  }, []);

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
             <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Operational System Online</span>
          </div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase">Command Center</h1>
          <p className="text-zinc-500 font-medium tracking-tight">Ecosystem Monitoring & Infrastructure Management</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-5">
              <div className="flex -space-x-2">
                 {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-400">
                       R{i}
                    </div>
                 ))}
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Riders</p>
                 <p className="text-sm font-black text-zinc-900">{stats.activePartners} Ready</p>
              </div>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Live Operations" 
          value={stats.liveOps.toString()} 
          icon={Activity} 
          color="text-primary" 
          bg="bg-primary/5" 
          description="Active Triangular Flows"
        />
        <StatCard 
          label="Network Riders" 
          value={stats.activePartners.toString()} 
          icon={Truck} 
          color="text-blue-600" 
          bg="bg-blue-50" 
          description="Verified Delivery Staff"
        />
        <StatCard 
          label="Customer Base" 
          value={stats.totalCustomers.toString()} 
          icon={Users} 
          color="text-green-600" 
          bg="bg-green-50" 
          description="Ho Municipality Users"
        />
        <StatCard 
          label="Est. Commission" 
          value={`GH₵ ${stats.commission.toFixed(2)}`} 
          icon={TrendingUp} 
          color="text-purple-600" 
          bg="bg-purple-50" 
          description="MTD Platform cut (20%)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Recent Live Feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-3">
               <Package className="w-5 h-5 text-primary" />
               Recent Live Operations
             </h3>
             <Link href="/admin/orders" className="text-xs font-black text-zinc-400 hover:text-zinc-600 uppercase tracking-widest flex items-center gap-2 transition-colors">
                View Full Stream
                <ArrowUpRight className="w-4 h-4" />
             </Link>
          </div>

          <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50 overflow-hidden">
             {loading ? (
                <div className="p-20 flex flex-col items-center justify-center">
                   <Loader2 className="w-10 h-10 text-primary animate-spin" />
                   <p className="mt-4 text-zinc-400 font-bold italic">Synchronizing feeds...</p>
                </div>
             ) : recentOrders.length === 0 ? (
                <div className="p-20 text-center space-y-4">
                   <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto opacity-30">
                      <Truck className="w-8 h-8" />
                   </div>
                   <p className="text-zinc-400 font-bold">No active orders reported yet.</p>
                </div>
             ) : (
                <div className="divide-y divide-zinc-50">
                   {recentOrders.map((order) => (
                      <div key={order.id} className="p-8 hover:bg-zinc-50/50 transition-colors flex flex-col sm:flex-row items-center gap-8">
                         <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-900 flex flex-col items-center justify-center text-white shrink-0">
                            <span className="text-[10px] font-black opacity-50 uppercase">{order.serviceSize}</span>
                            <span className="text-xs font-black">×{order.quantity}</span>
                         </div>
                         
                         <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-3">
                               <p className="font-extrabold text-zinc-900">{order.customerName}</p>
                               <StatusBadge status={order.status} />
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold text-zinc-400">
                               <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span className="uppercase tracking-tight">{order.address}</span>
                               </div>
                               <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Just now</span>
                               </div>
                            </div>
                         </div>

                         <div className="flex items-center gap-3">
                            <div className="text-right sr-only sm:not-sr-only">
                               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Assigned Rider</p>
                               <p className="text-xs font-extrabold text-zinc-900">{order.riderName || "Searching..."}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center group cursor-pointer hover:bg-zinc-900 transition-all">
                               <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>
        </div>

        {/* Right: Alerts & Network Health */}
        <div className="lg:col-span-4 space-y-6">
           {/* Verification Alert */}
           <div className={`p-8 rounded-[3rem] text-white relative overflow-hidden shadow-2xl transition-all duration-500 ${
             pendingPartnersCount > 0 
               ? "bg-[#4D3117] shadow-secondary/20" 
               : "bg-zinc-100 text-zinc-400 grayscale"
           }`}>
              <div className="relative z-10 space-y-6">
                 <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/5">
                    <ShieldCheck className="w-7 h-7 text-primary" />
                 </div>
                 <div className="space-y-2">
                    <h4 className="text-2xl font-black uppercase tracking-tighter">Security Alert</h4>
                    <p className={`text-sm font-medium leading-relaxed ${pendingPartnersCount > 0 ? "text-zinc-300" : "text-zinc-400"}`}>
                       {pendingPartnersCount > 0 
                         ? `There are ${pendingPartnersCount} new delivery riders awaiting verification and document review.`
                         : "All rider applications have been reviewed. Network security is optimal."}
                    </p>
                 </div>
                 {pendingPartnersCount > 0 && (
                   <Link href="/admin/partners" className="flex items-center justify-center w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary-dark transition-all shadow-xl shadow-black/20">
                      Verify Applications
                   </Link>
                 )}
              </div>
              <Activity className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10 rotate-12" />
           </div>

           {/* Health Summary */}
           <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-xl shadow-zinc-200/50 space-y-8">
              <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Zone Performance</h4>
              <div className="space-y-6">
                 <PerformanceBar label="Ho Technical Uni" percentage={85} color="bg-green-500" />
                 <PerformanceBar label="Ho Central" percentage={60} color="bg-primary" />
                 <PerformanceBar label="Bankoe" percentage={45} color="bg-orange-400" />
              </div>
           </div>
        </div>
      </div>

      {/* NEW: Network Directory Section */}
      <div className="pt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 px-2">
           <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-3">
             <Users className="w-5 h-5 text-primary" />
             Network Directory
           </h3>
           
           <div className="flex bg-zinc-100 p-1.5 rounded-2xl w-full sm:w-auto">
             <button
                onClick={() => setDirectoryTab("riders")}
                className={`flex-1 sm:px-8 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                  directoryTab === "riders" 
                    ? "bg-white text-zinc-900 shadow-sm" 
                    : "text-zinc-400 hover:text-zinc-600"
                }`}
             >
                Riders
             </button>
             <button
                onClick={() => setDirectoryTab("customers")}
                className={`flex-1 sm:px-8 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                  directoryTab === "customers" 
                    ? "bg-white text-zinc-900 shadow-sm" 
                    : "text-zinc-400 hover:text-zinc-600"
                }`}
             >
                Customers
             </button>
           </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50 overflow-hidden">
           {loading ? (
              <div className="p-20 flex flex-col items-center justify-center">
                 <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
           ) : (
              <div className="divide-y divide-zinc-50">
                 {directoryTab === "riders" && riders.length === 0 && (
                   <p className="p-10 text-center text-zinc-400 font-bold">No riders found.</p>
                 )}
                 {directoryTab === "customers" && customers.length === 0 && (
                   <p className="p-10 text-center text-zinc-400 font-bold">No customers found.</p>
                 )}

                 {directoryTab === "riders" && riders.map(rider => (
                    <div key={rider.id} className="p-6 sm:p-8 hover:bg-zinc-50/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                       <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center border border-zinc-200 relative">
                             {rider.verificationDocs?.facialPhotoUrl ? (
                               <img src={rider.verificationDocs.facialPhotoUrl} alt="Face" className="w-full h-full object-cover rounded-2xl" />
                             ) : (
                               <Truck className="w-6 h-6 text-zinc-400" />
                             )}
                             {rider.status === "active" && (
                               <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white" />
                             )}
                          </div>
                          <div>
                             <h4 className="font-black text-zinc-900 text-lg tracking-tight mb-1">{rider.name}</h4>
                             <div className="flex items-center gap-3 text-xs font-bold text-zinc-400">
                                <div className="flex items-center gap-1.5">
                                   <Phone className="w-3.5 h-3.5" />
                                   <span>{rider.email.replace('@ghova.com', '')}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                   <Activity className="w-3.5 h-3.5" />
                                   <span className={rider.status === "active" ? "text-green-600" : "text-amber-500"}>
                                     {rider.status ? rider.status.toUpperCase() : "PENDING"}
                                   </span>
                                </div>
                             </div>
                          </div>
                       </div>

                       {rider.verificationDocs && (
                         <div className="flex items-center gap-3 bg-zinc-50 px-5 py-3 rounded-2xl border border-zinc-100">
                           <div className="text-right mr-2">
                             <p className="text-[10px] font-black tracking-widest uppercase text-zinc-400 mb-1">Bike Details</p>
                             <p className="text-xs font-bold text-zinc-900">{rider.verificationDocs.bikeModel}</p>
                           </div>
                           <div className="w-1 h-8 bg-zinc-200 rounded-full mx-2" />
                           <a href={rider.verificationDocs.idDocumentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase text-primary hover:text-black transition-colors rounded-lg">
                             <FileText className="w-4 h-4 text-primary shrink-0" />
                             <span>View ID</span>
                           </a>
                         </div>
                       )}
                    </div>
                 ))}

                 {directoryTab === "customers" && customers.map(customer => (
                    <div key={customer.id} className="group p-6 sm:p-8 hover:bg-zinc-50/50 transition-colors flex flex-col sm:flex-row items-center justify-between gap-6">
                       <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center border border-green-100">
                             <UserCheck className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                             <h4 className="font-black text-zinc-900 text-lg tracking-tight mb-1">{customer.name}</h4>
                             <div className="flex items-center gap-3 text-xs font-bold text-zinc-400">
                                <div className="flex items-center gap-1.5">
                                   {customer.email.includes('@ghova.com') ? (
                                      <Phone className="w-3.5 h-3.5" />
                                   ) : (
                                      <Mail className="w-3.5 h-3.5" />
                                   )}
                                   <span>{customer.email.replace('@ghova.com', '')}</span>
                                </div>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex flex-col items-end gap-3">
                          <div className="text-right sr-only sm:not-sr-only">
                             <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Account Role</p>
                             <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${customer.role === "admin" ? "bg-purple-100 text-purple-600" : "bg-zinc-100 text-zinc-500"}`}>
                                {customer.role || "Customer"}
                             </span>
                          </div>
                          <div 
                              onClick={() => setSelectedCustomer(customer)}
                              className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-4 py-2 bg-primary/5 rounded-xl border border-primary/10 hover:bg-primary hover:text-white transition-all cursor-pointer group-hover:scale-105"
                           >
                              View History
                           </div>
                       </div>
                    </div>
                 ))}
              </div>
           )}
        </div>
      </div>

      {/* Order History Modal */}
      {selectedCustomer && (
         <CustomerOrderHistory 
            customer={selectedCustomer} 
            onClose={() => setSelectedCustomer(null)} 
         />
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, description }: { label: string, value: string, icon: any, color: string, bg: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 flex flex-col items-start gap-5 group hover:shadow-2xl hover:shadow-zinc-300/50 transition-all">
      <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-zinc-900 tracking-tighter mb-1">{value}</p>
        <p className="text-[10px] font-bold text-zinc-500 italic uppercase">↑ {description}</p>
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
  };

  const config = configs[status] || configs.pending;
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${config.bg} ${config.color}`}>
       {config.label}
    </span>
  );
}

function PerformanceBar({ label, percentage, color }: { label: string, percentage: number, color: string }) {
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
          <span className="text-zinc-400">{label}</span>
          <span className="text-zinc-900">{percentage}%</span>
       </div>
       <div className="h-1.5 w-full bg-zinc-50 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }} />
       </div>
    </div>
  );
}
