"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Navigation,
  ArrowRight,
  UserPlus,
  LogIn,
  Download
} from "lucide-react";

interface WelcomeScreenProps {
  onInstallClick?: () => void;
  canInstall?: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onInstallClick, 
  canInstall = false 
}) => {
  const features = [
    {
      icon: <Truck className="w-6 h-6 text-orange-500" />,
      title: "Fast Delivery",
      description: "Propane delivered to your doorstep in Ho in record time."
    },
    {
      icon: <Navigation className="w-6 h-6 text-blue-500" />,
      title: "Live Tracking",
      description: "Monitor your rider's location in real-time until they arrive."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-green-500" />,
      title: "Verified Riders",
      description: "All our riders undergo strict KYC and safety training."
    },
    {
      icon: <CreditCard className="w-6 h-6 text-purple-500" />,
      title: "Secure Pay",
      description: "Pay safely with mobile money or cards via Paystack."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10" />

      {/* Top Header with Actions */}
      <header className="relative z-50 flex items-center justify-between p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center p-2">
            <Image src="/ghova.png" alt="Logo" width={24} height={24} className="object-contain" />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase italic">GHo-VA</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Optional Install Button for Browser users */}
          {canInstall && (
            <button
              onClick={onInstallClick}
              className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary border border-primary/20 hover:bg-primary/5 rounded-xl transition-all"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 h-4" />
              Install
            </button>
          )}

          <Link 
            href="/login"
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <LogIn className="w-4 h-4" />
            Login
          </Link>
          <Link 
            href="/signup"
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-widest bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Sign Up
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-12 sm:pb-24">
        {/* Hero Section */}
        <div className="max-w-xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.9] uppercase italic">
            Your Energy, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-tr from-primary via-orange-400 to-yellow-300">Delivered.</span>
          </h1>

          <p className="text-zinc-400 font-medium text-lg max-w-md mx-auto">
            The professional way to manage your LPG cylinder refills. Fast, secure, and fully tracked.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup"
              className="group relative inline-flex items-center gap-3 px-10 py-6 bg-white text-zinc-950 font-black rounded-[2rem] text-xl uppercase italic tracking-tighter hover:-translate-y-1 transition-all shadow-2xl shadow-white/10 active:scale-95"
            >
              Get Started Now
              <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Mobile/Secondary Install Button */}
            {canInstall && (
              <button
                onClick={onInstallClick}
                className="inline-flex items-center gap-2 px-8 py-5 text-sm font-black uppercase tracking-widest text-white border border-white/10 hover:bg-white/5 rounded-[1.5rem] transition-all"
              >
                <Download className="w-5 h-5" />
                Install App
              </button>
            )}
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
          {features.map((feature, i) => (
            <div 
              key={i}
              className="group p-6 bg-zinc-900/50 border border-white/5 rounded-3xl backdrop-blur-xl hover:border-white/10 hover:bg-zinc-900 transition-all duration-500"
            >
              <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-lg font-black uppercase italic tracking-tighter mb-2">{feature.title}</h3>
              <p className="text-sm text-zinc-500 font-medium leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 p-8 flex justify-center border-t border-white/5">
        {/* Footer content removed */}
      </footer>
    </div>
  );
};
