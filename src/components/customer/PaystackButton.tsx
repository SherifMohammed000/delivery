"use client";

import React, { useState, useCallback } from "react";
import { Loader2, Lock, CreditCard, ShieldCheck } from "lucide-react";

interface PaystackButtonProps {
  /** Amount in GH₵ (will be converted to pesewas by the API) */
  amount: number;
  /** Customer email for Paystack */
  email: string;
  /** Called with the verified payment reference on success */
  onPaymentSuccess: (reference: string) => void;
  /** Whether the button should be disabled */
  disabled?: boolean;
  /** Loading state from parent */
  parentLoading?: boolean;
}

/**
 * PaystackButton — Initiates a Paystack inline payment popup.
 *
 * Flow:
 * 1. Calls /api/payments/initiate to get an access_code
 * 2. Opens the Paystack inline popup
 * 3. On success callback, calls /api/payments/verify
 * 4. If verified, calls onPaymentSuccess(reference)
 */
export function PaystackButton({
  amount,
  email,
  onPaymentSuccess,
  disabled = false,
  parentLoading = false,
}: PaystackButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPaystackScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window !== "undefined" && (window as any).PaystackPop) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v2/inline.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Paystack"));
      document.head.appendChild(script);
    });
  }, []);

  const handlePay = useCallback(async () => {
    if (loading || disabled || parentLoading) return;

    setLoading(true);
    setError(null);

    try {
      if (!email || !amount || isNaN(amount) || amount <= 0) {
        throw new Error("Missing or invalid payment fields. Please check price and quantity.");
      }

      // Step 1: Load Paystack inline JS
      await loadPaystackScript();
      
      const PaystackPop = (window as any).PaystackPop;
      if (!PaystackPop) throw new Error("Paystack script not available");

      const paymentConfig = {
        reference: `ref-${Date.now()}`,
        email: email,
        amount: Math.round(Number(amount) * 100),
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        currency: "GHS",
      };

      console.log("🧾 PAYSTACK CONFIG:", paymentConfig);

      if (!paymentConfig.key) {
        throw new Error("Paystack public key is missing from environment variables");
      }

      const handler = PaystackPop.setup({
        ...paymentConfig,
        callback: async function (response: any) {
          console.log("✅ PAYMENT SUCCESS:", response);
          try {
             // Create the order in Firestore upon success
             await onPaymentSuccess(response.reference);
          } catch (err: any) {
             console.error("Firestore Order Error:", err);
             setError("Payment succeeded, but order creation failed. Please contact support.");
          } finally {
             setLoading(false);
          }
        },
        onClose: function () {
          console.warn("⚠️ Payment popup closed");
          setLoading(false);
        },
      });

      handler.openIframe();
    } catch (err: any) {
      console.error("❌ Detailed Payment Error:", {
        message: err?.message,
        stack: err?.stack,
        type: typeof err,
      });
      setError(err.message || "Failed to start payment.");
      setLoading(false);
    }
  }, [amount, email, loading, disabled, parentLoading, loadPaystackScript, onPaymentSuccess]);

  const isDisabled = disabled || loading || parentLoading;

  return (
    <div className="space-y-4">
      <button
        onClick={handlePay}
        disabled={isDisabled}
        className="group relative w-full bg-primary py-6 rounded-[1.5rem] font-black uppercase tracking-widest text-sm text-white hover:bg-primary-dark transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-2xl shadow-primary/30 overflow-hidden"
      >
        <div className="relative z-10 flex items-center justify-center gap-3">
          {loading || parentLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{parentLoading ? "Placing order..." : "Processing payment..."}</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Pay GH₵ {amount.toFixed(2)} & Order</span>
              <CreditCard className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </div>
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </button>

      {/* Secured by Paystack badge */}
      <div className="flex items-center justify-center gap-2 opacity-40">
        <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Secured by Paystack
        </span>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <p className="text-xs font-bold text-red-400 text-center">{error}</p>
        </div>
      )}
    </div>
  );
}
