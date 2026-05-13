"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Download, Share, PlusSquare, X, Smartphone, ArrowRight } from "lucide-react";
import { WelcomeScreen } from "@/components/landing/WelcomeScreen";

export default function Home() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  
  // -- States --
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  
  // Detection states - Default to Browser to prevent the 5s splash on web
  const [isStandalone, setIsStandalone] = useState(false);
  const [splashFinished, setSplashFinished] = useState(true);
  const [showWelcomeInBrowser, setShowWelcomeInBrowser] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // 1. ULTRA-STRICT Standalone Detection
    // We ONLY show the 5s splash if we are 100% sure we are in the installed app.
    // Standard browsers sometimes report 'standalone' incorrectly in certain desktop modes.
    
    const isUrlStandalone = new URLSearchParams(window.location.search).get('mode') === 'standalone';
    const isIosStandalone = (window.navigator as any).standalone === true;
    
    // For Desktop/Android, we check display-mode: standalone but also ensure we aren't in 'browser' mode
    const isPwaStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isNormalBrowser = window.matchMedia('(display-mode: browser)').matches;
      
    // A user is ONLY 'standalone' if they have the flag AND are not reported as a normal browser
    const standalone = (isUrlStandalone || isIosStandalone || isPwaStandalone) && !isNormalBrowser;

    if (standalone) {
      setIsStandalone(true);
      setSplashFinished(false);
      
      // 5-second branded experience ONLY for confirmed installed app
      const timer = setTimeout(() => {
        setSplashFinished(true);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setIsStandalone(false);
      setSplashFinished(true); // Instant for web users
    }

    // 2. Platform Capabilities
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handlePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    
    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () => window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  // -- Navigation Logic --
  useEffect(() => {
    if (loading || !isMounted) return;

    if (user) {
      if (isStandalone && !splashFinished) return;
      if (!isStandalone && !showWelcomeInBrowser) return;
      const dashboard = role === "admin" ? "/admin" : (role === "delivery" ? "/delivery" : "/products");
      router.push(dashboard);
    }
  }, [isStandalone, splashFinished, showWelcomeInBrowser, loading, isMounted, user, role, router]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      setDeferredPrompt(null);
    } else {
      alert("Installation Guide:\n\nChrome: Tap menu (⋮) > Install App\nSafari (iOS): Tap Share > Add to Home Screen");
    }
  };

  // 1. Initial Mount Sync (Black screen briefly to prevent flicker)
  if (!isMounted) {
    return <div className="min-h-screen bg-zinc-950" />;
  }

  // 2. STANDALONE APP FLOW: 5-Second Premium Splash
  if (isStandalone && !splashFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-primary via-orange-500 to-yellow-500 rounded-full blur-[100px] opacity-20 animate-spin" style={{ animationDuration: '10s' }} />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

        <div className="relative z-10 flex flex-col items-center gap-10">
          <div className="w-36 h-36 bg-zinc-900 border border-white/20 rounded-[3rem] flex items-center justify-center p-8 shadow-[0_0_80px_rgba(255,107,0,0.3)] animate-bounce" style={{ animationDuration: '3s' }}>
             <Image src="/ghova.png" alt="Logo" width={90} height={90} className="object-contain" priority />
          </div>
          <div className="text-center space-y-4">
             <h1 className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-white uppercase italic animate-pulse">GHo-VA</h1>
          </div>
        </div>
      </div>
    );
  }

  // 3. WELCOME PHASE: Post-Gate Browser or Post-Splash App
  if (showWelcomeInBrowser || (isStandalone && splashFinished)) {
    return (
      <>
        <WelcomeScreen onInstallClick={handleInstallClick} canInstall={!isStandalone} />
        
        {showIOSModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 relative shadow-2xl animate-in slide-in-from-bottom-20 duration-500">
              <button onClick={() => setShowIOSModal(false)} className="absolute top-8 right-8 p-2 bg-zinc-100 text-zinc-500 rounded-full"><X className="w-5 h-5" /></button>
              <div className="text-center mb-10">
                <h3 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase italic mb-2">iOS Setup</h3>
                <p className="text-sm text-zinc-500 font-medium">Add GHo-VA to your home screen.</p>
              </div>
              <div className="space-y-6 bg-zinc-50 rounded-[2rem] p-6 border border-zinc-100 mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm border border-zinc-100"><Share className="w-6 h-6" /></div>
                  <p className="text-sm font-bold text-zinc-700">1. Tap <span className="text-blue-500 font-black">Share</span>.</p>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zinc-950 shadow-sm border border-zinc-100"><PlusSquare className="w-6 h-6" /></div>
                  <p className="text-sm font-bold text-zinc-700">2. Select <span className="text-zinc-950 font-black">"Add to Home Screen"</span>.</p>
                </div>
              </div>
              <button onClick={() => setShowIOSModal(false)} className="w-full py-6 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm">Got it</button>
            </div>
          </div>
        )}
      </>
    );
  }

  // 4. BROWSER GATE: Initial Web Install Prompt
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      
      <div className="relative z-10 flex flex-col items-center gap-8 mb-16 text-center">
        <div className="w-40 h-40 bg-zinc-900 border border-white/10 rounded-[3.5rem] flex items-center justify-center p-10 shadow-[0_0_60px_rgba(255,107,0,0.15)]">
           <Image src="/ghova.png" alt="Logo" width={100} height={100} className="object-contain" priority />
        </div>
        <div className="space-y-4">
          <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic">GHo-VA</h1>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-4">
        <button 
          onClick={handleInstallClick}
          className="w-full py-7 bg-primary text-white rounded-[2.2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-3"
        >
          <Download className="w-5 h-5" />
          Install GHo-VA App
        </button>
        
        <button 
          onClick={() => setShowWelcomeInBrowser(true)}
          className="w-full py-5 text-zinc-500 hover:text-white rounded-[1.8rem] font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
        >
          Continue in browser
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-20 opacity-20">
        {/* Footer info removed */}
      </div>
    </div>
  );
}
