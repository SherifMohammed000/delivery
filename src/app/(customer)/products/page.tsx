"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Flame, 
  MapPin, 
  Truck, 
  ChevronRight, 
  Info, 
  Loader2,
  CheckCircle2,
  User,
  ShoppingBag,
  ArrowLeft,
  Banknote
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import { 
  collection, 
  addDoc,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp 
} from "firebase/firestore";

import { useAuth } from "@/lib/contexts/auth-context";
import { QuantityPicker } from "@/components/customer/QuantityPicker";
import { MapLocationPicker } from "@/components/customer/MapLocationPicker";
import { findPotentialRiders } from "@/lib/utils/dispatch";
import { RiderTrackerMap } from "@/components/customer/RiderTrackerMap";
import { PaystackButton } from "@/components/customer/PaystackButton";
import { sendPushNotification } from "@/lib/utils/notifications";
import { sendEmailNotification } from "@/lib/utils/email";

function TrackingStep({ label, active, completed }: { label: string, active: boolean, completed: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border-2 ${
        completed ? "bg-green-500 border-green-500 text-white" : 
        active ? "bg-white border-primary text-primary shadow-lg shadow-primary/20" : 
        "bg-white border-zinc-100 text-zinc-300"
      }`}>
        {completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-primary animate-pulse' : 'bg-current'}`} />}
      </div>
      <p className={`text-xs font-black uppercase tracking-tight ${active ? "text-zinc-900" : completed ? "text-zinc-400" : "text-zinc-300"}`}>
        {label}
      </p>
    </div>
  );
}

export default function ProductsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [customPrice, setCustomPrice] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [searchingRider, setSearchingRider] = useState(false);
  const [assignedRider, setAssignedRider] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  const unitPriceParsed = parseFloat(customPrice) || 0;
  const totalEstimated = unitPriceParsed * quantity;

  useEffect(() => {
    if (!orderId || !searchingRider || !coords) return;

    const unsubscribe = onSnapshot(doc(db, "orders", orderId), async (snapshot) => {
      const data = snapshot.data();
      if (!data) return;

      setCurrentOrder({ id: snapshot.id, ...data });

      if (data.status === "accepted" || data.status === "at_station" || data.status === "refilling" || data.status === "en_route" || data.status === "delivered") {
        setSearchingRider(false);
        setOrderSuccess(true);
        // Get the rider's details for display
        if (data.riderId) {
          const riderDoc = await getDoc(doc(db, "users", data.riderId));
          if (riderDoc.exists()) {
            setAssignedRider({ uid: data.riderId, ...riderDoc.data() });
          }
        }
      } else if (data.status === "searching") {
        // Find next closest rider
        const potentialRiders = await findPotentialRiders(coords.lat, coords.lng, data.ignoredRiders || []);
        
        if (potentialRiders.length > 0) {
          const nextRider = potentialRiders[0];
          await updateDoc(doc(db, "orders", orderId), {
            riderId: nextRider.uid,
            riderName: nextRider.name,
            riderPhone: nextRider.phone || "",
            status: "assigned",
            updatedAt: serverTimestamp()
          });
        } else {
          // No more riders
          setSearchingRider(false);
          alert("No riders found near you at this moment. Please try again soon.");
        }
      }
    });

    return () => unsubscribe();
  }, [orderId, searchingRider, coords]);

  // Handle final completion cleanup
  useEffect(() => {
    if (currentOrder?.status === "completed") {
      setOrderSuccess(false);
      setOrderId(null);
      setAssignedRider(null);
      setCurrentOrder(null);
      alert("Delivery completed! Thank you for using GHo-VA.");
      router.push("/");
    }
  }, [currentOrder?.status]);

  const handlePlaceOrder = async (paystackRef: string, method: "online" | "cash" = "online") => {
    if (!user || unitPriceParsed <= 0 || !coords) {
      if (!coords) alert("Please select your delivery location on the map.");
      return;
    }

    const isCash = method === "cash";
    setOrderLoading(true);
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const orderData = {
        customerId: user.uid,
        customerName: user.displayName || "Customer",
        customerEmail: user.email || "",
        customerPhone: user.phoneNumber || "",
        serviceId: "custom",
        serviceSize: "Custom Refill",
        quantity: quantity,
        unitPrice: unitPriceParsed,
        totalPrice: totalEstimated,
        address: address, // Used for landmark/details
        location: coords,
        status: "searching",
        ignoredRiders: [],
        otp,
        // Payment fields
        paymentMethod: method,
        paymentStatus: isCash ? "pending" : "paid",
        paymentRef: isCash ? `cash-${Date.now()}` : paystackRef,
        paidAt: isCash ? null : serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      setOrderId(docRef.id);
      setSearchingRider(true);

      // Send push notification to the customer
      await sendPushNotification({
        userId: user.uid,
        title: "🔥 Order Placed!",
        body: `Your gas refill order for GH₵${totalEstimated.toFixed(2)} has been placed. We're finding a rider near you.`,
        data: { url: "/orders", orderId: docRef.id },
      });

      // Send email notification via EmailJS Template
      await sendEmailNotification({
        templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ORDER_PLACED || "template_ptuhsj5",
        templateParams: {
          customer_name: user.displayName || "Customer",
          customer_email: user.email,
          user_name: user.displayName || "Customer",
          user_email: user.email,
          order_id: docRef.id.slice(-6).toUpperCase(),
          total_price: totalEstimated.toFixed(2),
          address: address,
          company_name: "Ghova",
          company_logo: "https://ghova.vercel.app/ghova.png",
          message: `Your gas refill order for GH₵${totalEstimated.toFixed(2)} has been placed successfully. A rider is on their way to ${address}.`,
        },
      });

    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  if (searchingRider) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mb-8 relative">
           <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 relative z-10">
              <Truck className="w-8 h-8 text-white animate-bounce" />
           </div>
           <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] animate-ping opacity-20" />
        </div>
        <h2 className="text-4xl font-black text-zinc-900 mb-4 tracking-tighter uppercase italic">Searching for Rider</h2>
        <p className="text-zinc-500 font-medium max-w-md mx-auto leading-relaxed">
          Broadcasting your refill request to all verified riders in Ho. This usually takes less than 60 seconds.
        </p>
        <div className="mt-10 flex items-center gap-3 px-6 py-3 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest animate-pulse">
           <div className="w-2 h-2 rounded-full bg-primary" />
           Locating nearest rider...
        </div>
      </div>
    );
  }

  if (orderSuccess && assignedRider && coords) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col p-6">

        
        <div className="max-w-6xl mx-auto w-full mt-24 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
             <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em]">Operational Stream Live</span>
                </div>
                <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase">Tracking Order</h1>
                <p className="text-zinc-500 font-medium tracking-tight">Your refill is being handled by our professional network</p>
             </div>

             <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-zinc-100 shadow-sm">
                <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center overflow-hidden">
                   {assignedRider.verificationDocs?.facialPhotoUrl ? (
                      <img src={assignedRider.verificationDocs.facialPhotoUrl} alt="Rider" className="w-full h-full object-cover" />
                   ) : (
                      <User className="w-6 h-6 text-zinc-400" />
                   )}
                </div>
                <div>
                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Assigned Rider</p>
                   <p className="text-sm font-black text-zinc-900">{assignedRider.name}</p>
                </div>
                <a 
                  href={`tel:${assignedRider.phone || assignedRider.email}`}
                  className="ml-4 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                   <Truck className="w-4 h-4 fill-white" />
                </a>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
             {/* Map Section */}
             <div className="lg:col-span-8">
               <RiderTrackerMap 
                 riderId={assignedRider.uid} 
                 customerLocation={coords}
                 status={currentOrder?.status || "accepted"}
               />
             </div>

             {/* Order Details & Progress */}
             <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-xl shadow-zinc-200/50 space-y-8">
                   <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Order Progress</h3>
                   
                   <div className="space-y-6">
                      <TrackingStep 
                        label="Order Confirmed" 
                        active={true} 
                        completed={true} 
                      />
                      <TrackingStep 
                        label="Rider at Gas Station" 
                        active={currentOrder?.status === "at_station" || currentOrder?.status === "refilling"} 
                        completed={["at_station", "refilling", "en_route", "delivered", "completed"].includes(currentOrder?.status)} 
                      />
                      <TrackingStep 
                        label="Heading to You" 
                        active={currentOrder?.status === "en_route"} 
                        completed={["en_route", "delivered", "completed"].includes(currentOrder?.status)} 
                      />
                      <TrackingStep 
                        label="Arrived & Delivered" 
                        active={currentOrder?.status === "delivered"} 
                        completed={["delivered", "completed"].includes(currentOrder?.status)} 
                      />
                   </div>

                   <div className="pt-6 border-t border-zinc-50">
                      <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-2xl">
                         <span className="text-[10px] font-black text-zinc-400 uppercase">Verification Code</span>
                         <span className="text-xl font-black text-zinc-900 tracking-[0.3em]">
                            {currentOrder?.id?.slice(-4).toUpperCase() || "----"}
                         </span>
                      </div>
                      <p className="text-[10px] font-bold text-zinc-400 text-center mt-3 italic">
                        Provide this code to the rider upon delivery
                      </p>
                   </div>
                </div>

                <div className="bg-orange-50 rounded-[2.5rem] p-8 border border-orange-100 flex items-center gap-5">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-orange-600">
                      <Info className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Safety First</p>
                      <p className="text-xs font-bold text-orange-700 leading-relaxed">
                        Always check the cylinder seal and your rider's ID card before accepting delivery.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">

      
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left: Product Selection & Configuration */}
          <div className="flex-1 space-y-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                <Flame className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Real-time Rates</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight uppercase leading-none">
                Smart Gas <span className="text-primary">Refilling</span>
              </h1>
              <p className="text-lg text-zinc-500 font-medium max-w-xl leading-relaxed">
                Configure your order below. Our riders will pick up your empty cylinder and return it full.
              </p>
            </div>

            {/* Refill Amount */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 bg-zinc-900 text-white rounded-lg flex items-center justify-center text-xs">01</span>
                Enter Refill Amount
              </h3>
              <div className="p-6 rounded-[2.5rem] bg-white border border-zinc-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex flex-col items-center justify-center font-black leading-none tracking-tighter shrink-0">
                    <span className="text-[10px]">GH₵</span>
                 </div>
                 <div className="flex-1">
                   <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1 mb-1 block">Amount per cylinder</label>
                   <input 
                     type="number" 
                     min="1"
                     step="0.01"
                     value={customPrice}
                     onChange={(e) => setCustomPrice(e.target.value)}
                     className="w-full text-4xl lg:text-5xl font-black text-zinc-900 bg-transparent outline-none placeholder:text-zinc-200 pl-1"
                     placeholder="0.00"
                   />
                 </div>
              </div>
            </div>

            {/* Quantity & Location */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-10 transition-all duration-500 ${unitPriceParsed > 0 ? "opacity-100 translate-y-0" : "opacity-30 pointer-events-none translate-y-4"}`}>
               <div className="space-y-6">
                 <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-3">
                    <span className="w-8 h-8 bg-zinc-900 text-white rounded-lg flex items-center justify-center text-xs">02</span>
                    How many?
                  </h3>
                  <QuantityPicker value={quantity} onChange={setQuantity} />
               </div>

               <div className="space-y-6">
                 <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-3">
                    <span className="w-8 h-8 bg-zinc-900 text-white rounded-lg flex items-center justify-center text-xs">03</span>
                    Delivery Location
                  </h3>
                  <div className="space-y-6">
                    <MapLocationPicker onLocationChange={setCoords} onAddressChange={setAddress} />
                    <div className="p-6 bg-white border-2 border-zinc-100 rounded-[2rem] focus-within:border-primary transition-all shadow-sm">
                      <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1 mb-2 block font-bold">Landmark / Details</label>
                      <textarea 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. Near the old park..."
                        className="w-full bg-transparent outline-none font-bold text-zinc-900 h-20 resize-none placeholder:text-zinc-300"
                      />
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Right: Operational Order Summary Sidebar */}
          <div className="w-full lg:w-[420px] shrink-0">
            <div className="bg-zinc-900 rounded-[3.5rem] p-10 text-white sticky top-32 shadow-[0_32px_64px_-16px_rgba(24,24,27,0.4)] border border-white/5 overflow-hidden">
               {/* Decorative Gradient Overlay */}
               <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px]" />
               
               <div className="relative z-10 flex items-center gap-3 mb-10">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                  <h3 className="text-2xl font-black tracking-tight uppercase">Order Summary</h3>
               </div>
              
              {unitPriceParsed <= 0 ? (
                <div className="space-y-8 py-10 text-center opacity-40">
                   <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Flame className="w-10 h-10 text-zinc-600" />
                   </div>
                   <p className="text-zinc-500 font-bold italic leading-relaxed">Enter an amount to see technical breakdown and estimates.</p>
                </div>
              ) : (
                <div className="space-y-10">
                   <div className="space-y-4">
                      <div className="flex justify-between items-center py-4 border-b border-white/10 group">
                        <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Configuration</span>
                        <span className="font-extrabold text-primary uppercase text-sm">
                          Custom Refill × {quantity}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-4 border-b border-white/10">
                        <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Est. Gas Price</span>
                        <span className="font-extrabold text-lg">GH₵ {totalEstimated.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center py-4 border-b border-white/10">
                        <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">System Fee</span>
                        <span className="font-extrabold text-green-500 text-sm italic">FREE (Beta)</span>
                      </div>
                   </div>

                   {/* Total to Pay */}
                   <div className="flex justify-between items-center py-5 px-6 bg-white/5 rounded-2xl border border-white/10">
                      <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Total to Pay</span>
                      <span className="text-2xl font-black text-primary">GH₵ {totalEstimated.toFixed(2)}</span>
                   </div>

                   <div className={`p-6 rounded-2xl border transition-all ${address ? "bg-primary/10 border-primary/20" : "bg-white/5 border-white/10 opacity-50"}`}>
                      <div className="flex items-center gap-3 mb-2">
                         <Truck className={`w-5 h-5 ${address ? "text-primary" : "text-zinc-500"}`} />
                         <span className="font-black uppercase tracking-widest text-[10px]">Logistics Ready</span>
                      </div>
                      <p className={`text-xs font-medium leading-relaxed ${address ? "text-zinc-200" : "text-zinc-500"}`}>
                        {address ? `Delivery to: ${address}` : "Provide a location to finalize logistics."}
                      </p>
                   </div>

                    <div className="space-y-4">
                       <PaystackButton
                          amount={totalEstimated}
                          email={user?.email || ""}
                          onPaymentSuccess={handlePlaceOrder}
                          disabled={!address || !coords}
                          parentLoading={orderLoading}
                       />

                       <button
                          onClick={() => handlePlaceOrder("", "cash")}
                          disabled={!address || !coords || orderLoading}
                          className="w-full py-5 px-8 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed border border-white/5"
                       >
                          <Banknote className="w-4 h-4 text-green-500" />
                          Pay on Delivery
                       </button>
                    </div>
                 </div>
               )}

              <div className="mt-12 flex items-start gap-4 p-5 bg-white/5 rounded-3xl border border-white/5">
                 <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                 <p className="text-[10px] text-zinc-500 font-bold leading-relaxed uppercase tracking-widest">
                   Orders are fulfilled by independent certified riders. Pay only for the gas at the station.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
