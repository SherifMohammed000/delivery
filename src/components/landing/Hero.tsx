import React from "react";
import Image from "next/image";
import { useAuth } from "@/lib/contexts/auth-context";
import { ArrowRight, MapPin, ShieldCheck, Flame, Radio } from "lucide-react";

export const Hero = () => {
  const { user, role } = useAuth();

  return (
    <section className="relative pt-32 pb-4 lg:pt-48 lg:pb-8 overflow-hidden bg-white">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          {/* Left Column: Text Content */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-8 text-center xl:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 rounded-2xl shadow-xl shadow-zinc-200 animate-in slide-in-from-bottom-4 fade-in duration-700">
              <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Operational Zone: Ho Municipality</span>
            </div>

            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter text-zinc-900 leading-[0.85] uppercase animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-150 fill-mode-both">
              Reliable <span className="text-transparent bg-clip-text bg-gradient-to-tr from-primary to-orange-400">Gas Refills</span> <br />
              <span className="italic">On Demand.</span>
            </h1>

            <p className="max-w-2xl mx-auto xl:mx-0 text-lg lg:text-xl text-zinc-500 font-medium leading-relaxed tracking-tight animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300 fill-mode-both">
              The smartest LPG cylinder refill system in Ho. 
              Order in seconds, track our professional riders in real-time, 
              and experience the future of local utility logistics.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center xl:justify-start gap-4 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-500 fill-mode-both">
              <a 
                href={user ? (role === "admin" ? "/admin" : (role === "delivery" ? "/delivery" : "/products")) : "/signup"}
                className="w-full sm:w-auto overflow-hidden relative group/btn flex items-center justify-center gap-3 px-12 py-6 bg-primary text-white font-black rounded-3xl shadow-2xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all text-xl uppercase tracking-tighter italic hover:-translate-y-1"
              >
                <div className="relative z-10 flex items-center gap-3">
                  Initiate Refill Request
                  <ArrowRight className="w-6 h-6 transition-transform group-hover/btn:translate-x-1" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
              </a>
              <button className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-6 bg-white text-zinc-900 border-2 border-zinc-100 font-black rounded-3xl hover:bg-zinc-50 transition-all text-xl shadow-sm uppercase tracking-tighter hover:-translate-y-1">
                Infrastructure
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center xl:justify-start gap-8 border-t border-zinc-50">
              <div className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center transition-colors group-hover:bg-green-100">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Safety Infrastructure</span>
              </div>
              <div className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center transition-colors group-hover:bg-orange-100">
                  <Flame className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">High-Grade Quality</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Image */}
          <div className="relative lg:col-span-12 xl:col-span-5 mt-20 xl:mt-0 w-full flex justify-center xl:justify-end animate-in zoom-in-95 fade-in duration-1000 delay-500 fill-mode-both">
            <div className="relative group max-w-[500px] w-full">
              {/* Image Frame */}
              <div className="relative w-full rounded-[3.5rem] overflow-hidden shadow-3xl shadow-zinc-200 border-8 border-white aspect-[4/5] group-hover:shadow-primary/10 transition-shadow duration-700">
                <Image 
                  src="/gas-man2.jpg" 
                  alt="Professional Gas Delivery" 
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  priority
                />
                
                {/* System Overlay Accent */}
                <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900/60 to-transparent p-10 flex flex-col justify-end">
                   <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 w-full space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-black text-[10px] uppercase tracking-[0.2em]">Logistics Protocol</span>
                        <div className="flex gap-1">
                           <div className="w-1 h-1 rounded-full bg-primary" />
                           <div className="w-1 h-1 rounded-full bg-primary/40" />
                           <div className="w-1 h-1 rounded-full bg-primary/40" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-white font-black text-xs uppercase italic tracking-tighter">Verified Delivery Active</p>
                        <p className="text-primary font-black text-2xl tracking-tighter">CODE: GH-VA-02</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-6 -right-6 lg:-right-10 bg-white p-6 rounded-[2.5rem] shadow-2xl border border-zinc-100 animate-bounce transition-all duration-1000 group-hover:rotate-6">
                 <Radio className="w-8 h-8 text-primary" />
                 <p className="text-[10px] font-black text-zinc-900 uppercase tracking-widest mt-2">Live Sync</p>
              </div>

              {/* Decorative background border */}
              <div className="absolute -z-10 -bottom-8 -left-8 w-full h-full border-2 border-primary/20 rounded-[3.5rem] transition-transform duration-700 group-hover:translate-x-4 group-hover:translate-y-4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
