import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Clock, Calendar, Check, AlertCircle, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Shop } from "../../types";
import { useBooking } from "../../contexts/BookingContext";
import TopBar from "./TopBar";
import LoadingState from "./LoadingState";

interface DateTimeSelectionProps {
  navigateTo: (path: string) => void;
  shopId?: string;
}

const MORNING = ["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"];
const AFTERNOON = ["12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM"];
const EVENING = ["04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM"];

const DateTimeSelection = ({ navigateTo, shopId }: DateTimeSelectionProps) => {
  const { bookingDraft, setDateTime, totalPrice, totalDuration } = useBooking();
  const [shop, setShop] = useState<Shop | null>(bookingDraft.shop);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(bookingDraft.selectedDate);
  const [selectedTime, setSelectedTime] = useState<string | null>(bookingDraft.selectedTime);

  useEffect(() => {
    const fetchShop = async () => {
      if (!shopId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        if (!shop) {
          const { data, error: shopError } = await supabase
            .from("shops")
            .select("*")
            .eq("id", shopId)
            .eq("is_active", true)
            .single();
          
          if (shopError) throw shopError;
          setShop(data);
        }
      } catch (err: any) {
        console.error("Error fetching shop data:", err);
        setError(err.message || "Unable to load appointment slots.");
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [shopId, shop]);

  const handleSelectDateTime = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setDateTime(date, time);
  };

  // Generate next 7 days
  const dates = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      const dayName = i === 0 ? "Today" : date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const fullDate = date.toISOString().split('T')[0];
      
      // Mock slot counts
      const slotCounts = [8, 10, 6, 12, 9, 7, 11];
      
      days.push({
        day: dayName,
        date: dateStr,
        fullDate: fullDate,
        slots: slotCounts[i % slotCounts.length]
      });
    }
    return days;
  }, []);

  if (loading) return <LoadingState />;

  if (error || (!shop && shopId)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">{error === "Shop not found" ? "Salon not found" : "Error"}</h2>
        <p className="text-slate-500 text-sm mb-6">{error || "Something went wrong."}</p>
        <button 
          onClick={() => navigateTo("/customer")}
          className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-xs"
        >
          Back to Customer Home
        </button>
      </div>
    );
  }

  // Handle demo fallback
  const displayShopName = shop?.shop_name || "Chique Salon & Luxury Spa";
  const displayArea = shop?.area || "C-Scheme";
  const displayCity = shop?.city || "Jaipur";
  const displayRating = shop?.rating || 4.9;
  const displayVerified = shop?.is_verified ?? true;
  const displayIsOpen = shop?.is_open ?? true;

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans">
      <TopBar 
        title="Choose Date & Time" 
        subtitle={displayShopName}
        onBack={() => shopId ? navigateTo(`/booking/${shopId}/staff`) : navigateTo("/booking/staff")} 
        showHome={true}
        onHome={() => navigateTo("/customer")}
        showMainSite={true}
        onMainSite={() => navigateTo("/")}
      />

      {/* Progress */}
      <section className="px-4 py-6 bg-white border-b border-slate-100">
        <div className="flex items-center justify-between text-center">
            {["Services", "Staff", "Time", "Confirm"].map((step, i) => (
                <div key={step} className="flex-1 flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i === 2 ? "bg-blue-600 text-white" : i < 2 ? "bg-emerald-500 text-white shadow-sm shadow-emerald-100" : "bg-slate-100 text-slate-400"}`}>{i < 2 ? "✓" : i+1}</div>
                    <span className={`text-[10px] font-bold ${i === 2 ? "text-blue-600" : "text-slate-400"}`}>{step}</span>
                </div>
            ))}
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
          {/* Summary Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-slate-900 text-sm">{displayShopName}</h3>
                    <p className="text-[10px] text-slate-500">{displayArea}, {displayCity} • <span className="text-amber-500 font-bold">{displayRating} ★</span></p>
                </div>
                <div className="flex gap-2">
                  {displayVerified && <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold">Verified</span>}
                  <span className={`${displayIsOpen ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"} px-3 py-1 rounded-full text-[10px] font-bold`}>{displayIsOpen ? "Open" : "Closed"}</span>
                </div>
            </div>
            
            <div className="pt-4 border-t border-slate-50 space-y-3">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Selected Services</span>
                    <span className="text-slate-900 font-bold">₹{totalPrice}</span>
                </div>
                <div className="space-y-1">
                    {bookingDraft.selectedServices.map(s => (
                        <p key={s.id} className="text-[10px] text-slate-400 flex items-center justify-between">
                            <span>• {s.service_name}</span>
                            <span>{s.duration_minutes} min</span>
                        </p>
                    ))}
                </div>
                <div className="flex justify-between items-center text-xs pt-2">
                    <span className="text-slate-500 font-medium">Selected Staff</span>
                    <span className="text-slate-900 font-bold">{bookingDraft.selectedStaff === "any" ? "Any Expert" : bookingDraft.selectedStaff?.staff_name || "Not selected"}</span>
                </div>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-lg">Select Date</h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-wider">Next 7 Days</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
                {dates.map((d) => (
                    <button 
                        key={d.fullDate} 
                        onClick={() => { setSelectedDate(d.date); setSelectedTime(null); setDateTime(d.date, ""); }}
                        className={`min-w-[80px] p-4 rounded-2xl flex flex-col items-center border transition-all active:scale-95 ${selectedDate === d.date ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200" : "bg-white text-slate-700 border-slate-100 shadow-sm hover:border-slate-300"}`}
                    >
                        <span className="text-[10px] font-bold opacity-80 uppercase mb-1">{d.day}</span>
                        <span className="font-black text-sm mb-1">{d.date}</span>
                        <span className={`text-[9px] font-bold ${selectedDate === d.date ? "text-blue-100" : "text-emerald-500"}`}>{d.slots} slots</span>
                    </button>
                ))}
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <h3 className="font-bold text-slate-900 text-lg mb-4">Available Slots</h3>
            {[{title: "Morning", slots: MORNING}, {title: "Afternoon", slots: AFTERNOON}, {title: "Evening", slots: EVENING}].map(group => (
                <div key={group.title} className="mb-8">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                        {group.title}
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                        {group.slots.map((time) => {
                            // Mock booked slots as per requirements: 11:00 AM, 02:30 PM, 06:00 PM
                            const isBooked = time === "11:00 AM" || time === "02:30 PM" || time === "06:00 PM";
                            return (
                                <button 
                                    key={time}
                                    disabled={isBooked}
                                    onClick={() => handleSelectDateTime(selectedDate || "", time)}
                                    className={`py-3 rounded-2xl text-[10px] font-bold border transition-all active:scale-95 ${isBooked ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed" : selectedTime === time ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200" : "bg-white text-slate-700 border-slate-100 shadow-sm hover:border-blue-200"}`}
                                >
                                    {isBooked ? "Booked" : time}
                                </button>
                            )
                        })}
                    </div>
                </div>
            ))}
          </div>
      </div>

      {/* Sticky Bottom Summary */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            {selectedDate && selectedTime ? (
                <>
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedDate}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedTime}</span>
                    </div>
                    <p className="font-black text-slate-900 text-lg">{bookingDraft.selectedStaff === "any" ? "Any Expert" : bookingDraft.selectedStaff?.staff_name || "Expert"} • ₹{totalPrice}</p>
                </>
            ) : (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-200 rounded-full animate-pulse"></div>
                    <p className="text-xs font-bold text-slate-400">Select date and time</p>
                </div>
            )}
          </div>
          <button 
            disabled={!selectedDate || !selectedTime}
            onClick={() => shopId ? navigateTo(`/booking/${shopId}/confirm`) : navigateTo("/booking/confirm")} 
            className={`font-black py-4 px-10 rounded-2xl text-sm transition-all active:scale-95 ${selectedDate && selectedTime ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30 hover:bg-blue-700" : "bg-slate-100 text-slate-300 cursor-not-allowed"}`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelection;
