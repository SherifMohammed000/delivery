"use client";

import React, { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Package,
  CheckCircle2,
  Loader2,
  User
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/contexts/auth-context";
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { AssignmentModal } from "@/components/delivery/AssignmentModal";
import { ActiveOrderFlow } from "@/components/delivery/ActiveOrderFlow";
import { OrderCard } from "@/components/delivery/OrderCard";
import { Order } from "@/types/order";
import { arrayUnion } from "firebase/firestore";
import { sendPushNotification } from "@/lib/utils/notifications";

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const [partnerStatus, setPartnerStatus] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [assignedOrder, setAssignedOrder] = useState<Order | null>(null);
  const [riderLocation, setRiderLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!user) return;

    // 1. Fetch Partner Status
    const fetchStatus = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setPartnerStatus(userDoc.data().status || "pending");
        setRejectionReason(userDoc.data().rejectionReason || null);
      }
    };
    fetchStatus();

    // 2. Listen for Pending Orders
    const pendingQuery = query(
      collection(db, "orders"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );

    const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
      setPendingOrders(orders);
      setLoading(false);
    }, (error) => {
      console.error("Pending orders listener error (likely missing index):", error);
      setLoading(false);
    });

    // 3. Listen for Current Rider's Active Order
    const activeQuery = query(
      collection(db, "orders"),
      where("riderId", "==", user.uid),
      where("status", "in", ["accepted", "at_station", "refilling", "en_route", "delivered"])
    );

    const unsubscribeActive = onSnapshot(activeQuery, (snapshot) => {
      if (!snapshot.empty) {
        const order = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Order;
        setActiveOrder(order);
      } else {
        setActiveOrder(null);
      }
    });

    // 4. Listen for Assigned Orders (Pending response)
    const assignedQuery = query(
      collection(db, "orders"),
      where("riderId", "==", user.uid),
      where("status", "==", "assigned")
    );

    const unsubscribeAssigned = onSnapshot(assignedQuery, (snapshot) => {
      if (!snapshot.empty) {
        setAssignedOrder({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Order);
      } else {
        setAssignedOrder(null);
      }
    });

    // 5. Listen for Own Location (Updated by hook)
    const unsubscribeRider = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      const data = snapshot.data();
      if (data?.currentLocation) {
        setRiderLocation(data.currentLocation);
      }
    });

    return () => {
      unsubscribePending();
      unsubscribeActive();
      unsubscribeAssigned();
      unsubscribeRider();
    };
  }, [user]);

  const handleAcceptOrder = async (orderId: string) => {
    if (!user) return;
    setAcceptingId(orderId);
    
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);
      const orderData = orderSnap.data();

      await updateDoc(orderRef, {
        status: "accepted",
        riderId: user.uid,
        riderName: user.displayName || "Rider",
        riderPhone: user.phoneNumber || "",
        updatedAt: serverTimestamp()
      });

      if (orderData?.customerId) {
        await sendPushNotification({
          userId: orderData.customerId,
          title: "🚀 Rider Assigned!",
          body: `${user.displayName || "A rider"} has accepted your order and is heading your way.`,
          data: { url: "/orders", orderId }
        });
      }
      // onSnapshot will automatically update the UI to ActiveOrderFlow
    } catch (error) {
      console.error("Error accepting order:", error);
      alert("Failed to accept order. It might have been taken by another rider.");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleAcceptAssignment = async (orderId: string) => {
    if (!user) return;
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);
      const orderData = orderSnap.data();

      await updateDoc(orderRef, {
        status: "accepted",
        updatedAt: serverTimestamp()
      });

      if (orderData?.customerId) {
        await sendPushNotification({
          userId: orderData.customerId,
          title: "🚀 Rider Assigned!",
          body: `Your assigned rider has confirmed your order and is heading your way.`,
          data: { url: "/orders", orderId }
        });
      }
    } catch (error) {
      console.error("Error accepting assignment:", error);
    }
  };

  const handleRejectAssignment = async (orderId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "searching",
        riderId: null,
        riderName: null,
        riderPhone: null,
        ignoredRiders: arrayUnion(user.uid),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error rejecting assignment:", error);
    }
  };

  if (loading || partnerStatus === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-zinc-500 font-bold italic">Synchronizing dashboard status...</p>
      </div>
    );
  }

  if (partnerStatus === "pending") {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="bg-white rounded-[3rem] p-12 text-center shadow-2xl shadow-blue-100 border border-blue-100">
           <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-pulse">
              <ShieldCheck className="w-12 h-12 text-blue-600" />
           </div>
           <h2 className="text-4xl font-black text-zinc-900 mb-4 tracking-tight uppercase">Verification in Progress</h2>
           <p className="text-lg text-zinc-500 font-medium mb-10 max-w-xl mx-auto leading-relaxed">
             Our team is currently reviewing your documents. Once verified, you'll gain access to live orders in your zone.
           </p>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <StatusStep icon={Clock} label="Application Submitted" active />
              <StatusStep icon={AlertCircle} label="Document Review" active />
              <StatusStep icon={MapPin} label="Zone Assignment" />
           </div>
        </div>
      </div>
    );
  }

  if (partnerStatus === "rejected") {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="bg-white rounded-[3rem] p-12 text-center shadow-2xl shadow-red-100 border border-red-100">
           <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="w-12 h-12 text-red-600" />
           </div>
           <h2 className="text-4xl font-black text-zinc-900 mb-4 tracking-tight uppercase">Application Rejected</h2>
           <div className="bg-red-50 p-6 rounded-2xl mb-10 text-left border border-red-100">
              <p className="text-sm font-black text-red-600 uppercase tracking-widest mb-2">Reason for Rejection:</p>
              <p className="text-red-700 font-medium leading-relaxed">{rejectionReason || "Please contact support for details."}</p>
           </div>
           <button className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all">
             Re-submit Documents
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {assignedOrder && (
        <AssignmentModal 
          order={assignedOrder}
          riderLocation={riderLocation}
          onAccept={handleAcceptAssignment}
          onReject={handleRejectAssignment}
        />
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-zinc-200 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl shadow-zinc-200/50 flex items-center justify-center relative group">
            {user?.photoURL ? (
              <Image 
                src={user.photoURL} 
                alt={user.displayName || "Rider"} 
                fill 
                className="object-cover transition-transform group-hover:scale-110"
              />
            ) : (
              <User className="w-10 h-10 text-zinc-400" />
            )}
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight uppercase">Dashboard</h1>
            <p className="text-zinc-500 font-medium">Verified Partner Portal • {user?.displayName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-green-50 text-green-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm border border-green-100">
           <div className="w-2.5 h-2.5 rounded-full bg-green-600 animate-pulse" />
           Operational System Active
        </div>
      </div>

      {activeOrder ? (
        <ActiveOrderFlow order={activeOrder} />
      ) : (
        <>
          {/* Stats Overview for Idle State */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Orders Available" value={pendingOrders.length.toString()} icon={Package} color="text-blue-600" bg="bg-blue-50" />
            <StatCard label="Today Earnings" value="GH₵ 0.00" icon={TrendingUp} color="text-green-600" bg="bg-green-50" />
            <StatCard label="Partner Score" value="100%" icon={CheckCircle2} color="text-purple-600" bg="bg-purple-50" />
          </div>

          <div className="space-y-6">
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Orders in Ho Central</h3>
             </div>

             {loading ? (
                <div className="py-20 text-center bg-white rounded-[3rem] border border-zinc-100 shadow-sm flex flex-col items-center">
                   <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                   <p className="text-zinc-500 font-bold italic">Synchronizing live order feed...</p>
                </div>
             ) : pendingOrders.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-20 text-center border border-zinc-100 shadow-xl shadow-zinc-200/50">
                  <div className="max-w-sm mx-auto space-y-6">
                    <div className="w-24 h-24 bg-zinc-50 rounded-[2rem] flex items-center justify-center mx-auto opacity-50">
                      <Package className="w-10 h-10 text-zinc-300" />
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">System Idle</h3>
                    <p className="text-zinc-500 font-medium leading-relaxed">No new refill requests in your zone. Keep this dashboard open to receive real-time alerts.</p>
                  </div>
                </div>
             ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   {pendingOrders.map(order => (
                      <OrderCard 
                        key={order.id} 
                        order={order} 
                        onAccept={handleAcceptOrder}
                        loading={acceptingId === order.id} 
                      />
                   ))}
                </div>
             )}
          </div>
        </>
      )}
    </div>
  );
}

function StatusStep({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <div className={`p-6 rounded-3xl border ${active ? "bg-white border-blue-200 shadow-sm" : "bg-zinc-50 border-transparent opacity-60"}`}>
      <Icon className={`w-8 h-8 mb-4 ${active ? "text-blue-600" : "text-zinc-400"}`} />
      <p className={`font-bold text-sm uppercase tracking-tight ${active ? "text-zinc-900" : "text-zinc-400"}`}>{label}</p>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }: { label: string, value: string, icon: any, color: string, bg: string }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 flex items-center gap-6">
      <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center shrink-0`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-zinc-900">{value}</p>
      </div>
    </div>
  );
}
