import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { 
  MapPin, 
  Phone, 
  Clock, 
  ArrowLeft, 
  CheckCircle, 
  Star, 
  ExternalLink, 
  MessageCircle, 
  Mail, 
  Compass, 
  Sparkles,
  Calendar,
  QrCode
} from "lucide-react";

interface PublicShopWebsiteProps {
  slug?: string;
  previewData?: any;
  navigateTo: (path: string) => void;
}

export default function PublicShopWebsite({ slug, previewData, navigateTo }: PublicShopWebsiteProps) {
  const [shop, setShop] = useState<any>(previewData || null);
  const [services, setServices] = useState<any[]>([]);
  const [qrSettings, setQrSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlatformQr() {
      try {
        const { data: qrData } = await supabase
          .from("platform_qr_settings")
          .select("*")
          .eq("is_active", true)
          .maybeSingle();
        if (qrData) {
          setQrSettings(qrData);
        }
      } catch (err) {
        console.error("Error fetching platform QR in public page:", err);
      }
    }

    if (previewData) {
      setShop(previewData);
      setServices(previewData.services || [
        { id: "1", service_name: "Signature Haircut", category: "Hair", price: 499, duration_minutes: 30 },
        { id: "2", service_name: "Hydra Facial Luxe", category: "Skin", price: 1999, duration_minutes: 60 },
        { id: "3", service_name: "Beard Sculpture", category: "Beard", price: 299, duration_minutes: 20 }
      ]);
      fetchPlatformQr();
      setLoading(false);
      return;
    }

    async function fetchShopAndServices() {
      setLoading(true);
      setError(null);
      try {
        // Fetch only approved & active shop
        const { data: shopData, error: shopError } = await supabase
          .from("shops")
          .select("*")
          .eq("slug", slug)
          .eq("is_active", true)
          .eq("approval_status", "approved")
          .maybeSingle();

        if (shopError) {
          console.error("Error fetching shop by slug:", shopError);
          setError("Failed to load shop website. Please try again later.");
          return;
        }

        if (!shopData) {
          setError("NOT_FOUND");
          return;
        }

        setShop(shopData);

        // Fetch active shop services
        const { data: servicesData, error: servicesError } = await supabase
          .from("shop_services")
          .select("*")
          .eq("shop_id", shopData.id)
          .eq("is_active", true);

        if (servicesError) {
          console.warn("Could not load services:", servicesError);
        } else {
          setServices(servicesData || []);
        }

        // Fetch active platform QR
        const { data: qrData } = await supabase
          .from("platform_qr_settings")
          .select("*")
          .eq("is_active", true)
          .maybeSingle();
        if (qrData) {
          setQrSettings(qrData);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchShopAndServices();
    }
  }, [slug, previewData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <p className="text-sm text-slate-500 font-medium">Loading salon website...</p>
      </div>
    );
  }

  if (error === "NOT_FOUND" || !shop) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
            <Compass className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-900">This shop website is not available yet.</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              The shop may be pending approval or the link may be incorrect.
            </p>
          </div>
          <button 
            onClick={() => navigateTo("/customer")}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-slate-800 transition cursor-pointer"
          >
            Explore Salons
          </button>
        </div>
      </div>
    );
  }

  // Template Styles configuration
  const template = shop.selected_template || "modern_salon";
  
  let styles = {
    bg: "bg-slate-50 text-slate-900",
    cardBg: "bg-white",
    textMuted: "text-slate-500",
    accentText: "text-blue-600",
    accentBg: "bg-blue-600 hover:bg-blue-700 text-white",
    accentLight: "bg-blue-50 text-blue-700 border-blue-100",
    navBg: "bg-white/80 backdrop-blur-md border-slate-100",
    badge: "bg-blue-100 text-blue-800",
    bannerFallback: "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500",
    border: "border-slate-100",
    buttonRounded: "rounded-xl",
    starColor: "text-amber-500",
  };

  if (template === "royal_luxe") {
    styles = {
      bg: "bg-slate-950 text-amber-100/90",
      cardBg: "bg-slate-900/90 border border-amber-950/40",
      textMuted: "text-slate-400",
      accentText: "text-amber-400",
      accentBg: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold",
      accentLight: "bg-amber-950/50 text-amber-300 border-amber-900/40",
      navBg: "bg-slate-950/90 backdrop-blur-md border-amber-950/30",
      badge: "bg-amber-950 text-amber-300 border border-amber-900/50",
      bannerFallback: "bg-gradient-to-br from-slate-900 via-stone-900 to-amber-950",
      border: "border-slate-800",
      buttonRounded: "rounded-lg",
      starColor: "text-amber-400",
    };
  } else if (template === "professional_beauty") {
    styles = {
      bg: "bg-rose-50/30 text-rose-950",
      cardBg: "bg-white border border-rose-100/60",
      textMuted: "text-rose-800/60",
      accentText: "text-rose-600",
      accentBg: "bg-rose-600 hover:bg-rose-700 text-white",
      accentLight: "bg-rose-50 text-rose-700 border-rose-100",
      navBg: "bg-white/80 backdrop-blur-md border-rose-100/40",
      badge: "bg-rose-100 text-rose-800",
      bannerFallback: "bg-gradient-to-r from-rose-400 via-pink-400 to-orange-300",
      border: "border-rose-100/40",
      buttonRounded: "rounded-2xl",
      starColor: "text-amber-500",
    };
  }

  const defaultAbout = `Welcome to ${shop.shop_name}. Explore services, timings and booking options.`;

  return (
    <div className={`min-h-screen ${styles.bg} font-sans pb-16`}>
      {/* Navigation Header */}
      <header className={`sticky top-0 z-50 border-b ${styles.navBg} px-4 py-3.5`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {!previewData && (
            <button 
              onClick={() => navigateTo("/customer")}
              className="flex items-center gap-1.5 text-xs font-bold hover:opacity-80 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <div className="flex items-center gap-1.5 font-bold text-sm tracking-tight">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{shop.shop_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase tracking-widest font-black px-2.5 py-1 border rounded-full ${styles.badge}`}>
              Verified Website
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Hero Banner Card */}
        <div className={`rounded-3xl overflow-hidden shadow-sm border ${styles.border} ${styles.cardBg}`}>
          {/* Banner Image */}
          <div className={`h-48 md:h-64 w-full relative ${styles.bannerFallback}`}>
            {shop.banner_url || shop.cover_image_url ? (
              <img 
                src={shop.banner_url || shop.cover_image_url} 
                alt={shop.shop_name} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center opacity-15">
                <Sparkles className="w-24 h-24 text-white" />
              </div>
            )}
            
            {/* Banner Overlay for Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            
            <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
              {/* Logo / Icon */}
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl overflow-hidden flex-shrink-0 border-2 border-white shadow-md flex items-center justify-center">
                {shop.logo_url ? (
                  <img src={shop.logo_url} alt="logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl md:text-2xl">
                    {shop.shop_name[0]}
                  </div>
                )}
              </div>

              <div className="text-white space-y-1">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg md:text-2xl font-black tracking-tight leading-none">
                    {shop.shop_name}
                  </h1>
                  <CheckCircle className="w-4 h-4 text-blue-400 fill-white flex-shrink-0" />
                </div>
                {shop.tagline && (
                  <p className="text-white/80 text-xs font-medium italic">
                    "{shop.tagline}"
                  </p>
                )}
                <p className="text-white/70 text-2xs md:text-xs">
                  {shop.category} • {shop.area}, {shop.city}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div className={`p-4 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-x ${styles.border}`}>
            <div className="space-y-1">
              <span className={`block text-[10px] font-bold uppercase tracking-wider ${styles.textMuted}`}>Rating</span>
              <div className="flex items-center justify-center gap-1 text-xs font-bold">
                <Star className={`w-4 h-4 fill-current ${styles.starColor}`} />
                <span>4.9 / 5</span>
              </div>
            </div>
            <div className="space-y-1 pl-2">
              <span className={`block text-[10px] font-bold uppercase tracking-wider ${styles.textMuted}`}>Timing</span>
              <span className="block text-xs font-bold">{shop.opening_time} - {shop.closing_time}</span>
            </div>
            <div className="space-y-1 pl-2">
              <span className={`block text-[10px] font-bold uppercase tracking-wider ${styles.textMuted}`}>Off Day</span>
              <span className="block text-xs font-bold text-rose-500">{shop.weekly_off_day || "None"}</span>
            </div>
            <div className="space-y-1 pl-2">
              <span className={`block text-[10px] font-bold uppercase tracking-wider ${styles.textMuted}`}>Contact</span>
              <span className="block text-xs font-bold">{shop.phone}</span>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className={`p-6 rounded-3xl shadow-sm border ${styles.border} ${styles.cardBg} space-y-3`}>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">About Our Salon</h3>
          <p className="text-sm leading-relaxed whitespace-pre-line font-light">
            {shop.description || defaultAbout}
          </p>
        </div>

        {/* Services Section */}
        <div id="services-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Our Services Menu</h3>
            <span className={`text-2xs px-3 py-1 rounded-full border ${styles.accentLight}`}>
              {services.length} active services
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.length === 0 ? (
              <div className={`p-8 text-center rounded-3xl border ${styles.border} ${styles.cardBg} col-span-2`}>
                <p className={`text-sm ${styles.textMuted}`}>No services registered under this website yet.</p>
              </div>
            ) : (
              services.map((srv: any) => (
                <div 
                  key={srv.id} 
                  className={`p-5 rounded-3xl shadow-sm border ${styles.border} ${styles.cardBg} flex flex-col justify-between space-y-4 hover:scale-[1.01] transition-all`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm tracking-tight">{srv.service_name}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold ${styles.badge}`}>
                        {srv.category}
                      </span>
                    </div>
                    {srv.description && (
                      <p className={`text-xs ${styles.textMuted} font-light`}>{srv.description}</p>
                    )}
                    <p className={`text-[10px] font-mono ${styles.textMuted}`}>
                      Duration: {srv.duration_minutes} mins
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-200/50">
                    <div className="space-y-0.5">
                      <span className={`block text-[10px] font-semibold uppercase ${styles.textMuted}`}>Price</span>
                      <span className="text-base font-black tracking-tight">₹{srv.price}</span>
                    </div>
                    
                    <button 
                      onClick={() => {
                        if (previewData) {
                          alert("This is a preview mode. Booking is disabled.");
                        } else {
                          navigateTo(`/booking/${shop.id}?serviceId=${srv.id}`);
                        }
                      }}
                      className={`px-4 py-2.5 text-xs font-bold transition-all shadow-sm ${styles.buttonRounded} ${styles.accentBg} cursor-pointer flex items-center gap-1.5`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Book Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Gallery Section */}
        {shop.gallery_urls && Array.isArray(shop.gallery_urls) && shop.gallery_urls.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Salon Gallery</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {shop.gallery_urls.map((url: string, idx: number) => (
                <div key={idx} className={`aspect-video md:aspect-square rounded-2xl overflow-hidden border ${styles.border} ${styles.cardBg}`}>
                  <img src={url} alt={`gallery-${idx}`} referrerPolicy="no-referrer" className="w-full h-full object-cover hover:scale-105 transition duration-350" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Section - Pay with Nexora SalonOS QR */}
        {qrSettings && (
          <div className={`p-6 rounded-3xl shadow-sm border ${styles.border} ${styles.cardBg} space-y-4`}>
            <div className="flex items-center gap-2">
              <QrCode className={`w-5 h-5 ${styles.accentText}`} />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Pay with Nexora SalonOS QR</h3>
            </div>
            
            <div className={`flex flex-col md:flex-row gap-6 items-center p-4 rounded-2xl border ${styles.border} bg-slate-50/10`}>
              {qrSettings.qr_image_url ? (
                <div className="w-36 h-36 bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img 
                    src={qrSettings.qr_image_url} 
                    alt="Nexora Company QR" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-36 h-36 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center p-4 flex-shrink-0">
                  <QrCode className="w-8 h-8 text-slate-400 mb-1" />
                  <span className="text-[10px] text-slate-400 font-bold">QR Loading</span>
                </div>
              )}
              
              <div className="space-y-2 flex-1 text-center md:text-left">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${styles.badge}`}>
                  Verified Platform Payment
                </span>
                <p className={`text-xs ${styles.textMuted} leading-relaxed`}>
                  Pay securely at the shop using Nexora SalonOS company QR.
                </p>
                <div className={`space-y-1 font-mono text-3xs ${styles.textMuted}`}>
                  {qrSettings.payee_name && <p>Payee: <span className="font-bold">{qrSettings.payee_name}</span></p>}
                  {qrSettings.upi_id && <p>UPI ID: <span className="font-bold">{qrSettings.upi_id}</span></p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact and Timings Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Working Schedule */}
          <div className={`p-6 rounded-3xl shadow-sm border ${styles.border} ${styles.cardBg} space-y-4`}>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-500" />
              Operating Hours
            </h4>
            <div className="space-y-2.5 text-xs font-medium">
              <div className="flex justify-between pb-1.5 border-b border-dashed border-slate-200/50">
                <span>Opening Time</span>
                <span className="font-bold">{shop.opening_time}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-dashed border-slate-200/50">
                <span>Closing Time</span>
                <span className="font-bold">{shop.closing_time}</span>
              </div>
              <div className="flex justify-between text-rose-500">
                <span>Weekly Off</span>
                <span className="font-bold">{shop.weekly_off_day || "None"}</span>
              </div>
            </div>
          </div>

          {/* Contact details */}
          <div className={`p-6 rounded-3xl shadow-sm border ${styles.border} ${styles.cardBg} space-y-4`}>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-blue-500" />
              Contact Information
            </h4>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="font-light">{shop.address}, {shop.area}, {shop.city}</span>
              </div>
              
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="font-bold">{shop.phone}</span>
              </div>

              {shop.whatsapp_number && (
                <div className="pt-2">
                  <a 
                    href={`https://wa.me/${shop.whatsapp_number.replace(/[^0-9]/g, "")}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat on WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center pt-12 pb-6 space-y-4">
          <p className="text-3xs font-bold uppercase tracking-widest text-slate-400">
            Powered by Nexora SalonOS
          </p>
          
          <div className="inline-flex flex-col items-center gap-2 p-6 rounded-3xl bg-slate-100 border border-slate-200/50 max-w-sm w-full">
            <span className="text-xs font-bold text-slate-900">Are you a Salon Owner?</span>
            <p className="text-slate-500 text-[11px] leading-relaxed font-light">
              Create your own premium, white-label website & instant online booking portal for free with Nexora.
            </p>
            <button 
              onClick={() => navigateTo("/owner-register")}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Create your free salon website
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}
