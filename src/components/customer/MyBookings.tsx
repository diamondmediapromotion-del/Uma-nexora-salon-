import React, { useState, useEffect } from "react";
import { ArrowLeft, Sparkles, Search, Clock, Star, User, MapPin, CheckCircle2, AlertCircle, Timer } from "lucide-react";
import { supabase } from "../../lib/supabase";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import LoadingState from "./LoadingState";

interface MyBookingsProps {
  navigateTo: (path: string) => void;
}

const CountdownTimer = ({ date, time }: { date: string, time: string }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!date || !time) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const bookingDateTime = new Date(`${date}T${time}`);
      
      const difference = bookingDateTime.getTime() - now.getTime();
      
      if (difference <= 0) {
        return "Appointment time reached";
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      if (days > 0) {
        return `${days} days ${hours} hrs ${minutes} mins`;
      }
      
      if (hours > 0) {
        return `Today in ${hours} hrs ${minutes} mins`;
      }
      
      if (minutes >= 10) {
        return `Starts in ${minutes} mins`;
      }
      
      return `Starting soon`;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);

    return () => clearInterval(timer);
  }, [date, time]);

  if (!timeLeft || !date || !time) return null;

  return (
    <div className="flex flex-col gap-1 mt-3 p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-800">
      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600/80">Time until your appointment</span>
      <div className="flex items-center gap-1.5">
        <Clock className="w-4 h-4 text-blue-700" />
        <span className="text-xs font-bold text-blue-900">{timeLeft}</span>
      </div>
    </div>
  );
};

const MyBookings = ({ navigateTo }: MyBookingsProps) => {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelModalBookingId, setCancelModalBookingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Review state
  const [reviewModalBooking, setReviewModalBooking] = useState<any | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("customer_bookings")
        .select(`
          *,
          shops (shop_name, area, city),
          shop_staff (staff_name),
          customer_reviews (id)
        `)
        .eq("customer_id", session.user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setBookings(data || []);
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const confirmCancel = async () => {
    if (!cancelModalBookingId) return;
    setIsCancelling(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error: cancelError } = await supabase
        .from("customer_bookings")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", cancelModalBookingId)
        .eq("customer_id", session.user.id);

      if (cancelError) throw cancelError;

      // Update local state
      setBookings(prev => 
        prev.map(b => b.id === cancelModalBookingId ? { ...b, status: "cancelled" } : b)
      );
      setCancelModalBookingId(null);
      setSuccessMessage("Booking cancelled successfully.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error cancelling booking:", err);
      setError("Unable to cancel booking. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const submitReview = async () => {
    if (!reviewModalBooking) return;
    setIsSubmittingReview(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error: insertError } = await supabase
        .from("customer_reviews")
        .insert({
          customer_id: session.user.id,
          shop_id: reviewModalBooking.shop_id,
          booking_id: reviewModalBooking.id,
          rating,
          review_text: reviewText || null
        });

      if (insertError) {
        if (insertError.code === '23505') {
            throw new Error("You have already reviewed this booking.");
        }
        throw insertError;
      }

      // Update local state
      setBookings(prev => 
        prev.map(b => b.id === reviewModalBooking.id ? { ...b, customer_reviews: [{ id: "temp" }] } : b)
      );

      setSuccessMessage("Review submitted successfully.");
      setTimeout(() => setSuccessMessage(null), 3000);
      setReviewModalBooking(null);
      setRating(5);
      setReviewText("");
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setError(err.message || "Unable to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === "Upcoming") return b.status === "pending" || b.status === "confirmed";
    if (activeTab === "Completed") return b.status === "completed";
    if (activeTab === "Cancelled") return b.status === "cancelled" || b.status === "no_show";
    return true;
  });

  if (loading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <TopBar 
        title="My Bookings" 
        subtitle="Manage your salon appointments"
        onBack={() => navigateTo("/customer")} 
        showHome={true}
        onHome={() => navigateTo("/customer")}
        showMainSite={true}
        onMainSite={() => navigateTo("/")}
      />

      {successMessage && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-emerald-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <p className="text-sm font-bold">{successMessage}</p>
        </div>
      )}
      <section className="px-4 py-4 flex gap-2 overflow-x-auto no-scrollbar">
        {["Upcoming", "Completed", "Cancelled"].map(tab => (
            <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs font-bold rounded-full border ${activeTab === tab ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}
            >
                {tab}
            </button>
        ))}
      </section>

      <div className="px-4 pb-4 space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((b) => (
              <div key={b.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3 animate-fade-in">
                  <div className="flex justify-between items-center">
                      <div>
                          <p className="font-bold text-slate-900 text-sm">{b.shops?.shop_name || "Salon"}</p>
                          <p className="text-[10px] text-slate-400">{b.shops?.area}, {b.shops?.city}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                        b.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                        b.status === 'completed' ? 'bg-blue-50 text-blue-600' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                      <p className="text-slate-500">Staff: {b.shop_staff?.staff_name || "Any Available Expert"}</p>
                      <p className="text-slate-500 font-bold">{new Date(b.booking_date).toLocaleDateString()} • {b.booking_time}</p>
                      <p className="font-black text-slate-900">₹{b.total_amount}</p>
                      {activeTab === "Upcoming" && (b.status === "confirmed" || b.status === "pending") && (
                        <CountdownTimer date={b.booking_date} time={b.booking_time} />
                      )}
                  </div>
                  <div className="flex gap-2">
                      <button 
                        onClick={() => navigateTo(`/booking/details/${b.id}`)} 
                        className="flex-1 py-2 text-[10px] font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                      >
                        Details
                      </button>
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <>
                          <button onClick={() => navigateTo(`/booking/details/${b.id}`)} className="flex-1 py-2 text-[10px] font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer">Reschedule</button>
                          {new Date(`${b.booking_date}T${b.booking_time}`).getTime() > new Date().getTime() && (
                            <button onClick={() => setCancelModalBookingId(b.id)} className="flex-1 py-2 text-[10px] font-bold border border-rose-100 text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer">Cancel Booking</button>
                          )}
                        </>
                      )}
                      {(b.status === 'completed' || b.status === 'cancelled') && (
                        <>
                          {b.status === 'completed' && (
                            b.customer_reviews && b.customer_reviews.length > 0 ? (
                              <div className="flex-1 py-2 text-[10px] font-bold border border-emerald-100 text-emerald-600 bg-emerald-50 rounded-lg text-center flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Reviewed
                              </div>
                            ) : (
                              <button 
                                onClick={() => {
                                  setReviewModalBooking(b);
                                  setRating(5);
                                  setReviewText("");
                                }} 
                                className="flex-1 py-2 text-[10px] font-bold border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                              >
                                Write Review
                              </button>
                            )
                          )}
                          <button 
                            onClick={() => navigateTo(`/booking/${b.shop_id}`)} 
                            className="flex-1 py-2 text-[10px] font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
                          >
                            Book Again
                          </button>
                        </>
                      )}
                  </div>
              </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">No bookings found</h3>
            <p className="text-xs text-slate-500 mb-6">You don't have any {activeTab.toLowerCase()} appointments.</p>
            <button 
              onClick={() => navigateTo("/customer")}
              className="text-blue-600 font-bold text-xs cursor-pointer"
            >
              Explore Salons
            </button>
          </div>
        )}
      </div>

      {cancelModalBookingId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-4 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Cancel this booking?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                disabled={isCancelling}
                onClick={() => setCancelModalBookingId(null)}
                className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Keep Booking
              </button>
              <button
                disabled={isCancelling}
                onClick={confirmCancel}
                className="flex-1 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewModalBooking && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Write a Review</h3>
            <p className="text-sm text-slate-500 text-center mb-6">Share your experience with this salon.</p>
            
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="cursor-pointer"
                >
                  <Star className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                </button>
              ))}
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell us about your experience..."
              maxLength={500}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] mb-6 resize-none"
            />

            <div className="flex gap-3">
              <button
                disabled={isSubmittingReview}
                onClick={() => setReviewModalBooking(null)}
                className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isSubmittingReview}
                onClick={submitReview}
                className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav currentPath="/my-bookings" navigateTo={navigateTo} />
    </div>
  );
};

export default MyBookings;
