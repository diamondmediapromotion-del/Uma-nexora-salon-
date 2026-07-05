import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Navigation, 
  Clock, 
  Calendar, 
  User, 
  ShieldCheck, 
  Star, 
  ChevronRight, 
  AlertCircle,
  XCircle,
  RefreshCcw,
  CheckCircle2,
  MoreVertical,
  ExternalLink,
  Info,
  Sparkles,
  Share2,
  QrCode,
  Upload
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { 
  CustomerBooking, 
  BookingServiceDetail, 
  Shop, 
  ShopStaff, 
  Profile,
  CustomerReview 
} from "../../types";
import { getShopImage } from "../../lib/shopUtils";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import LoadingState from "./LoadingState";

interface BookingDetailsProps {
  navigateTo: (path: string) => void;
  bookingId: string;
}

const BookingDetails = ({ navigateTo, bookingId }: BookingDetailsProps) => {
  const [booking, setBooking] = useState<CustomerBooking | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [staff, setStaff] = useState<ShopStaff | null>(null);
  const [services, setServices] = useState<BookingServiceDetail[]>([]);
  const [customer, setCustomer] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // QR Payment & Settings States
  const [isPaying, setIsPaying] = useState(false);
  const [isBucketAvailable, setIsBucketAvailable] = useState(false); // Added
  const [rewardBalance, setRewardBalance] = useState(0); // Added
  const [applyRewards, setApplyRewards] = useState(false); // Added
  const [membership, setMembership] = useState<any>(null); // Added

  // Review state
  const [existingReview, setExistingReview] = useState<CustomerReview | null>(null);
  const [rewardEntry, setRewardEntry] = useState<any>(null); // Added
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [removingReward, setRemovingReward] = useState(false); // Added

  const handleShare = async () => {
    if (!booking || !shop) return;
    
    const serviceNames = services.map(s => s.service_name).join(", ");
    
    const shareText = `My Nexora SalonOS appointment:\n\nSalon: ${shop.shop_name}\nService: ${serviceNames || 'Salon Service'}\nDate: ${new Date(booking.booking_date).toLocaleDateString()}\nTime: ${booking.booking_time}\nStaff: ${staff?.staff_name || 'Any Available Expert'}\nLocation: ${shop.area}, ${shop.city}\nStatus: ${booking.status}\n\nBooked via Nexora SalonOS.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Nexora Salon Appointment",
          text: shareText,
          url: window.location.href
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Error sharing:", err);
          setMessage({ type: 'error', text: "Unable to share appointment. Please try again." });
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText + "\n\n" + window.location.href);
        setMessage({ type: 'success', text: "Appointment details copied to clipboard." });
      } catch (err: any) {
         console.error("Error copying to clipboard:", err);
         setMessage({ type: 'error', text: "Unable to share appointment. Please try again." });
      }
    }
  };

  useEffect(() => {
    fetchBookingData();
  }, [bookingId]);

  const fetchBookingData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get Session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigateTo("/login");
        return;
      }

      // 2. Fetch Booking
      const { data: bookingData, error: bookingError } = await supabase
        .from("customer_bookings")
        .select("*")
        .eq("id", bookingId)
        .eq("customer_id", session.user.id)
        .single();

      if (bookingError) throw bookingError;
      if (!bookingData) throw new Error("Booking not found");
      setBooking(bookingData);
      
      if (bookingData.reward_redeemed_amount && bookingData.reward_redeemed_amount > 0) {
        setApplyRewards(true);
      }

      // 3. Fetch Related Data in Parallel
      const [shopRes, staffRes, servicesRes, profileRes] = await Promise.all([
        supabase.from("shops").select("*").eq("id", bookingData.shop_id).single(),
        bookingData.staff_id ? supabase.from("shop_staff").select("*").eq("id", bookingData.staff_id).single() : Promise.resolve({ data: null, error: null }),
        supabase.from("customer_booking_services").select("*").eq("booking_id", bookingId),
        supabase.from("profiles").select("*").eq("id", session.user.id).single()
      ]);

      if (shopRes.error) throw shopRes.error;
      if (servicesRes.error) throw servicesRes.error;
      if (profileRes.error) throw profileRes.error;

      setShop(shopRes.data);
      setStaff(staffRes.data);
      setServices(servicesRes.data || []);
      setCustomer(profileRes.data);

      // 4. Check for existing review, reward entry, reward wallet AND membership
      const [reviewData, rewardData, rewardWallet, membershipData] = await Promise.all([
        supabase
          .from("customer_reviews")
          .select("*")
          .eq("booking_id", bookingId)
          .eq("customer_id", session.user.id)
          .maybeSingle(),
        supabase
          .from("customer_reward_ledger")
          .select("*")
          .eq("booking_id", bookingId)
          .maybeSingle(),
        supabase
          .from("customer_reward_wallets")
          .select("balance")
          .eq("customer_id", session.user.id)
          .maybeSingle(),
        supabase
          .from("customer_memberships")
          .select("*, membership_plans(*)")
          .eq("customer_id", session.user.id)
          .maybeSingle()
      ]);
      
      setExistingReview(reviewData.data);
      setRewardEntry(rewardData.data);
      setRewardBalance(rewardWallet.data?.balance || 0);
      setMembership(membershipData.data);

      // 5. Test if storage bucket exists
      try {
        const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets();
        const exists = buckets?.some(b => b.name === "payment-proofs");
        setIsBucketAvailable(!!exists);
      } catch (err) {
        console.warn("Storage listBuckets error, assuming disabled:", err);
        setIsBucketAvailable(false);
      }

    } catch (err: any) {
      console.error("Error fetching booking details:", err);
      setError(err.message || "Unable to load booking details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    
    setCancelling(true);
    setMessage(null);
    try {
      const { error: updateError } = await supabase
        .from("customer_bookings")
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq("id", booking.id);

      if (updateError) throw updateError;

      setMessage({ type: 'success', text: "Booking cancelled successfully." });
      // Refresh local state
      setBooking({ ...booking, status: 'cancelled' });
    } catch (err: any) {
      console.error("Error cancelling booking:", err);
      setMessage({ type: 'error', text: err.message || "Failed to cancel booking." });
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!booking || !rating) return;
    
    setSubmittingReview(true);
    setMessage(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error: reviewError } = await supabase
        .from("customer_reviews")
        .insert({
          customer_id: session.user.id,
          shop_id: booking.shop_id,
          booking_id: booking.id,
          rating: rating,
          review_text: reviewText
        })
        .select()
        .single();

      if (reviewError) throw reviewError;

      setExistingReview(data);
      setShowReviewForm(false);
      setMessage({ type: 'success', text: "Review submitted successfully." });
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setMessage({ type: 'error', text: err.message || "Failed to submit review." });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handlePayNow = async () => {
    if (!booking) return;
    setIsPaying(true);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Unauthorized");

      // 1. Create order
      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
            booking_id: booking.id,
            reward_redeemed_amount: applyRewards ? Math.min(rewardBalance, booking.total_amount - 1) : 0
        }),
      });
      const order = await response.json();
      if (!order.order_id) throw new Error("Failed to create order");

      // 2. Open checkout
      const options = {
        key: order.key_id,
        amount: (booking.total_amount - (applyRewards ? Math.min(rewardBalance, booking.total_amount - 1) : 0)) * 100,
        currency: "INR",
        name: "Nexora",
        description: "Booking Payment",
        order_id: order.order_id,
        handler: async (response: any) => {
          // 3. Verify
          const verifyRes = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          if (verifyRes.ok) {
            setMessage({ type: 'success', text: "Payment verified successfully." });
          } else {
            setMessage({ type: 'error', text: "Payment verification failed." });
          }
        },
        prefill: {
          email: session.user.email,
        },
      };
      
      // @ts-ignore
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: "Payment initiation failed." });
    } finally {
      setIsPaying(false);
    }
  };

  const handleRemoveReward = async () => {
    if (!booking) return;
    setRemovingReward(true);
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Unauthorized");

        const response = await fetch("/api/razorpay/remove-reward", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ booking_id: booking.id }),
        });
        
        if (!response.ok) throw new Error("Failed to remove reward");
        
        setApplyRewards(false);
        setBooking({ ...booking, reward_redeemed_amount: 0 });
        setMessage({ type: 'success', text: "Reward removed." });
    } catch (err) {
        console.error(err);
        setMessage({ type: 'error', text: "Failed to remove reward" });
    } finally {
        setRemovingReward(false);
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  if (loading) return <LoadingState />;

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Booking not found</h2>
        <p className="text-slate-500 text-sm mb-6">{error || "This booking might have been removed or you don't have access."}</p>
        <button 
          onClick={() => navigateTo("/my-bookings")}
          className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-xs"
        >
          Back to My Bookings
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'confirmed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'completed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'no_show': return 'bg-slate-50 text-slate-600 border-slate-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'no_show': return 'No Show';
      default: return status;
    }
  };

  const membershipDiscount = membership?.membership_plans?.discount_percent || 0;
  const discountAmount = Math.floor(booking.total_amount * (membershipDiscount / 100));
  const amountAfterMembership = booking.total_amount - discountAmount;
  const rewardToRedeem = applyRewards ? Math.min(rewardBalance, amountAfterMembership - 1) : 0;
  const payableAmount = amountAfterMembership - rewardToRedeem;

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans">
      <TopBar 
        title="Booking Details" 
        subtitle="View your appointment information"
        onBack={() => navigateTo("/my-bookings")} 
        showHome={true}
        onHome={() => navigateTo("/customer")}
        showMainSite={true}
        onMainSite={() => navigateTo("/")}
      />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Status Message */}
        {message && (
          <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <p className="text-sm font-bold">{message.text}</p>
          </div>
        )}

        {/* Status Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(booking.status)}`}>
                    {getStatusLabel(booking.status)}
                </span>
                <p className="text-slate-400 text-[10px] font-medium pt-1">ID: {booking.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Booked On</p>
                <p className="text-xs font-bold text-slate-900">{new Date(booking.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
        </div>

        {/* Salon Card */}
        {shop && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-lg">{shop.shop_name}</h3>
                        {shop.is_verified && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{shop.area}, {shop.city}</p>
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-slate-900">{shop.rating}</span>
                    </div>
                </div>
                <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden shrink-0">
                    <img src={getShopImage(shop)} alt={shop.shop_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 leading-relaxed">{shop.address}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-2 pt-2">
                    <button className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span className="text-[10px] font-bold text-slate-900">Call</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition">
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <span className="text-[10px] font-bold text-slate-900">WhatsApp</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition">
                        <Navigation className="w-4 h-4 text-slate-600" />
                        <span className="text-[10px] font-bold text-slate-900">Directions</span>
                    </button>
                </div>
            </div>
          </div>
        )}

        {/* Appointment Details Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-50 pb-4">Appointment Details</h4>
            
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Date</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{new Date(booking.booking_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Time</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{booking.booking_time}</p>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <User className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Expert</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{staff ? staff.staff_name : "Any Available Expert"}</p>
                    {staff && <p className="text-[10px] text-slate-400 font-medium">{staff.role_title}</p>}
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Duration</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{booking.total_duration_minutes} min</p>
                </div>
            </div>

            {booking.notes && (
                <div className="pt-4 border-t border-slate-50 space-y-2">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Info className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Notes</span>
                    </div>
                    <p className="text-xs text-slate-600 italic">"{booking.notes}"</p>
                </div>
            )}
        </div>

        {/* Services Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 text-sm pb-2">Selected Services</h4>
            <div className="space-y-3">
                {services.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2">
                        <div>
                            <p className="text-xs font-bold text-slate-900">{s.service_name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{s.duration_minutes} min</p>
                        </div>
                        <p className="text-xs font-black text-slate-900">₹{s.price}</p>
                    </div>
                ))}
            </div>
            
            <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                <p className="text-xs font-bold text-slate-500 uppercase">Gross Amount</p>
                <p className="text-lg font-black text-slate-900">₹{booking.total_amount}</p>
            </div>
            
            {membershipDiscount > 0 && (
                <div className="flex justify-between items-center text-amber-600">
                    <p className="text-xs font-bold uppercase">{membership.membership_plans.name} ({membershipDiscount}%)</p>
                    <p className="text-lg font-black">-₹{discountAmount}</p>
                </div>
            )}
            
            {applyRewards && (
                <div className="flex justify-between items-center text-emerald-600">
                    <p className="text-xs font-bold uppercase">Reward Redeemed</p>
                    <p className="text-lg font-black">-₹{rewardToRedeem}</p>
                </div>
            )}
            
            <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                <p className="text-xs font-bold text-slate-500 uppercase">Payable Amount</p>
                <p className="text-lg font-black text-slate-900">₹{payableAmount}</p>
            </div>
        </div>

        {/* Payment Section */}
        {(booking.status === 'pending' || booking.status === 'confirmed') && booking.payment_status !== 'paid' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">Pay Online</h4>
                
                {rewardBalance > 0 && booking.payment_status !== 'order_created' && (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={applyRewards} 
                                    onChange={(e) => setApplyRewards(e.target.checked)} 
                                    className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-xs font-bold text-emerald-900">Apply Reward Balance (₹{rewardBalance})</span>
                            </label>
                        </div>
                    </div>
                )}
                
                {applyRewards && booking.payment_status !== 'order_created' && (
                    <button onClick={handleRemoveReward} disabled={removingReward} className="text-[10px] text-rose-600 font-bold underline">Remove Applied Reward</button>
                )}

                <button
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 text-white font-bold rounded-2xl text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition"
                    onClick={handlePayNow}
                    disabled={isPaying}
                >
                    {isPaying ? "Processing..." : `Pay ₹${payableAmount}`}
                </button>
                {booking.payment_status === 'order_created' && (
                    <p className="text-xs text-amber-600 font-bold text-center">Payment verification in progress.</p>
                )}
            </div>
        )}
        
        {rewardEntry && (
            <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                    <Sparkles className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-emerald-900 text-sm">Rewards Earned!</h4>
                    <p className="text-xs text-emerald-700">You earned ₹{rewardEntry.amount} reward points for this booking.</p>
                </div>
            </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4 pt-4">
                {new Date(`${booking.booking_date}T${booking.booking_time}`).getTime() > new Date().getTime() && (
                    <button 
                      onClick={handleShare}
                      className="col-span-2 flex items-center justify-center gap-2 py-4 px-6 bg-blue-50 text-blue-700 font-bold rounded-2xl text-xs border border-blue-100 hover:bg-blue-100 transition cursor-pointer"
                    >
                        <Share2 className="w-4 h-4" /> Share Appointment
                    </button>
                )}
                <button 
                  onClick={() => alert("Reschedule flow will be connected later.")}
                  className="flex items-center justify-center gap-2 py-4 px-6 bg-white text-slate-900 font-bold rounded-2xl text-xs border border-slate-200 shadow-sm hover:bg-slate-50 transition cursor-pointer"
                >
                    <RefreshCcw className="w-4 h-4" /> Reschedule
                </button>
                <button 
                  disabled={cancelling}
                  onClick={handleCancelBooking}
                  className={`flex items-center justify-center gap-2 py-4 px-6 bg-rose-50 text-rose-600 font-bold rounded-2xl text-xs border border-rose-100 hover:bg-rose-100 transition cursor-pointer ${cancelling ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    <XCircle className="w-4 h-4" /> {cancelling ? "Cancelling..." : "Cancel Booking"}
                </button>
        </div>

        {(booking.status === 'completed' || booking.status === 'cancelled' || booking.status === 'no_show') && (
            <div className="space-y-4 pt-4">
                <button 
                  onClick={() => navigateTo(`/booking/${booking.shop_id}`)}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 text-white font-bold rounded-2xl text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition"
                >
                    Book Again
                </button>
                {booking.status === 'completed' && (
                    <>
                      {existingReview ? (
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
                          <p className="text-xs font-bold text-emerald-700">You have already reviewed this booking.</p>
                          <div className="flex justify-center gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`w-3 h-3 ${star <= existingReview.rating ? "text-amber-500 fill-amber-500" : "text-slate-300"}`} />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setShowReviewForm(true)}
                          className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-white text-slate-900 font-bold rounded-2xl text-sm border border-slate-200 shadow-sm hover:bg-slate-50 transition"
                        >
                            Leave a Review
                        </button>
                      )}
                    </>
                )}
            </div>
        )}

        {/* Review Form Overlay */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-8 space-y-6 animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900">How was your visit?</h3>
                <button onClick={() => setShowReviewForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition">
                  <XCircle className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              
              <div className="space-y-4 text-center py-4">
                <p className="text-sm text-slate-500 font-medium">Tap a star to rate your experience</p>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform active:scale-90"
                    >
                      <Star className={`w-10 h-10 ${star <= rating ? "text-amber-500 fill-amber-500" : "text-slate-200"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Share more details (Optional)</label>
                <textarea 
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell us what you liked about the service..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[120px] resize-none"
                />
              </div>

              <button 
                disabled={!rating || submittingReview}
                onClick={handleSubmitReview}
                className={`w-full py-4 bg-slate-900 text-white font-black rounded-2xl text-sm shadow-xl hover:bg-slate-800 transition ${(!rating || submittingReview) ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        )}

        {/* Important Notes Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl -mr-10 -mt-10"></div>
            <div className="flex items-center gap-2 relative z-10">
                <Info className="w-4 h-4 text-blue-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider">Important Notes</h4>
            </div>
            <ul className="space-y-3 relative z-10">
                <li className="flex items-start gap-3 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0 mt-1.5"></span>
                    Please arrive 10 minutes before your scheduled time.
                </li>
                <li className="flex items-start gap-3 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0 mt-1.5"></span>
                    Booking confirmation updates will be added later.
                </li>
                <li className="flex items-start gap-3 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0 mt-1.5"></span>
                    QR rewards will apply after payment module is connected.
                </li>
                <li className="flex items-start gap-3 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0 mt-1.5"></span>
                    Contact salon directly for any urgent changes.
                </li>
            </ul>
        </div>
      </div>

      <BottomNav currentPath="/my-bookings" navigateTo={navigateTo} />
    </div>
  );
};

export default BookingDetails;

