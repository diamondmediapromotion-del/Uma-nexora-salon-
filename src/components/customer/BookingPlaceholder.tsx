import React from "react";
import { ArrowLeft, Zap } from "lucide-react";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

interface BookingPlaceholderProps {
  navigateTo: (path: string) => void;
}

const BookingPlaceholder = ({ navigateTo }: BookingPlaceholderProps) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-24">
        <TopBar 
          title="Booking" 
          onBack={() => window.history.back()} 
        />
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Booking Flow</h1>
            <p className="text-slate-500 text-xs mb-8 leading-relaxed max-w-xs">
              This customer booking module will be connected in next step.
            </p>
            <button 
              onClick={() => navigateTo("/customer")} 
              className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Explore
            </button>
        </div>

        <BottomNav currentPath={window.location.pathname} navigateTo={navigateTo} />
    </div>
  );
};

export default BookingPlaceholder;
