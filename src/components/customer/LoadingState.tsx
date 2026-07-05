import React from "react";
import { Sparkles } from "lucide-react";

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="relative">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-slate-100 animate-bounce">
          <Sparkles className="w-8 h-8 text-blue-600" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
          <div className="w-1 h-1 bg-white rounded-full animate-ping" />
        </div>
      </div>
      <div className="mt-8 space-y-2">
        <h2 className="text-sm font-black text-slate-900 tracking-tight">Loading your Nexora experience...</h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Jaipur's SalonOS is preparing</p>
      </div>
    </div>
  );
};

export default LoadingState;
