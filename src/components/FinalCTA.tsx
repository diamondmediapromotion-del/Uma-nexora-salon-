import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, MapPin } from "lucide-react";
import { dispatchPopState } from "../utils/navigation";

export default function FinalCTA() {
  const handleNavigate = (path: string) => {
    window.history.pushState({}, "", path);
    dispatchPopState();
    window.scrollTo(0, 0);
  };

  return (
    <section id="final-cta" className="py-24 bg-gradient-to-b from-white to-slate-50/50 scroll-mt-18 relative overflow-hidden">
      {/* Background visual circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-100/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        {/* Top visual accent */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-3xs font-extrabold uppercase tracking-widest border border-blue-100/50 mx-auto">
          <Sparkles className="w-3 h-3" /> Jaipur Pilot Phase 1
        </div>

        {/* Headline */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-slate-900 tracking-tight leading-none">
          Nexora hai to <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Salon fix hai.
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-slate-600 text-sm sm:text-base md:text-lg font-body max-w-2xl mx-auto leading-relaxed">
          Start with customers, salon owners, partners, brands and jobs — all connected step-by-step in one beauty growth ecosystem.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto pt-4">
          <button
            onClick={() => handleNavigate("/customer")}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-2xl text-xs transition-all hover:-translate-y-0.5 cursor-pointer shadow-lg shadow-slate-950/15 flex items-center justify-center gap-2 group"
          >
            Find Salons
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-white transition-all" />
          </button>
          
          <button
            onClick={() => handleNavigate("/owner-register")}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition-all hover:-translate-y-0.5 cursor-pointer shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2"
          >
            Register Your Salon
            <span className="text-[9px] uppercase bg-white/20 px-1.5 py-0.5 rounded font-black">Free</span>
          </button>
        </div>

        {/* Pilot chip */}
        <div className="flex items-center justify-center gap-1.5 text-3xs font-bold text-slate-400 uppercase tracking-widest pt-4">
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          <span>Active Onboarding across Jaipur Clusters</span>
        </div>
      </div>
    </section>
  );
}
