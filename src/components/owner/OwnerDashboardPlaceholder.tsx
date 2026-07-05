import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { 
  LayoutDashboard, 
  Globe, 
  AlertCircle, 
  ArrowLeft, 
  Image as ImageIcon, 
  CheckCircle, 
  ExternalLink, 
  Sparkles, 
  Settings,
  ShieldAlert,
  ChevronRight,
  BookOpen,
  Calendar,
  Star,
  QrCode,
  Info,
  Briefcase
} from "lucide-react";
import JobsManagement from "./JobsManagement";

import AppOnboardingChecklist from "../apps/AppOnboardingChecklist";

interface Props {
  navigateTo: (path: string) => void;
}

export default function OwnerDashboardPlaceholder({ navigateTo }: Props) {
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [servicesCount, setServicesCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "services" | "reviews" | "website" | "wallet_payouts" | "jobs">("overview");

  // State for all 7 tabs
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingServices, setBookingServices] = useState<Record<string, any[]>>({});
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [qrSettings, setQrSettings] = useState<any>(null);
  const [paymentRecords, setPaymentRecords] = useState<any[]>([]);
  const [ledgerRecords, setLedgerRecords] = useState<any[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(false);

  useEffect(() => {
    async function fetchOwnerShopAndData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: shopData } = await supabase
          .from("shops")
          .select("*")
          .eq("owner_id", user.id)
          .maybeSingle();

        if (shopData) {
          setShop(shopData);
          
          // Fetch services count
          const { count } = await supabase
            .from("shop_services")
            .select("*", { count: "exact", head: true })
            .eq("shop_id", shopData.id)
            .eq("is_active", true);

          setServicesCount(count || 0);

          // Fetch extra dashboard data
          setLoadingExtra(true);
          
          // 1. Fetch Bookings
          try {
            const { data: bookingsData } = await supabase
              .from("customer_bookings")
              .select(`
                *,
                profiles (id, full_name, email, mobile_number),
                shop_staff (staff_name)
              `)
              .eq("shop_id", shopData.id)
              .order("booking_date", { ascending: false });

            if (bookingsData && bookingsData.length > 0) {
              setBookings(bookingsData);
              
              // Fetch services for these bookings
              const bookingIds = bookingsData.map(b => b.id);
              const { data: bServices } = await supabase
                .from("customer_booking_services")
                .select("*")
                .in("booking_id", bookingIds);

              if (bServices) {
                const mapping: Record<string, any[]> = {};
                bServices.forEach(item => {
                  if (!mapping[item.booking_id]) {
                    mapping[item.booking_id] = [];
                  }
                  mapping[item.booking_id].push(item);
                });
                setBookingServices(mapping);
              }
            }
          } catch (err) {
            console.error("Error loading bookings for dashboard:", err);
          }

          // 2. Fetch Services
          try {
            const { data: servicesData } = await supabase
              .from("shop_services")
              .select("*")
              .eq("shop_id", shopData.id)
              .order("service_name", { ascending: true });
            if (servicesData) setServices(servicesData);
          } catch (err) {
            console.error("Error loading services for dashboard:", err);
          }

          // 3. Fetch Reviews
          try {
            const { data: reviewsData } = await supabase
              .from("customer_reviews")
              .select(`
                *,
                profiles (full_name, email)
              `)
              .eq("shop_id", shopData.id)
              .order("created_at", { ascending: false });
            if (reviewsData) setReviews(reviewsData);
          } catch (err) {
            console.error("Error loading reviews for dashboard:", err);
          }

          // 4. Fetch Platform QR Settings
          try {
            const { data: qrData } = await supabase
              .from("platform_qr_settings")
              .select("*")
              .eq("is_active", true)
              .maybeSingle();
            if (qrData) setQrSettings(qrData);
          } catch (err) {
            console.error("Error loading platform QR:", err);
          }

          // 5. Fetch Wallet
          let walletId = null;
          try {
            const { data: walletData } = await supabase
              .from("owner_wallets")
              .select("*")
              .eq("owner_id", user.id)
              .eq("shop_id", shopData.id)
              .maybeSingle();
            if (walletData) {
              setWallet(walletData);
              walletId = walletData.id;
            }
          } catch (err) {
            console.error("Error loading wallet:", err);
          }

          // 6. Fetch Razorpay Payment Records
          try {
            const { data: paymentsData } = await supabase
              .from("razorpay_payments")
              .select("*")
              .eq("owner_id", user.id)
              .eq("shop_id", shopData.id)
              .order("created_at", { ascending: false });
            if (paymentsData) setPaymentRecords(paymentsData);
          } catch (err) {
            console.error("Error loading Razorpay payments:", err);
          }

          // 7. Fetch Wallet Ledger
          try {
            let ledgerQuery = supabase.from("owner_wallet_ledger").select("*");
            if (walletId) {
              ledgerQuery = ledgerQuery.eq("wallet_id", walletId);
            } else {
              ledgerQuery = ledgerQuery.eq("owner_id", user.id);
            }
            const { data: ledgerData } = await ledgerQuery.order("created_at", { ascending: false });
            if (ledgerData) setLedgerRecords(ledgerData);
          } catch (err) {
            console.error("Error loading ledger:", err);
          }
        }
      } catch (err) {
        console.error("Error fetching owner shop:", err);
      } finally {
        setLoading(false);
        setLoadingExtra(false);
      }
    }

    fetchOwnerShopAndData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <p className="text-sm text-slate-500 font-medium">Loading Owner Dashboard...</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
            <Globe className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-900">No Registered Salon Found</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Please register your salon details first to generate and customize your free booking website.
            </p>
          </div>
          <button 
            onClick={() => navigateTo("/owner-register")}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl text-sm shadow-lg transition cursor-pointer"
          >
            Register Your Business
          </button>
        </div>
      </div>
    );
  }

  const galleryCount = shop.gallery_urls && Array.isArray(shop.gallery_urls) ? shop.gallery_urls.length : 0;
  const isApproved = shop.approval_status === "approved" && shop.is_active === true;

  // Real Wallet Calculations
  const walletTotalEarned = wallet?.total_earned ?? wallet?.total_earnings ?? 0;
  const walletAvailable = wallet?.available_balance ?? wallet?.balance ?? 0;
  const walletPending = wallet?.pending_balance ?? 0;
  const walletPaidOut = wallet?.total_paid_out ?? wallet?.total_payouts ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigateTo("/")}
            className="p-2 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <span className="text-3xs font-black text-slate-400 uppercase tracking-widest block">Nexora SalonOS</span>
            <h1 className="text-base font-black text-slate-900">Owner Console</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo("/owner-create-website")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-500/10"
          >
            <Settings className="w-3.5 h-3.5" />
            Launch Website Builder
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        
        <AppOnboardingChecklist appKey="owner_app" />
        
        {/* Salon Header card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col md:flex-row gap-6 items-center justify-between shadow-xs">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="w-16 h-16 rounded-2xl border border-slate-200 overflow-hidden flex-shrink-0 bg-slate-50 flex items-center justify-center">
              {shop.logo_url ? (
                <img src={shop.logo_url} alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl">
                  {shop.shop_name[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h2 className="text-lg font-black text-slate-900 leading-none">{shop.shop_name}</h2>
                {isApproved ? (
                  <CheckCircle className="w-4 h-4 text-blue-500 fill-white flex-shrink-0" />
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full">
                    Under Review
                  </span>
                )}
              </div>
              <p className="text-3xs text-slate-400 font-medium">Slug Domain: /shop/{shop.slug}</p>
            </div>
          </div>

          <div className="text-center md:text-right">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Approval Status</span>
            <span className={`text-xs font-bold ${isApproved ? "text-emerald-600" : "text-amber-600"}`}>
              {shop.approval_status === "approved" ? "Approved & Live" : "Pending Approval"}
            </span>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 mt-8 gap-x-6 gap-y-2">
          {[
            { id: "overview", label: "Overview" },
            { id: "bookings", label: `Bookings (${bookings.length})` },
            { id: "services", label: `Services (${services.length})` },
            { id: "reviews", label: `Reviews (${reviews.length})` },
            { id: "website", label: `Website & Media (${galleryCount + (shop.logo_url ? 1 : 0) + (shop.banner_url || shop.cover_image_url ? 1 : 0)})` },
            { id: "wallet_payouts", label: "Wallet & Payouts" },
            { id: "jobs", label: "Jobs & Hiring" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs font-black uppercase tracking-wider transition relative cursor-pointer ${
                activeTab === tab.id 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-slate-400 hover:text-slate-600 font-semibold"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Panel Content */}
        <div className="mt-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* ... Overview content ... */}
              {/* Info Notification Banner */}
              {!isApproved && (
                <div className="p-4 rounded-3xl bg-amber-50/50 border border-amber-100/60 flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-amber-900">Your Salon is Pending Approval</span>
                    <p className="text-amber-800 font-light">
                      The admin team is currently validating your business documents. You can still customize your template designs, upload your logos, and prepare your service catalog right away!
                    </p>
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Services Card */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between shadow-2xs">
                  <div className="space-y-1">
                    <span className="text-3xs font-black text-slate-400 uppercase tracking-wider block">Service Catalog</span>
                    <h3 className="text-2xl font-black text-slate-900">{services.length || servicesCount}</h3>
                    <p className="text-4xs text-slate-400">active services menu</p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>

                {/* Bookings Card */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between shadow-2xs">
                  <div className="space-y-1">
                    <span className="text-3xs font-black text-slate-400 uppercase tracking-wider block">Total Bookings</span>
                    <h3 className="text-2xl font-black text-slate-900">{bookings.length}</h3>
                    <p className="text-4xs text-slate-400">customer bookings registered</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                {/* Templates Design Card */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between shadow-2xs">
                  <div className="space-y-1">
                    <span className="text-3xs font-black text-slate-400 uppercase tracking-wider block">Website Template</span>
                    <h3 className="text-sm font-black text-slate-900 mt-2 truncate max-w-[150px]">
                      {shop.selected_template === "royal_luxe" ? "Royal Luxe" : shop.selected_template === "professional_beauty" ? "Professional Beauty" : "Modern Salon"}
                    </h3>
                    <p className="text-4xs text-slate-400">custom design style</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>

              </div>

              {/* Quick Actions List */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Next Steps</h3>
                
                <div className="divide-y divide-slate-100">
                  <button 
                    onClick={() => navigateTo("/owner-create-website")}
                    className="w-full py-4 flex items-center justify-between text-left hover:bg-slate-50/50 px-2 rounded-xl transition cursor-pointer"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Customize Website & Design</h4>
                      <p className="text-3xs text-slate-400 mt-0.5">Edit slogans, templates, descriptions, and branding details.</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button 
                    onClick={() => navigateTo("/owner-create-website")}
                    className="w-full py-4 flex items-center justify-between text-left hover:bg-slate-50/50 px-2 rounded-xl transition cursor-pointer"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Manage Media Uploads</h4>
                      <p className="text-3xs text-slate-400 mt-0.5">Upload, replace, and delete logo images, hero banners, and portfolio gallery items.</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {activeTab === "bookings" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Salon Bookings</h3>
                    <p className="text-3xs text-slate-400 mt-0.5">Manage and track your incoming salon reservations</p>
                  </div>
                </div>

                {bookings.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-medium">
                    No bookings found for your salon.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((b) => {
                      const bServs = bookingServices[b.id] || [];
                      return (
                        <div key={b.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-black text-slate-900">
                                {b.profiles?.full_name || "Guest Customer"}
                              </h4>
                              <p className="text-3xs text-slate-400">{b.profiles?.email} • {b.profiles?.mobile_number}</p>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              b.status === "confirmed" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                              b.status === "pending" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                              b.status === "completed" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                              "bg-rose-50 text-rose-700 border border-rose-100"
                            }`}>
                              {b.status}
                            </span>
                          </div>

                          <div className="border-t border-dashed border-slate-200 pt-3 flex flex-wrap justify-between items-center text-3xs text-slate-500 gap-2">
                            <div>
                              <span className="font-bold">Services:</span>{" "}
                              {bServs.length > 0 
                                ? bServs.map(s => s.service_name).join(", ") 
                                : b.service_name || "Standard Styling"}
                            </div>
                            <div>
                              <span className="font-bold">Slot:</span> {new Date(b.booking_date).toLocaleDateString()} at {b.booking_time}
                            </div>
                            <div className="font-black text-slate-900 text-xs">
                              ₹{b.total_amount}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "services" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Service Catalog</h3>
                    <p className="text-3xs text-slate-400 mt-0.5">Standard treatment menu and pricing models</p>
                  </div>
                </div>

                {services.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-medium">
                    No services configured. Update your website details to customize.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((s) => (
                      <div key={s.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-slate-900">{s.service_name}</h4>
                          <p className="text-3xs text-slate-400">{s.duration_minutes} minutes • {s.category || "General"}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-blue-600 block">₹{s.price}</span>
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                            s.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"
                          }`}>
                            {s.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Customer Reviews</h3>
                    <p className="text-3xs text-slate-400 mt-0.5">Read feedback submitted by verified clients</p>
                  </div>
                </div>

                {reviews.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-medium">
                    No customer reviews received yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-slate-900">
                            {r.profiles?.full_name || "Verified Customer"}
                          </h4>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} 
                              />
                            ))}
                          </div>
                        </div>
                        {r.review_text && (
                          <p className="text-3xs text-slate-600 italic leading-relaxed">
                            "{r.review_text}"
                          </p>
                        )}
                        <span className="text-[9px] text-slate-400 block font-mono">
                          Date: {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "website" && (
            <div className="space-y-6">
              
              {/* Media assets list */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-6 shadow-2xs">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Branding Assets Status</h3>
                  <p className="text-3xs text-slate-400 mt-0.5">Monitor files uploaded to your Supabase `shop-media` bucket.</p>
                </div>

                <div className="space-y-4">
                  {/* Logo status item */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
                        {shop.logo_url ? (
                          <img src={shop.logo_url} alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Salon Logo</h4>
                        <p className="text-3xs text-slate-400 mt-0.5">Shows up as circular profile asset in header</p>
                      </div>
                    </div>
                    <div>
                      {shop.logo_url ? (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
                          Uploaded
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-full">
                          Missing
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Banner status item */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
                        {shop.banner_url || shop.cover_image_url ? (
                          <img src={shop.banner_url || shop.cover_image_url} alt="Banner" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Hero Banner Background</h4>
                        <p className="text-3xs text-slate-400 mt-0.5">Displays as website top section artwork</p>
                      </div>
                    </div>
                    <div>
                      {shop.banner_url || shop.cover_image_url ? (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
                          Uploaded
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-full">
                          Missing
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Gallery status item */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center flex-shrink-0 font-mono text-xs font-black text-slate-500">
                        {galleryCount}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Portfolio Gallery</h4>
                        <p className="text-3xs text-slate-400 mt-0.5">Showcase grid layout of images on website</p>
                      </div>
                    </div>
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        galleryCount > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}>
                        {galleryCount} / 10 Images
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => navigateTo("/owner-create-website")}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-500/10"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Edit Website & Media Assets
                  </button>
                </div>
              </div>

            </div>
          )}

          {activeTab === "wallet_payouts" && (
            <div className="space-y-6">
              
              {/* Wallet Summary */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-6">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Wallet Balance Summary</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Total Earned</span>
                    <span className="text-lg font-black text-slate-900">₹{walletTotalEarned}</span>
                  </div>

                  <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100/60">
                    <span className="text-[9px] text-blue-500 font-bold uppercase block">Available Balance</span>
                    <span className="text-lg font-black text-blue-700">₹{walletAvailable}</span>
                  </div>

                  <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100/60">
                    <span className="text-[9px] text-amber-600 font-bold uppercase block">Pending Balance</span>
                    <span className="text-lg font-black text-amber-700">₹{walletPending}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Paid Out</span>
                    <span className="text-lg font-black text-slate-900">₹{walletPaidOut}</span>
                  </div>
                </div>
              </div>

              {/* Payout Account Form */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Payout Account Settings</h3>
                <p className="text-4xs text-slate-400">Add your Bank account or UPI ID for automated daily 10 PM payouts.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Account Holder Name" className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs" />
                  <input type="text" placeholder="Account Number" className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs" />
                  <input type="text" placeholder="IFSC" className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs" />
                  <input type="text" placeholder="UPI ID" className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs" />
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl cursor-pointer">Save Account</button>
              </div>

              {/* Settlement History */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Settlement History</h3>
                 <p className="text-xs text-slate-400">No payout settlements yet.</p>
              </div>

              {/* Razorpay Payments History */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Razorpay Payment History</h3>
                {paymentRecords.length === 0 ? (
                  <p className="text-xs text-slate-400">No payment history yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-3xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                          <th className="py-2.5 font-bold">Date</th>
                          <th className="py-2.5 font-bold">Gross</th>
                          <th className="py-2.5 font-bold">Nexora 10%</th>
                          <th className="py-2.5 font-bold">Owner 90%</th>
                          <th className="py-2.5 font-bold">Method</th>
                          <th className="py-2.5 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {paymentRecords.map(r => (
                          <tr key={r.id}>
                            <td className="py-3">{new Date(r.created_at).toLocaleDateString()}</td>
                            <td className="py-3">₹{r.amount}</td>
                            <td className="py-3 text-amber-600">₹{(r.amount * 0.1).toFixed(2)}</td>
                            <td className="py-3 text-emerald-600 font-bold">₹{(r.amount * 0.9).toFixed(2)}</td>
                            <td className="py-3 capitalize">{r.method}</td>
                            <td className="py-3 font-bold uppercase">{r.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Wallet Ledger */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Wallet Ledger</h3>
                {ledgerRecords.length === 0 ? (
                  <p className="text-xs text-slate-400">No ledger records yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-3xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                          <th className="py-2.5 font-bold">Date</th>
                          <th className="py-2.5 font-bold">Type</th>
                          <th className="py-2.5 font-bold">Source</th>
                          <th className="py-2.5 font-bold">Amount</th>
                          <th className="py-2.5 font-bold">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {ledgerRecords.map(l => (
                          <tr key={l.id}>
                            <td className="py-3">{new Date(l.created_at).toLocaleDateString()}</td>
                            <td className={`py-3 font-bold uppercase ${l.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>{l.type}</td>
                            <td className="py-3 capitalize">{l.source}</td>
                            <td className={`py-3 font-bold ${l.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>{l.type === 'credit' ? '+' : '-'}₹{l.amount}</td>
                            <td className="py-3 font-bold">₹{l.balance_after}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "jobs" && (
            <JobsManagement />
          )}
          </div>
        </div>
      </div>
  );
}
