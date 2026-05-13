"use client";

import React from "react";
import { MapPin, Info } from "lucide-react";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const LocationInput: React.FC<LocationInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "e.g. Bankoe, opposite the old market..." 
}) => {
  return (
    <div className="space-y-4">
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors">
          <MapPin className="w-5 h-5" />
        </div>
        <input 
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border-2 border-zinc-100 rounded-2xl py-4 pl-12 pr-6 text-zinc-900 font-bold placeholder:text-zinc-400 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
        />
      </div>
      
      <div className="flex items-start gap-2 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-[11px] text-blue-700 font-bold uppercase tracking-wider leading-relaxed">
          Be as specific as possible to help our riders find you quickly. Include landmarks if helpful.
        </p>
      </div>
    </div>
  );
};
