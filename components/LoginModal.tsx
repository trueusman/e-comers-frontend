"use client";

import { X, LogIn, User, ShieldCheck } from "lucide-react";

interface Props {
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

export default function LoginModal({ onClose, onLogin, onRegister }: Props) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#0f172a]/5 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-[#0f172a]" />
        </div>

        {/* Text */}
        <h2 className="text-xl font-black text-gray-900 text-center mb-1">
          Login Required
        </h2>
        <p className="text-gray-500 text-sm text-center mb-6">
          Ye feature use karne ke liye pehle login karein
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button onClick={onLogin}
            className="w-full flex items-center justify-center gap-2 bg-[#0f172a] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#1e293b] transition-colors">
            <LogIn className="w-4 h-4" />
            Login
          </button>
          <button onClick={onRegister}
            className="w-full flex items-center justify-center gap-2 border-2 border-[#0f172a] text-[#0f172a] py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
            <User className="w-4 h-4" />
            Register — Free hai
          </button>
        </div>
      </div>
    </div>
  );
}
