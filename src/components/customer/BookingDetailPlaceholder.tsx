import React from "react";
import { ArrowLeft, BookOpen, Clock, Search, Sparkles, Star, User } from "lucide-react";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

interface BookingDetailProps {
  navigateTo: (path: string) => void;
}

const BookingDetailPlaceholder = ({ navigateTo }: BookingDetailProps) => {
  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans flex flex-col">
      <TopBar 
        title="Booking Details" 
        onBack={() => navigateTo("/my-bookings")} 
      />

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6">
            <BookOpen className="w-10 h-10" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Booking Info</h1>
        <p className="text-slate-500 text-xs mb-8 leading-relaxed max-w-xs">
          This booking detail module will be available soon in the next update.
        </p>
        <button 
          onClick={() => navigateTo("/my-bookings")} 
          className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-xl shadow-slate-200"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Bookings
        </button>
      </div>

      <BottomNav currentPath="/booking/details/demo" navigateTo={navigateTo} />
    </div>
  );
};

export default BookingDetailPlaceholder;
