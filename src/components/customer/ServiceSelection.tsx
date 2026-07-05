import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Check, Plus, Minus, Info, Sparkles, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Shop, ShopService } from "../../types";
import { useBooking } from "../../contexts/BookingContext";
import TopBar from "./TopBar";
import LoadingState from "./LoadingState";

interface ServiceSelectionProps {
  navigateTo: (path: string) => void;
  shopId?: string;
}

const ServiceSelection = ({ navigateTo, shopId }: ServiceSelectionProps) => {
  const { bookingDraft, setShop, setSelectedServices } = useBooking();
  const [shop, setLocalShop] = useState<Shop | null>(bookingDraft.shop);
  const [services, setServices] = useState<ShopService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(bookingDraft.selectedServices.map(s => s.id));
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      if (!shopId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // 1. Fetch Shop if not already in context or different
        if (!bookingDraft.shop || bookingDraft.shop.id !== shopId) {
          const { data: shopData, error: shopError } = await supabase
            .from("shops")
            .select("*")
            .eq("id", shopId)
            .eq("is_active", true)
            .single();
          
          if (shopError) throw shopError;
          if (!shopData) throw new Error("Shop not found");
          setShop(shopData);
          setLocalShop(shopData);
        }

        // 2. Fetch Services
        const { data: servicesData, error: servicesError } = await supabase
          .from("shop_services")
          .select("*")
          .eq("shop_id", shopId)
          .eq("is_active", true);
        
        if (servicesError) throw servicesError;
        setServices(servicesData || []);
      } catch (err: any) {
        console.error("Error fetching booking data:", err);
        setError(err.message || "Unable to load services.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId]);

  const categories = useMemo(() => {
    const cats = ["All", ...Array.from(new Set(services.map(s => s.category)))];
    return cats.sort();
  }, [services]);

  const filteredServices = useMemo(() => {
    return activeCategory === "All"
      ? services
      : services.filter((s) => s.category === activeCategory);
  }, [services, activeCategory]);

  const toggleService = (id: string) => {
    const newIds = selectedServiceIds.includes(id) 
      ? selectedServiceIds.filter((sid) => sid !== id) 
      : [...selectedServiceIds, id];
    
    setSelectedServiceIds(newIds);
    const selectedServices = services.filter(s => newIds.includes(s.id));
    setSelectedServices(selectedServices);
  };

  const selectedData = useMemo(() => {
    const selected = services.filter((s) => selectedServiceIds.includes(s.id));
    const totalPrice = selected.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = selected.reduce((sum, s) => sum + s.duration_minutes, 0);
    return { selected, totalPrice, totalDuration };
  }, [services, selectedServiceIds]);

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
      {/* Top Bar */}
      <TopBar 
        title="Select Services" 
        subtitle={displayShopName}
        onBack={() => shopId ? navigateTo(`/salon/${shopId}`) : navigateTo("/salon/demo")} 
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i === 0 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>{i+1}</div>
                    <span className={`text-[10px] font-bold ${i === 0 ? "text-blue-600" : "text-slate-400"}`}>{step}</span>
                </div>
            ))}
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Salon Summary Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                  <h3 className="font-bold text-slate-900 text-sm">{displayShopName}</h3>
                  <p className="text-[10px] text-slate-500">{displayArea}, {displayCity} • <span className="text-amber-500 font-bold">{displayRating} ★</span></p>
              </div>
              <div className="flex gap-2">
                {displayVerified && <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold">Verified</span>}
                <span className={`${displayIsOpen ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"} px-3 py-1 rounded-full text-[10px] font-bold`}>{displayIsOpen ? "Open" : "Closed"}</span>
              </div>
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
              {categories.map(c => (
                  <button 
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap border transition ${activeCategory === c ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}
                  >
                      {c}
                  </button>
              ))}
          </div>

          {/* Service List */}
          <div className="space-y-3">
              {filteredServices.length > 0 ? (
                filteredServices.map((s) => {
                    const isSelected = selectedServiceIds.includes(s.id);
                    return (
                      <div key={s.id} className={`bg-white p-5 rounded-2xl border transition-all duration-300 ${isSelected ? "border-blue-500 shadow-blue-500/10 shadow-xl scale-[1.02]" : "border-slate-100 shadow-sm hover:border-slate-200"} flex justify-between items-center`}>
                          <div className="flex-1 pr-4">
                              <p className="font-bold text-slate-900 text-sm mb-0.5">{s.service_name}</p>
                              <p className="text-[10px] text-slate-400 font-medium mb-2 uppercase tracking-wide">{s.category} • {s.duration_minutes} min</p>
                              {s.description && <p className="text-[11px] text-slate-500 mb-3 line-clamp-1 italic">"{s.description}"</p>}
                              <p className="font-black text-slate-900 text-sm">₹{s.price}</p>
                          </div>
                          <button 
                              onClick={() => toggleService(s.id)}
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isSelected ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"}`}
                          >
                              {isSelected ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                          </button>
                      </div>
                    )
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">No services added yet.</h3>
                  <p className="text-xs text-slate-500 mb-6">This salon hasn't listed any services in this category.</p>
                  <button 
                    onClick={() => shopId ? navigateTo(`/salon/${shopId}`) : navigateTo("/salon/demo")}
                    className="text-blue-600 font-bold text-xs"
                  >
                    Back to Salon
                  </button>
                </div>
              )}
          </div>
      </div>

      {/* Sticky Bottom Summary */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            {selectedData.selected.length > 0 ? (
                <>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedData.selected.length} Item{selectedData.selected.length > 1 ? "s" : ""}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedData.totalDuration} min</span>
                    </div>
                    <p className="font-black text-slate-900 text-2xl">₹{selectedData.totalPrice}</p>
                </>
            ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-200 rounded-full animate-pulse"></div>
                  <p className="text-xs font-bold text-slate-400">Select services to continue</p>
                </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {selectedData.selected.length > 0 && (
              <button 
                onClick={() => setSelectedServiceIds([])}
                className="text-[10px] font-bold text-rose-500 uppercase tracking-wider hover:text-rose-600 transition-colors"
              >
                Clear
              </button>
            )}
            <button 
              disabled={selectedData.selected.length === 0}
              onClick={() => shopId ? navigateTo(`/booking/${shopId}/staff`) : navigateTo("/booking/staff")} 
              className={`font-black py-4 px-10 rounded-2xl text-sm transition-all active:scale-95 ${selectedData.selected.length > 0 ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30 hover:bg-blue-700" : "bg-slate-100 text-slate-300 cursor-not-allowed"}`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelection;
