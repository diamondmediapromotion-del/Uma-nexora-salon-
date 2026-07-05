import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Share2, Heart, MapPin, Star, Phone, MessageCircle, 
  Navigation, ShieldCheck, Zap, Percent, QrCode, Clock, Info, 
  Sparkles, Search, User, Calendar, CheckCircle2, AlertCircle 
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Shop, CustomerReview, ShopService, ShopStaff } from "../../types";
import { getShopImage } from "../../lib/shopUtils";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import LoadingState from "./LoadingState";

interface SalonDetailProps {
  navigateTo: (path: string) => void;
  shopId?: string;
}

const SalonDetail = ({ navigateTo, shopId }: SalonDetailProps) => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [services, setServices] = useState<ShopService[]>([]);
  const [staff, setStaff] = useState<ShopStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  useEffect(() => {
    if (shopId && shopId !== "demo") {
      fetchSalonData();
    } else {
      // Demo mode
      setLoading(false);
    }
  }, [shopId]);

  const fetchSalonData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Salon Details
      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .select("*")
        .eq("id", shopId)
        .single();
      
      if (shopError) throw shopError;
      setShop(shopData);

      // 2. Fetch Services, Staff, and Reviews in parallel
      const { data: { user } } = await supabase.auth.getUser();

      const promises = [
        supabase.from("shop_services").select("*").eq("shop_id", shopId).eq("is_active", true),
        supabase.from("shop_staff").select("*").eq("shop_id", shopId).eq("is_active", true),
        supabase.from("customer_reviews").select(`
          *,
          profiles:customer_id (full_name)
        `).eq("shop_id", shopId).order('created_at', { ascending: false })
      ];

      if (user) {
        promises.push(
          supabase.from("customer_favourites").select("*").eq("customer_id", user.id).eq("shop_id", shopId) as any
        );
      }

      const results = await Promise.all(promises);
      const servicesRes = results[0];
      const staffRes = results[1];
      const reviewsRes = results[2];
      const favRes = user ? results[3] : null;

      if (servicesRes.error) throw servicesRes.error;
      if (staffRes.error) throw staffRes.error;
      if (reviewsRes.error) throw reviewsRes.error;

      setServices(servicesRes.data || []);
      setStaff(staffRes.data || []);
      setReviews(reviewsRes.data || []);
      
      if (favRes && favRes.data && favRes.data.length > 0) {
        setIsSaved(true);
      } else {
        setIsSaved(false);
      }

    } catch (err: any) {
      console.error("Error fetching salon data:", err);
      setError("Unable to load salon details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return shop?.rating || 0;
    const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const toggleSaveShop = async () => {
    if (shopId === "demo") return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigateTo("/login");
      return;
    }

    if (isSaved) {
      setIsSaved(false);
      setLocalMessage("Salon removed from saved.");
      try {
        await supabase
          .from("customer_favourites")
          .delete()
          .eq("customer_id", user.id)
          .eq("shop_id", shopId);
      } catch (err) {
        console.error("Error removing favourite", err);
      }
    } else {
      setIsSaved(true);
      setLocalMessage("Salon saved.");
      try {
        await supabase
          .from("customer_favourites")
          .insert({
            customer_id: user.id,
            shop_id: shopId
          });
      } catch (err) {
        console.error("Error adding favourite", err);
      }
    }
    
    setTimeout(() => {
      setLocalMessage(null);
    }, 3000);
  };

  if (loading) return <LoadingState />;

  if (error && shopId !== "demo") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-lg font-bold text-slate-900 mb-2">Error</h2>
        <p className="text-slate-500 text-sm mb-6">{error}</p>
        <button onClick={() => navigateTo("/customer")} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-xs">
          Back to Explore
        </button>
      </div>
    );
  }

  // Fallback for demo
  const displayShop = shop || {
    shop_name: "Chique Salon",
    area: "C-Scheme",
    city: "Jaipur",
    rating: 4.9,
    address: "Premium area, Jaipur",
    is_verified: true,
    cover_image_url: null,
    id: "demo"
  };

  const displayServices = services.length > 0 ? services : [
    { service_name: "Haircut & Styling", price: 199, duration_minutes: 30 },
    { service_name: "Beard Grooming", price: 149, duration_minutes: 20 },
    { service_name: "Hair Spa", price: 699, duration_minutes: 45 },
  ];

  const displayStaff = staff.length > 0 ? staff : [
    { staff_name: "Aarav Sharma", role_title: "Hair Stylist", rating: 4.8 },
    { staff_name: "Neha Verma", role_title: "Beauty Expert", rating: 4.9 },
  ];

  const avgRating = calculateAverageRating();

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans">
      {/* Top Bar */}
      {localMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-fade-in pointer-events-none">
          <div className="bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-slate-900/20">
            {localMessage}
          </div>
        </div>
      )}
      <TopBar 
        title={displayShop.shop_name} 
        onBack={() => navigateTo("/customer")} 
        showHome={true}
        onHome={() => navigateTo("/customer")}
        showMainSite={true}
        onMainSite={() => navigateTo("/")}
      />

      {/* Hero */}
      <section className="relative h-64 bg-slate-200">
        <img src={getShopImage(displayShop)} alt={displayShop.shop_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <button 
          onClick={toggleSaveShop}
          className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-lg transition-all z-10 cursor-pointer"
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
        </button>
      </section>

      <div className="max-w-2xl mx-auto -mt-16 px-4 space-y-6">
        {/* Salon Info Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-white">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-black text-slate-900">{displayShop.shop_name}</h2>
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">Open</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {displayShop.area}, {displayShop.city}</span>
              <span className="flex items-center gap-1.5 text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500" /> 
                {avgRating} ({reviews.length > 0 ? `${reviews.length} Reviews` : "New"})
              </span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-4 gap-3">
          {[ { icon: Zap, label: "Book" }, { icon: Phone, label: "Call" }, { icon: MessageCircle, label: "Chat" }, { icon: Navigation, label: "Map" }].map((action, i) => (
             <button key={i} className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 border border-slate-100 shadow-sm hover:shadow-md transition">
               <action.icon className="w-5 h-5 text-blue-600" /> 
               <span className="text-[10px] font-bold text-slate-900">{action.label}</span>
             </button>
          ))}
        </div>

        {/* About */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-2 text-lg">About this salon</h3>
          <p className="text-sm text-slate-600 leading-relaxed">Premium verified salon offering grooming, styling, beauty and wellness services with transparent pricing and faster booking experience through Nexora.</p>
        </div>

        {/* Services */}
        <div>
          <h3 className="font-bold text-slate-900 mb-4 text-lg">Services</h3>
          <div className="space-y-3">
            {displayServices.map((s: any, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{s.service_name}</p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">{s.duration_minutes} min</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-black text-slate-900 text-sm">₹{s.price}</span>
                  <button 
                    onClick={() => navigateTo(`/booking/${shopId || 'demo'}`)}
                    className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[11px] font-bold hover:bg-blue-600 transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff */}
        <div>
          <h3 className="font-bold text-slate-900 mb-4 text-lg">Choose Your Expert</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
            {displayStaff.map((s: any, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 min-w-[150px] text-center shadow-sm hover:border-blue-200 transition">
                <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-3 border-4 border-slate-50"></div>
                <p className="font-bold text-slate-900 text-xs">{s.staff_name}</p>
                <p className="text-[10px] text-slate-500 mb-2 font-medium">{s.role_title}</p>
                <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">{s.rating} ★</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 text-lg">Reviews</h3>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-bold text-slate-900">{avgRating}</span>
              <span className="text-xs text-slate-400 font-medium">({reviews.length})</span>
            </div>
          </div>

          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{review.profiles?.full_name || "Nexora Customer"}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-2.5 h-2.5 ${s <= review.rating ? "text-amber-500 fill-amber-500" : "text-slate-200"}`} />
                      ))}
                    </div>
                  </div>
                  {review.review_text && (
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">"{review.review_text}"</p>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-200 text-center">
                <MessageCircle className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-400">No reviews yet.</p>
                <p className="text-[10px] text-slate-300 font-medium">Be the first to share your experience!</p>
              </div>
            )}
          </div>
        </div>

        {/* Trust Strip */}
        <div className="grid grid-cols-2 gap-3">
          {[ { icon: ShieldCheck, label: "Verified Salon" }, { icon: Zap, label: "60s Booking" }, { icon: Percent, label: "Price Transparency" }, { icon: QrCode, label: "Rewards" }].map((b, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <b.icon className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-bold text-slate-700">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Starting from</p>
            <p className="font-black text-slate-900 text-xl">₹{displayShop.starting_price || 199}</p>
          </div>
          <button onClick={() => navigateTo(`/booking/${shopId || 'demo'}`)} className="bg-blue-600 text-white font-black py-4 px-10 rounded-2xl text-sm shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition">
            Book Now
          </button>
        </div>
      </div>
      <BottomNav currentPath={`/salon/${shopId || 'demo'}`} navigateTo={navigateTo} />
    </div>
  );
};

export default SalonDetail;
