"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({ label, id, type, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label htmlFor={id} className="block text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-2 pl-1">
        {label}
      </label>
      <div className="relative group">
        <input
          id={id}
          {...props}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          className="block w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4 text-zinc-900 placeholder-zinc-300 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-base shadow-sm"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-600 transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
};
