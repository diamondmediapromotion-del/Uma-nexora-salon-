import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Check, Star, ShieldCheck, User, Sparkles, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Shop, ShopStaff } from "../../types";
import { useBooking } from "../../contexts/BookingContext";
import TopBar from "./TopBar";
import LoadingState from "./LoadingState";

interface StaffSelectionProps {
  navigateTo: (path: string) => void;
  shopId?: string;
}

const StaffSelection = ({ navigateTo, shopId }: StaffSelectionProps) => {
  const { bookingDraft, setSelectedStaff, totalPrice, totalDuration } = useBooking();
  const [shop, setShop] = useState<Shop | null>(bookingDraft.shop);
  const [staff, setStaff] = useState<ShopStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(
    bookingDraft.selectedStaff === "any" ? "any" : bookingDraft.selectedStaff?.id || null
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!shopId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // 1. Fetch Shop if not available
        if (!shop) {
          const { data: shopData, error: shopError } = await supabase
            .from("shops")
            .select("*")
            .eq("id", shopId)
            .eq("is_active", true)
            .single();
          
          if (shopError) throw shopError;
          setShop(shopData);
        }

        // 2. Fetch Staff
        const { data: staffData, error: staffError } = await supabase
          .from("shop_staff")
          .select("*")
          .eq("shop_id", shopId)
          .eq("is_active", true);
        
        if (staffError) throw staffError;
        setStaff(staffData || []);
      } catch (err: any) {
        console.error("Error fetching staff data:", err);
        setError(err.message || "Unable to load experts.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId, shop]);

  const handleSelectStaff = (id: string | "any") => {
    setSelectedStaffId(id);
    if (id === "any") {
      setSelectedStaff("any");
    } else {
      const selected = staff.find(s => s.id === id);
      if (selected) setSelectedStaff(selected);
    }
  };

  const selectedStaff = useMemo(() => {
    if (selectedStaffId === "any") return { staff_name: "Any Available Expert" };
    return staff.find(s => s.id === selectedStaffId);
  }, [staff, selectedStaffId]);

  const isAnyStaffAvailable = useMemo(() => {
    return staff.some(s => s.is_available);
  }, [staff]);

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
        title="Choose Your Expert" 
        subtitle={displayShopName}
        onBack={() => shopId ? navigateTo(`/booking/${shopId}`) : navigateTo("/booking/demo")} 
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i === 1 ? "bg-blue-600 text-white" : i < 1 ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>{i < 1 ? "✓" : i+1}</div>
                    <span className={`text-[10px] font-bold ${i === 1 ? "text-blue-600" : "text-slate-400"}`}>{step}</span>
                </div>
            ))}
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-900 text-xs mb-3">Selected Services</h4>
            {bookingDraft.selectedServices.map(s => (
              <div key={s.id} className="flex justify-between text-sm mb-1 text-slate-600">
                <span>{s.service_name}</span>
                <span>₹{s.price}</span>
              </div>
            ))}
            <div className="border-t border-slate-100 pt-3 mt-2 flex justify-between font-black text-slate-900">
              <span>Total</span>
              <span>₹{totalPrice} ({totalDuration} min)</span>
            </div>
          </div>

          <h3 className="font-bold text-slate-900 text-lg">Available Experts</h3>
          <p className="text-xs text-slate-500 mb-4">Choose your favourite staff or select any available expert.</p>

          {/* Any Available Expert Option */}
          <button 
              onClick={() => isAnyStaffAvailable && handleSelectStaff("any")}
              disabled={!isAnyStaffAvailable}
              className={`w-full bg-white p-5 rounded-2xl border transition-all flex items-center gap-4 ${selectedStaffId === "any" ? "border-blue-500 shadow-blue-50/50 shadow-lg scale-[1.02]" : "border-slate-100 shadow-sm"} ${!isAnyStaffAvailable && "opacity-60 cursor-not-allowed"}`}
          >
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-6 h-6" />
              </div>
              <div className="text-left flex-1">
                  <p className="font-bold text-slate-900 text-sm">Any Available Expert</p>
                  <p className="text-[10px] text-slate-500 font-medium">Fastest available staff • Auto-assign</p>
              </div>
              <div className={`px-4 py-2 rounded-xl text-[10px] font-bold transition ${selectedStaffId === "any" ? "bg-blue-600 text-white" : !isAnyStaffAvailable ? "bg-slate-100 text-slate-400" : "bg-slate-900 text-white"}`}>
                  {selectedStaffId === "any" ? "Selected" : isAnyStaffAvailable ? "Select" : "Unavailable"}
              </div>
          </button>

          {/* Staff List */}
          <div className="space-y-3">
              {staff.length > 0 ? (
                staff.map((s) => {
                    const isSelected = selectedStaffId === s.id;
                    const isAvailable = s.is_available;

                    return (
                        <div key={s.id} className={`bg-white p-5 rounded-2xl border transition-all ${isSelected ? "border-blue-500 shadow-blue-50/50 shadow-lg scale-[1.02]" : "border-slate-100 shadow-sm"} ${!isAvailable ? "opacity-60" : ""} flex items-center justify-between transition`}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-full overflow-hidden flex items-center justify-center border border-slate-200">
                                    {s.avatar_url ? (
                                        <img src={s.avatar_url} alt={s.staff_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                        <User className="w-6 h-6 text-slate-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">{s.staff_name}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">{s.role_title} • {s.experience_years}y Exp</p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <p className="text-[10px] text-amber-500 font-bold">{s.rating} ★</p>
                                        <span className="text-[10px] text-slate-300">•</span>
                                        <p className="text-[10px] text-blue-600 font-bold">{s.speciality}</p>
                                    </div>
                                </div>
                            </div>
                            <button 
                                disabled={!isAvailable}
                                onClick={() => isAvailable && handleSelectStaff(s.id)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold transition ${isSelected ? "bg-blue-600 text-white" : !isAvailable ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-slate-900 text-white hover:bg-blue-600"}`}
                            >
                                {isSelected ? "Selected" : isAvailable ? "Select" : "Unavailable"}
                            </button>
                        </div>
                    )
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3">
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 mb-1">Staff details will be added soon.</h3>
                  <p className="text-[10px] text-slate-500">You can still book with the auto-assign option.</p>
                </div>
              )}
          </div>
      </div>

      {/* Sticky Bottom Summary */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            {selectedStaff ? (
                <>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]">Expert: {selectedStaff.staff_name}</p>
                    <p className="font-black text-slate-900 text-lg">₹{totalPrice} • {totalDuration} min</p>
                </>
            ) : (
                <p className="text-xs font-bold text-slate-400">Select expert to continue</p>
            )}
          </div>
          <button 
            disabled={!selectedStaff}
            onClick={() => shopId ? navigateTo(`/booking/${shopId}/date-time`) : navigateTo("/booking/date-time")} 
            className={`font-black py-4 px-10 rounded-2xl text-sm transition ${selectedStaff ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30 hover:bg-blue-700" : "bg-slate-200 text-slate-500 cursor-not-allowed"}`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffSelection;
