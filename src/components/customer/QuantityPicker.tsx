"use client";

import React from "react";
import { Plus, Minus } from "lucide-react";

interface QuantityPickerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const QuantityPicker: React.FC<QuantityPickerProps> = ({ 
  value, 
  onChange, 
  min = 1, 
  max = 10 
}) => {
  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  return (
    <div className="flex items-center gap-6 p-2 bg-zinc-100 rounded-2xl w-fit">
      <button 
        onClick={decrement}
        disabled={value <= min}
        className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-zinc-900 hover:text-primary transition-colors disabled:opacity-50 active:scale-95"
      >
        <Minus className="w-5 h-5" />
      </button>
      
      <span className="text-xl font-black text-zinc-900 w-8 text-center tabular-nums">
        {value}
      </span>

      <button 
        onClick={increment}
        disabled={value >= max}
        className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-zinc-900 hover:text-primary transition-colors disabled:opacity-50 active:scale-95"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
};
