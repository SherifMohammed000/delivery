"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { RiderTrackerMap } from "@/components/customer/RiderTrackerMap";
import { sendPushNotification } from "@/lib/utils/notifications";
import { sendEmailNotification } from "@/lib/utils/email";
import {
  ShoppingBag,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  Flame,
  ChevronDown,
  ChevronUp,
  User,
  Banknote,
  CreditCard,
  X,
} from "lucide-react";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; step: number }> = {
  searching:  { label: "Finding Rider",  color: "text-amber-600",  bg: "bg-amber-50 border-amber-200",  step: 0 },
  assigned:   { label: "Rider Assigned", color: "text-blue-600",   bg: "bg-blue-50 border-blue-200",    step: 1 },
  accepted:   { label: "Rider En Route", color: "text-blue-600",   bg: "bg-blue-50 border-blue-200",    step: 1 },
  at_station: { label: "At Gas Station", color: "text-purple-600", bg: "bg-purple-50 border-purple-200",step: 2 },
  refilling:  { label: "Refilling",      color: "text-purple-600", bg: "bg-purple-50 border-purple-200",step: 2 },
  en_route:   { label: "On the Way",     color: "text-primary",    bg: "bg-orange-50 border-orange-200",step: 3 },
  delivered:  { label: "Delivered",      color: "text-green-600",  bg: "bg-green-50 border-green-200",  step: 4 },
  completed:  { label: "Completed",      color: "text-green-600",  bg: "bg-green-50 border-green-200",  step: 4 },
  cancelled:  { label: "Cancelled",      color: "text-red-500",    bg: "bg-red-50 border-red-200",      step: -1 },
};

const STEPS = ["Rider Assigned", "Picked Up Cylinder", "At Gas Station", "Heading to You", "Delivered"];

function TrackingSteps({ status }: { status: string }) {
  const currentStep = STATUS_CONFIG[status]?.step ?? 0;
  return (
    <div className="flex items-center gap-0 w-full">
      {STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
              i < currentStep ? "bg-green-500 border-green-500 text-white" :
              i === currentStep ? "bg-zinc-900 border-zinc-900 text-white" :
              "bg-white border-zinc-200 text-zinc-300"
            }`}>
              {i < currentStep
                ? <CheckCircle2 className="w-4 h-4" />
                : i === currentStep
                  ? <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  : <div className="w-2 h-2 bg-zinc-300 rounded-full" />
              }
            </div>
            <p className={`text-[8px] font-black uppercase tracking-wide text-center leading-tight hidden sm:block ${
              i <= currentStep ? "text-zinc-700" : "text-zinc-300"
            }`}>{step}</p>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 flex-1 transition-all ${i < currentStep ? "bg-green-400" : "bg-zinc-100"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  const [expanded, setExpanded] = useState(false);
  const [riderInfo, setRiderInfo] = useState<any>(null);
  const [otpInput, setOtpInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.searching;
  const isActive = !["completed", "cancelled"].includes(order.status);

  useEffect(() => {
    if (order.riderId && !riderInfo) {
      getDoc(doc(db, "users", order.riderId)).then((snap) => {
        if (snap.exists()) setRiderInfo({ uid: order.riderId, ...snap.data() });
      });
    }
  }, [order.riderId]);

  const createdAt = order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  const handleVerifyOtp = async () => {
    if (otpInput !== order.otp) {
      setError("Invalid verification code. Please check with the rider.");
      return;
    }

    setVerifying(true);
    setError(null);
    try {
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, {
        status: "completed",
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Notify customer
      await sendPushNotification({
        userId: order.customerId,
        title: "✅ Order Completed!",
        body: "Thank you for using GHo-VA! Your gas refill is complete.",
        data: { url: "/orders", orderId: order.id }
      });

      // Notify rider
      if (order.riderId) {
        await sendPushNotification({
          userId: order.riderId,
          title: "💰 Delivery Verified!",
          body: `Customer confirmed delivery for order #${order.id.slice(-6).toUpperCase()}.`,
          data: { url: "/delivery/orders", orderId: order.id }
        });
      }

    } catch (err) {
      console.error("OTP verification error:", err);
      setError("Failed to complete order. Check your connection.");
    } finally {
      setVerifying(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, {
        status: "cancelled",
        updatedAt: serverTimestamp(),
      });

      // Send push notification
      await sendPushNotification({
        userId: order.customerId,
        title: "❌ Order Cancelled",
        body: `Your order #${order.id.slice(-6).toUpperCase()} has been cancelled.`,
        data: { url: "/orders", orderId: order.id }
      });

      // Send email notification
      await sendEmailNotification({
        templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ORDER_CANCELLED || "order_cancelled_template",
        templateParams: {
          customer_name: order.customerName || "Customer",
          customer_email: order.customerEmail,
          user_name: order.customerName || "Customer",
          user_email: order.customerEmail,
          order_id: order.id.slice(-6).toUpperCase(),
          company_name: "Ghova",
          company_logo: "https://ghova.vercel.app/ghova.png",
        },
      });

    } catch (err) {
      console.error("Cancellation error:", err);
      alert("Failed to cancel order. Please try again.");
    }
  };

  return (
    <div className={`bg-white rounded-[2rem] border overflow-hidden shadow-sm transition-all duration-300 ${
      isActive ? "border-primary/30 shadow-primary/10 shadow-lg" : "border-zinc-100"
    }`}>
      {/* Card Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-6 flex items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          {/* Status Icon */}
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isActive ? "bg-zinc-900" : "bg-zinc-100"
          }`}>
            {order.status === "completed" ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : order.status === "cancelled" ? (
              <X className="w-6 h-6 text-red-400" />
            ) : (
              <Truck className={`w-6 h-6 ${isActive ? "text-primary animate-pulse" : "text-zinc-400"}`} />
            )}
          </div>

          {/* Order Info */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${status.bg} ${status.color}`}>
                {status.label}
              </span>
              {isActive && (
                <span className="text-[9px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                  Live
                </span>
              )}
            </div>
            <p className="font-black text-zinc-900 text-base mt-1 tracking-tight">
              {order.quantity}× Cylinder Refill
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-zinc-400 font-medium">{createdAt}</span>
              <span className="text-zinc-200">·</span>
              <div className="flex items-center gap-1 text-zinc-400">
                {order.paymentMethod === "cash" ? (
                  <Banknote className="w-3 h-3" />
                ) : (
                  <CreditCard className="w-3 h-3" />
                )}
                <span className="text-[10px] font-bold uppercase">{order.paymentMethod === "cash" ? "Pay on Delivery" : "Paid Online"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total</p>
            <p className="text-lg font-black text-zinc-900">GH₵ {order.totalPrice?.toFixed(2) || "—"}</p>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-zinc-400 shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-400 shrink-0" />
          )}
        </div>
      </button>

      {/* Expanded Panel */}
      {expanded && (
        <div className="border-t border-zinc-100 animate-in slide-in-from-top-2 duration-200">
          {/* Tracking Steps */}
          {isActive && (
            <div className="px-6 pt-6 pb-4">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Delivery Progress</p>
              <TrackingSteps status={order.status} />
            </div>
          )}

          {/* Live Map */}
          {isActive && order.riderId && order.location && (
            <div className="px-6 pb-6">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Live Rider Location</p>
              <div className="rounded-3xl overflow-hidden border border-zinc-100 h-64">
                <RiderTrackerMap
                  riderId={order.riderId}
                  customerLocation={order.location}
                  status={order.status}
                />
              </div>
            </div>
          )}

          {/* Order Details Grid */}
          <div className="px-6 pb-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <DetailBox label="Order ID" value={`#${order.id.slice(-6).toUpperCase()}`} />
            <DetailBox label="Unit Price" value={`GH₵ ${order.unitPrice?.toFixed(2)}`} />
            <DetailBox label="Cylinders" value={`${order.quantity}`} />
            <DetailBox label="Payment" value={order.paymentStatus === "paid" ? "Paid" : "Cash on Delivery"} />
            {order.address && <DetailBox label="Location" value={order.address} className="col-span-2" />}
          </div>

          {/* Rider Info */}
          {riderInfo && (
            <div className="mx-6 mb-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-200 overflow-hidden shrink-0">
                {riderInfo.verificationDocs?.facialPhotoUrl ? (
                  <img src={riderInfo.verificationDocs.facialPhotoUrl} alt="Rider" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-6 h-6 text-zinc-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Assigned Rider</p>
                <p className="font-black text-zinc-900">{riderInfo.name || "Rider"}</p>
                {riderInfo.phone && (
                  <a href={`tel:${riderInfo.phone}`} className="text-xs font-bold text-primary hover:underline">{riderInfo.phone}</a>
                )}
              </div>
              {/* Verification Section */}
              {order.status === "delivered" ? (
                <div className="flex flex-col gap-2 min-w-[120px]">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter OTP"
                    value={otpInput}
                    onChange={(e) => {
                      setOtpInput(e.target.value.replace(/\D/g, ""));
                      setError(null);
                    }}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-center font-black tracking-widest text-zinc-900 focus:ring-2 focus:ring-primary outline-none text-sm"
                  />
                  <button
                    disabled={otpInput.length !== 6 || verifying}
                    onClick={handleVerifyOtp}
                    className="w-full bg-zinc-900 text-white rounded-xl py-2 text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-colors disabled:opacity-50"
                  >
                    {verifying ? "..." : "Verify"}
                  </button>
                  {error && <p className="text-[8px] text-red-500 font-bold leading-tight">{error}</p>}
                </div>
              ) : (
                <div className="text-right">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Verify Code</p>
                  <p className="text-xl font-black tracking-[0.2em] text-zinc-900">{order.id.slice(-4).toUpperCase()}</p>
                </div>
              )}
            </div>
          )}

          {/* Cancellation Button for Active Orders */}
          {isActive && order.status !== "delivered" && (
            <div className="px-6 pb-6">
              <button
                onClick={handleCancelOrder}
                className="w-full py-4 border-2 border-red-100 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel Order
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailBox({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`bg-zinc-50 rounded-2xl p-4 border border-zinc-100 ${className}`}>
      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-black text-zinc-900 truncate">{value}</p>
    </div>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("customerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Orders fetching error:", error);
      // Stop loading so the user isn't stuck on a blank screen
      setLoading(false);
      // Usually this error is due to a missing composite index.
      // The console will have a direct link to create it!
    });

    return () => unsub();
  }, [user]);

  const activeOrders = orders.filter((o) => !["completed", "cancelled"].includes(o.status));
  const pastOrders = orders.filter((o) => ["completed", "cancelled"].includes(o.status));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-28 pb-32 md:pb-12">
      <div className="mb-10 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 bg-primary rounded-full" />
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Order Management</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase">My Orders</h1>
        <p className="text-zinc-500 font-medium">Track active deliveries and view past orders.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-32">
          <div className="w-24 h-24 bg-zinc-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-zinc-300" />
          </div>
          <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter italic mb-3">No Orders Yet</h3>
          <p className="text-zinc-400 font-medium mb-8">Your refill orders will appear here once you place one.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary transition-all shadow-xl"
          >
            <Flame className="w-4 h-4" />
            Place Your First Order
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Active Orders */}
          {activeOrders.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <h2 className="text-xs font-black text-zinc-900 uppercase tracking-widest">Active Orders ({activeOrders.length})</h2>
              </div>
              {activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </section>
          )}

          {/* Past Orders */}
          {pastOrders.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-zinc-400" />
                <h2 className="text-xs font-black text-zinc-900 uppercase tracking-widest">Past Orders ({pastOrders.length})</h2>
              </div>
              {pastOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
