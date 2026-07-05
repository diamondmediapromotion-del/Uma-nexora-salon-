import React from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

interface SalonDetailPlaceholderProps {
  navigateTo: (path: string) => void;
}

const SalonDetailPlaceholder = ({ navigateTo }: SalonDetailPlaceholderProps) => {
  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans flex flex-col">
      <TopBar 
        title="Salon Details" 
        onBack={() => navigateTo("/customer")} 
      />

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Sparkles className="w-10 h-10" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Salon Profile</h1>
        <p className="text-slate-500 text-xs mb-8 leading-relaxed max-w-xs">
          This customer module will be connected in next step.
        </p>
        <button 
          onClick={() => navigateTo("/customer")} 
          className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-xl shadow-slate-200"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </button>
      </div>

      <BottomNav currentPath={window.location.pathname} navigateTo={navigateTo} />
    </div>
  );
};

export default SalonDetailPlaceholder;
