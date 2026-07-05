import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, Calendar, Clock, User, Scissors, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useBooking } from "../../contexts/BookingContext";
import TopBar from "./TopBar";

interface BookingConfirmationProps {
  navigateTo: (path: string) => void;
  shopId?: string;
}

const BookingConfirmation = ({ navigateTo, shopId }: BookingConfirmationProps) => {
  const { bookingDraft, totalPrice, totalDuration, resetBooking } = useBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // If no services selected, redirect back
  useEffect(() => {
    if (!bookingDraft.selectedServices.length && !success) {
      navigateTo(shopId ? `/booking/${shopId}` : "/customer");
    }
  }, [bookingDraft.selectedServices, success]);

  const handleConfirmBooking = async () => {
    if (!bookingDraft.shopId || !bookingDraft.selectedDate || !bookingDraft.selectedTime) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please login to book an appointment.");

      // 1. Insert into customer_bookings
      const { data: booking, error: bookingError } = await supabase
        .from("customer_bookings")
        .insert({
          customer_id: session.user.id,
          shop_id: bookingDraft.shopId,
          staff_id: bookingDraft.selectedStaff === "any" ? null : bookingDraft.selectedStaff?.id,
          booking_date: bookingDraft.selectedDate,
          booking_time: bookingDraft.selectedTime,
          total_amount: totalPrice,
          total_duration_minutes: totalDuration,
          status: 'confirmed'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // 2. Insert into customer_booking_services
      const bookingServices = bookingDraft.selectedServices.map(s => ({
        booking_id: booking.id,
        service_name: s.service_name,
        price: s.price,
        duration_minutes: s.duration_minutes
      }));

      const { error: servicesError } = await supabase
        .from("customer_booking_services")
        .insert(bookingServices);

      if (servicesError) throw servicesError;

      setSuccess(true);
      resetBooking();
    } catch (err: any) {
      console.error("Error confirming booking:", err);
      setError(err.message || "Failed to confirm booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Booking Confirmed!</h2>
        <p className="text-slate-500 mb-8 max-w-xs mx-auto">Your appointment has been successfully scheduled. You can view details in My Bookings.</p>
        
        <div className="w-full max-w-sm space-y-3">
          <button 
            onClick={() => navigateTo("/my-bookings")}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 transition"
          >
            View My Bookings
          </button>
          <button 
            onClick={() => navigateTo("/customer")}
            className="w-full py-4 bg-white text-slate-600 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const serviceNames = bookingDraft.selectedServices.map(s => s.service_name).join(" + ");
  const staffName = bookingDraft.selectedStaff === "any" ? "Any Available Expert" : bookingDraft.selectedStaff?.staff_name || "Expert";

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans">
      <TopBar 
        title="Confirm Booking" 
        subtitle="Review your appointment details"
        onBack={() => shopId ? navigateTo(`/booking/${shopId}/date-time`) : navigateTo("/booking/date-time")} 
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i === 3 ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-emerald-500 text-white"}`}>{i < 3 ? "✓" : i+1}</div>
                    <span className={`text-[10px] font-bold ${i === 3 ? "text-blue-600" : "text-emerald-600"}`}>{step}</span>
                </div>
            ))}
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in zoom-in duration-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500"/> 
              Booking Summary
            </h3>
            
            <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                    <Scissors className="w-5 h-5"/>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Services</p>
                    <p className="text-sm font-bold text-slate-700">{serviceNames}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{totalDuration} minutes total</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                    <User className="w-5 h-5"/>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Stylist</p>
                    <p className="text-sm font-bold text-slate-700">{staffName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                    <Calendar className="w-5 h-5"/>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Date & Time</p>
                    <p className="text-sm font-bold text-slate-700">{bookingDraft.selectedDate} at {bookingDraft.selectedTime}</p>
                  </div>
                </div>
            </div>
            
            <div className="border-t border-slate-100 pt-6 mt-4 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Payable</p>
                  <p className="font-black text-slate-900 text-2xl tracking-tight">₹{totalPrice}</p>
                </div>
                <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">
                  Pay at Salon
                </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-5 rounded-3xl space-y-2">
            <p className="text-xs font-bold text-amber-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Nexora Rewards
            </p>
            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
              Earn flat 15% cashback rewards on this booking by scanning the salon QR during checkout.
            </p>
          </div>
      </div>

      {/* Sticky Bottom Summary */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-2xl mx-auto">
          <button 
            disabled={isSubmitting}
            onClick={handleConfirmBooking} 
            className={`w-full font-black py-4 rounded-2xl text-sm transition-all flex items-center justify-center gap-3 ${isSubmitting ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-blue-600 text-white shadow-xl shadow-blue-500/30 hover:bg-blue-700 active:scale-95"}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Confirming...
              </>
            ) : (
              "Confirm & Book Now"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
