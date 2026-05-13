"use client";

import React, { useEffect, useState } from "react";
import { Order } from "@/types/order";
import { MapPin, Clock, X, Check } from "lucide-react";
import { getHaversineDistance } from "@/lib/utils/dispatch";

interface AssignmentModalProps {
  order: Order;
  riderLocation: { lat: number; lng: number } | null;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
  countdownSeconds?: number;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  order,
  riderLocation,
  onAccept,
  onReject,
  countdownSeconds = 30
}) => {
  const [timeLeft, setTimeLeft] = useState(countdownSeconds);
  const [distance, setDistance] = useState<string>("Calculating...");

  useEffect(() => {
    if (riderLocation && order.location) {
      const d = getHaversineDistance(
        riderLocation.lat,
        riderLocation.lng,
        order.location.lat,
        order.location.lng
      );
      setDistance(d.toFixed(2) + " km");
    }
  }, [riderLocation, order.location]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onReject(order.id);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, order.id, onReject]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-zinc-100">
        <div className="p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-orange-50 rounded-[2rem] flex items-center justify-center mx-auto relative">
             <Clock className="w-10 h-10 text-orange-600 animate-pulse" />
             <div className="absolute -top-2 -right-2 bg-zinc-900 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-4 border-white">
                {timeLeft}
             </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter italic">New Request Nearby</h3>
            <p className="text-zinc-500 font-medium">A customer in your zone needs a gas refill.</p>
          </div>

          <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100/50 flex items-center justify-between">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Customer</p>
                <p className="font-extrabold text-zinc-900">{order.customerName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Distance</p>
              <p className="font-black text-zinc-900 italic text-lg">{distance}</p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => onReject(order.id)}
              className="flex-1 px-6 py-5 rounded-3xl font-black uppercase tracking-widest text-sm text-zinc-400 border-2 border-zinc-100 hover:bg-zinc-50 hover:text-zinc-600 transition-all flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Decline
            </button>
            <button
              onClick={() => onAccept(order.id)}
              className="flex-[2] px-6 py-5 rounded-3xl font-black uppercase tracking-widest text-sm bg-orange-600 text-white shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Check className="w-5 h-5" />
              Accept Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
