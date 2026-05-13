"use client";

import React, { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";

export function ImmediateInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkStandalone = () => {
      return (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
    };
    setIsStandalone(checkStandalone());

    // Check if user has explicitly dismissed the prompt before
    const hasDismissed = localStorage.getItem("ghova_install_dismissed");

    if (checkStandalone() || hasDismissed) {
      return;
    }

    // iOS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // Delay showing prompt slightly for better UX
      const timer = setTimeout(() => setShowPrompt(true), 2500);
      return () => clearTimeout(timer);
    }

    // Android/Chrome Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show custom prompt UI after a slight delay
      setTimeout(() => setShowPrompt(true), 2500);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // For iOS, the instructions are already visible in the modal
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("ghova_install_dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 relative shadow-2xl animate-in slide-in-from-bottom-20 sm:zoom-in-95 duration-700">
        <button 
          onClick={handleDismiss}
          className="absolute top-6 right-6 p-2 bg-zinc-100 text-zinc-500 rounded-full hover:bg-zinc-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 mx-auto">
          <Download className="w-8 h-8 text-primary" />
        </div>
        
        <div className="text-center mb-8">
          <h3 className="text-2xl font-black text-zinc-900 tracking-tighter uppercase italic mb-3">Install GHo-VA</h3>
          <p className="text-base text-zinc-500 font-medium leading-relaxed">
            Get the native app experience. Order gas faster, track your delivery live, and receive real-time notifications.
          </p>
        </div>
        
        {isIOS ? (
          <div className="space-y-4 bg-zinc-50 rounded-3xl p-5 border border-zinc-100 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-500 shrink-0">
                <Share className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-zinc-700">1. Tap <span className="text-blue-500">Share</span> at the bottom of Safari.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm text-zinc-800 shrink-0">
                <PlusSquare className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-zinc-700">2. Select <span className="text-zinc-900">"Add to Home Screen"</span>.</p>
            </div>
          </div>
        ) : (
          <button 
            onClick={handleInstallClick}
            className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95 mb-4"
          >
            Install App Now
          </button>
        )}

        <button 
          onClick={handleDismiss}
          className="w-full py-4 text-zinc-400 font-bold text-sm hover:text-zinc-900 transition-colors uppercase tracking-widest"
        >
          {isIOS ? "Got it" : "Maybe Later"}
        </button>
      </div>
    </div>
  );
}
