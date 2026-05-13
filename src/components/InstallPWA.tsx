"use client";

import React, { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('SW registered: ', registration.scope);
          },
          (err) => {
            console.log('SW registration failed: ', err);
          }
        );
      });
    }

    // Detect if already installed (standalone mode)
    const checkStandalone = () => {
      return (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
    };
    setIsStandalone(checkStandalone());

    // Android/Chrome Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // iOS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSPrompt(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
    }
  };

  if (isStandalone) {
    return null; // Don't show if already installed
  }

  // Only show button if we have a prompt or it's iOS
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-zinc-900 text-white rounded-full font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 active:scale-95"
      >
        <Download className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </button>

      {/* iOS Installation Instructions Modal */}
      {showIOSPrompt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <button 
              onClick={() => setShowIOSPrompt(false)}
              className="absolute top-4 right-4 p-2 bg-zinc-100 text-zinc-500 rounded-full hover:bg-zinc-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6">
              <Download className="w-6 h-6 text-zinc-900" />
            </div>
            
            <h3 className="text-xl font-black text-zinc-900 tracking-tight uppercase italic mb-2">Install GHo-VA</h3>
            <p className="text-sm text-zinc-500 font-medium leading-relaxed mb-6">
              Install this application on your home screen for quick and easy access when you need gas.
            </p>
            
            <div className="space-y-4 bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-500 shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-zinc-700">1. Tap the <span className="text-blue-500">Share</span> icon at the bottom of Safari.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm text-zinc-800 shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-zinc-700">2. Scroll down and tap <span className="text-zinc-900">"Add to Home Screen"</span>.</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowIOSPrompt(false)}
              className="w-full mt-6 py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
