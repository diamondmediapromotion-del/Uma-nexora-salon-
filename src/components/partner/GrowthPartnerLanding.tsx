import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  Award, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  FileText,
  MapPin,
  Calendar,
  Lock
} from "lucide-react";

interface GrowthPartnerLandingProps {
  navigateTo: (path: string) => void;
}

export default function GrowthPartnerLanding({ navigateTo }: GrowthPartnerLandingProps) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  
  // Form State
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [currentWorkType, setCurrentWorkType] = useState("Cosmetics Sales");
  const [experience, setExperience] = useState("");
  const [expectedShops, setExpectedShops] = useState("10");
  const [hasSmartphone, setHasSmartphone] = useState(true);
  const [hasTravelAccess, setHasTravelAccess] = useState(true);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkApplicationStatus(session.user.id);
        setFullName(session.user.user_metadata?.full_name || "");
        setMobile(session.user.user_metadata?.mobile_number || "");
        setEmail(session.user.email || "");
        setCity(session.user.user_metadata?.city || "");
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkApplicationStatus(session.user.id);
      } else {
        setHasApplied(false);
        setExistingApplication(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkApplicationStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("partner_applications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setExistingApplication(data[0]);
        setHasApplied(true);
      }
    } catch (err) {
      console.error("Error checking application status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setSubmitError("Please login first to submit your partner application.");
      return;
    }
    
    if (!fullName || !mobile || !email || !city || !district || !state || !experience) {
      setSubmitError("Kripya sabhi fields sahi tarike se bharein.");
      return;
    }

    if (!ageConfirmed) {
      setSubmitError("Aapko age requirements confirm karni hogi (Minimum 18 saal).");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { error } = await supabase
        .from("partner_applications")
        .insert({
          user_id: session.user.id,
          full_name: fullName,
          mobile: mobile,
          email: email,
          city: city,
          district: district,
          state: state,
          current_work_type: currentWorkType,
          beauty_industry_experience: experience,
          expected_shop_network: parseInt(expectedShops) || 10,
          has_smartphone: hasSmartphone,
          has_travel_access: hasTravelAccess,
          age_confirmed: ageConfirmed,
          status: "pending"
        });

      if (error) throw error;

      setSubmitSuccess(true);
      setHasApplied(true);
      checkApplicationStatus(session.user.id);
    } catch (err: any) {
      console.error("Submission error:", err);
      setSubmitError(err.message || "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="growth_partner_landing" className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo("/")}>
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20">N</div>
            <span className="text-xl font-black tracking-tight text-slate-900">Nexora <span className="text-blue-600">Partner</span></span>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <button 
                onClick={() => navigateTo("/partner-dashboard")}
                className="px-4 py-2 text-xs font-black bg-slate-950 text-white rounded-xl hover:bg-slate-900 transition shadow-sm cursor-pointer"
              >
                Go to Partner Dashboard
              </button>
            ) : (
              <button 
                onClick={() => navigateTo("/login")}
                className="px-4 py-2 text-xs font-bold text-blue-600 border border-blue-100 bg-blue-50/50 rounded-xl hover:bg-blue-50 transition cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-2xs font-black tracking-wider uppercase">
            🚀 JOIN THE NEXT-GEN BEAUTY NETWORK
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Salary nahi, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Growth Share.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            Aap beauty and cosmetics network ko jaante ho. Ab us network ko digital regular revenue stream me badlo. No fixed salaries, pure business growth distribution.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <a 
              href="#apply-form" 
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-xl transition flex items-center gap-2 cursor-pointer"
            >
              Apply to Program <ChevronRight className="w-5 h-5" />
            </a>
            <button 
              onClick={() => navigateTo("/")}
              className="px-8 py-4 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition cursor-pointer"
            >
              Learn More About Nexora
            </button>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* Program Details Bento Grid */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Why Nexora Growth Partner Program?</h2>
          <p className="text-sm text-slate-500 font-medium max-w-lg mx-auto">Specifically built for local sales representatives, cosmetic distribution staffs, and beauty network builders.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Recurring Commissions</h3>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">
              Earn continuously from every booking made at your onboarded salons. You don't just sell once—you build a permanent income stream.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Tiered Partner Scale</h3>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">
              Get 10% of Nexora commission for Month 1-6, 5% for Month 7-12, and 2% lifetime recurring afterwards as long as salon remains active.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Zero Investment</h3>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">
              No deposit, no registration fee, no MLM, no franchise cost. Use your local beauty connections to help salons digitize and get paid.
            </p>
          </div>
        </div>
      </section>

      {/* Partner Workflow Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto border-t border-slate-100/80">
        <div className="text-center space-y-2 mb-12">
          <span className="text-blue-600 text-2xs font-black tracking-wider uppercase">Onboarding Journey</span>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Nexora Growth Partner Workflow</h2>
          <p className="text-sm text-slate-500 font-medium max-w-lg mx-auto">Step-by-step guidance on how you will grow your digital network.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            { step: "01", title: "Apply & Verify", desc: "Submit your application detailing beauty network experience. Get verified and approved by super admin." },
            { step: "02", title: "Learn & Certify", desc: "Access the training academy to complete 5 interactive modules on pitch scripts, ethics, and product rules." },
            { step: "03", title: "Log Salon Leads", desc: "Input salon owners and track their onboarding journey live in your visual lead pipeline." },
            { step: "04", title: "Onboard & Set Up", desc: "Meet salon owners, explain payment split rules clearly (10% Nexora commission, 90% owner earning, no owner QR), and activate their profiles." },
            { step: "05", title: "Support & Earn", desc: "Help onboarded salons manage bookings and build continuous recurring commissions from each customer checkout." }
          ].map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-3xl border border-slate-100/80 shadow-3xs space-y-3 relative hover:scale-105 transition-all duration-300">
              <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-xl">{item.step}</span>
              <h4 className="font-black text-slate-900 text-sm pt-2">{item.title}</h4>
              <p className="text-slate-500 text-3xs font-semibold leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What You Will Track Section */}
      <section className="py-16 bg-slate-50 border-y border-slate-200/40 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-2 mb-12">
            <span className="text-indigo-600 text-2xs font-black tracking-wider uppercase">Partner Tools</span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">What You Will Track in Your Dashboard</h2>
            <p className="text-sm text-slate-500 font-medium max-w-lg mx-auto">Full control and transparent ledger visibility across your active network.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Dynamic Lead Pipeline", desc: "A full-fledged visual pipeline to add leads, schedule demos, track statuses, and view expected salon bookings easily." },
              { title: "GPS Visit Logs", desc: "Log physical salon visits with automated GPS location data, outcomes, next action items, and clear follow-up targets." },
              { title: "Onboarding Checklists", desc: "Step-by-step verified checklists for each salon, ensuring they complete requirements like Razorpay payment setup and understand Nexora commission splits." },
              { title: "My Registered Shops", desc: "A detailed catalog of all your on-boarded, active salon shops with their monthly transaction and traffic volumes." },
              { title: "Real-time Wallet Ledger", desc: "A transparent transaction-by-transaction commission ledger showing the Month 1-6 (10%), Month 7-12 (5%), and Month 13+ (2%) earnings." },
              { title: "Weekly Payout Audits", desc: "Track every weekly manual payout process directly. Get complete bank and UPI transfer reference logs securely." }
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-2 flex items-start gap-4">
                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 shrink-0 font-black text-2xs">✓</div>
                <div>
                  <h4 className="font-black text-slate-900 text-xs">{item.title}</h4>
                  <p className="text-slate-500 text-3xs font-medium leading-relaxed mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Profiles */}
      <section className="py-12 bg-slate-900 text-white px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-blue-400 text-2xs font-black tracking-wider uppercase">PERFECTLY SUITED FOR</span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Kiske Liye Hai Ye Program?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: "Beauty Product Reps", desc: "Beauty products, shampoos, salon items supply karne wale rep jo salons me regular jaate hain." },
              { title: "Cosmetics Executives", desc: "Cosmetics brands ke local sales officers aur field agents jinka local salons me bada trust hai." },
              { title: "Distributor Staff", desc: "Cosmetic distribution houses ke delivery and sales personnel jo salons ke dhandhe ko bariki se samajhte hain." },
              { title: "Network Builders", desc: "Aise ambitious log jinhe local beauty/cosmetic industry me network banane ka shauk hai." }
            ].map((p, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-800 p-6 rounded-2xl space-y-3">
                <span className="text-blue-500 text-xs font-black">0{i+1}.</span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{p.title}</h3>
                <p className="text-slate-400 text-2xs font-medium leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application / Status Form Section */}
      <section id="apply-form" className="py-20 px-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden grid grid-cols-1">
          {loading ? (
            <div className="p-16 text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
              <p className="text-xs text-slate-500 font-medium">Checking your application status...</p>
            </div>
          ) : hasApplied ? (
            <div className="p-10 md:p-16 text-center space-y-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto border border-blue-100">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Aapki Application Received Ho Gayi Hai!</h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto font-medium">
                  Aapka application state abhi <span className="font-bold text-blue-600 uppercase tracking-wider">{existingApplication?.status || "Pending"}</span> hai. Hamari team iska evaluation kar rahi hai.
                </p>
              </div>

              {existingApplication?.status === "approved" ? (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-left space-y-3 max-w-md mx-auto">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Application Approved!</span>
                  </div>
                  <p className="text-slate-600 text-2xs leading-relaxed font-medium">
                    Congratulations! Aapka Growth Partner Profile active hai. Click karke dashboard access kijiye aur salon onboarding shuru kijiye.
                  </p>
                  <button 
                    onClick={() => navigateTo("/partner-dashboard")}
                    className="w-full py-3 bg-slate-950 text-white text-2xs font-black uppercase tracking-wider rounded-xl hover:bg-slate-900 transition mt-2 cursor-pointer"
                  >
                    Go to Partner Dashboard
                  </button>
                </div>
              ) : existingApplication?.status === "rejected" ? (
                <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 text-left space-y-3 max-w-md mx-auto">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Application Rejected</span>
                  </div>
                  <p className="text-slate-600 text-2xs leading-relaxed font-medium">
                    Reason: {existingApplication?.rejection_reason || "Does not meet eligibility criteria currently."}
                  </p>
                  {existingApplication?.admin_note && (
                    <p className="text-slate-500 text-3xs font-mono">
                      Note: {existingApplication?.admin_note}
                    </p>
                  )}
                  <p className="text-slate-600 text-2xs font-medium">Please contact partner support for more details or apply again with stronger reference points.</p>
                </div>
              ) : (
                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-left space-y-2 max-w-md mx-auto">
                  <span className="text-[10px] uppercase font-black tracking-wider text-blue-600 block">Next Steps</span>
                  <p className="text-slate-600 text-2xs leading-relaxed font-medium">
                    Hamare executive aapko onboarding call karenge. Kripya apna mobile aur email active rakhein.
                  </p>
                </div>
              )}
            </div>
          ) : !session ? (
            <div className="p-10 md:p-16 text-center space-y-6">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto border border-amber-100">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">Account Registration Required</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto font-medium">
                  Growth Partner apply karne ke liye aapko Nexora user account banana hoga, jisse aap badme apna partner payout aur profile tracking dashboard access kar sakein.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button 
                  onClick={() => navigateTo("/login")}
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition cursor-pointer"
                >
                  Log In to Apply
                </button>
                <button 
                  onClick={() => navigateTo("/sign-up")}
                  className="px-6 py-3 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                >
                  Create New Account
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 md:p-12 space-y-8">
              <div className="border-b border-slate-100 pb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Growth Partner Registration Form</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Niche di gayi jankari ko sahi tarike se bharein taaki verification fast ho sake.</p>
              </div>

              {submitSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>Aapka application safaltapurvak submit ho gaya hai!</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {submitError && (
                    <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-100 text-2xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Personal Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Pura Naam (Full Name)</label>
                      <input 
                        type="text" 
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="E.g., Rajesh Kumar" 
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">WhatsApp Mobile Number</label>
                      <input 
                        type="tel" 
                        required
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="E.g., 9876543210" 
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rajesh@gmail.com" 
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">City / Town</label>
                      <input 
                        type="text" 
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="E.g., Patna" 
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">District</label>
                        <input 
                          type="text" 
                          required
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder="Patna" 
                          className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">State</label>
                        <input 
                          type="text" 
                          required
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="Bihar" 
                          className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Experience & Work */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Current Work Profile</label>
                      <select 
                        value={currentWorkType}
                        onChange={(e) => setCurrentWorkType(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                      >
                        <option value="Cosmetics Sales">Cosmetics Brand Sales Representative</option>
                        <option value="Salon Product Distributor">Salon Products / Furniture Distributor</option>
                        <option value="Distributor Delivery Staff">Distribution / Delivery Executive</option>
                        <option value="Local Business Representative">Local Beauty Industry Influencer / Rep</option>
                        <option value="Other Field Executive">Other General Field Sales Professional</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Estimated Salon Network (Shops count)</label>
                      <select 
                        value={expectedShops}
                        onChange={(e) => setExpectedShops(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                      >
                        <option value="5">5 - 15 Salons</option>
                        <option value="25">15 - 50 Salons</option>
                        <option value="75">50 - 150 Salons</option>
                        <option value="200">150+ Salons (Strong Network)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Beauty & Cosmetics Industry Experience</label>
                    <textarea 
                      required
                      rows={3}
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="Explain your connection with local salons. Aap kitne saalo se beauty industry me sales, product distribution ya network building ka kaam kar rahe hain?"
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition resize-none"
                    />
                  </div>

                  {/* Requirements Checkboxes */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Requirements Confirmation</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={hasSmartphone}
                          onChange={(e) => setHasSmartphone(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-slate-200 rounded-sm focus:ring-blue-500 mt-0.5"
                        />
                        <div className="text-2xs">
                          <span className="font-bold text-slate-700 block">Smartphone and Active Internet</span>
                          <span className="text-slate-400">Salons onboard karne ke liye smartphone hona anivarya hai.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={hasTravelAccess}
                          onChange={(e) => setHasTravelAccess(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-slate-200 rounded-sm focus:ring-blue-500 mt-0.5"
                        />
                        <div className="text-2xs">
                          <span className="font-bold text-slate-700 block">Travel / Vehicle Access</span>
                          <span className="text-slate-400">Mera local salons me physically travel karne ka sadhan/access hai.</span>
                        </div>
                      </label>
                    </div>

                    <div className="border-t border-slate-200/50 pt-3 mt-1">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input 
                          type="checkbox"
                          required
                          checked={ageConfirmed}
                          onChange={(e) => setAgeConfirmed(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-slate-200 rounded-sm focus:ring-blue-500 mt-0.5"
                        />
                        <div className="text-2xs font-bold text-slate-800 leading-relaxed">
                          Main 18 saal ya usse zyada age ka hu aur ye declare karta hu ki sabhi details sahi hain. I agree to Nexora's <a href="/terms-and-conditions" target="_blank" className="text-blue-600 hover:underline">Terms & Conditions</a>, <a href="/privacy-policy" target="_blank" className="text-blue-600 hover:underline">Privacy Policy</a>, and <a href="/growth-partner-policy" target="_blank" className="text-blue-600 hover:underline">Growth Partner Policy</a>.
                        </div>
                      </label>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition flex items-center justify-center gap-2 cursor-pointer disabled:bg-blue-300 disabled:shadow-none"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Submitting details...</span>
                      </>
                    ) : (
                      <span>Submit Growth Partner Application</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Program Disclaimers & Rules */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-2xs leading-relaxed font-medium">
          <div className="space-y-4">
            <span className="text-white font-bold tracking-wider uppercase text-[10px]">NEXORA PARTNER POLICIES & CODE</span>
            <p>
              Nexora Growth Partner Program is a referral and local relationship program built to digitize and expand local salon networks. Growth Partners are independent contractors and network builders. There is no employee-employer relationship, salary guarantees, or franchising MLM multi-level marketing setups.
            </p>
            <p>
              Partner payouts are distributed securely based on REAL active transactions happening in verified physical shops on-boarded by the partner.
            </p>
          </div>
          <div className="space-y-4 text-right md:text-right">
            <span className="text-white font-bold tracking-wider uppercase text-[10px] block">NEXORA SUPPORT & AUDIT</span>
            <p>
              Commissions logic: Month 1 to 6 (10% of Nexora commission), Month 7 to 12 (5% of Nexora commission), and Month 13+ (2% of Nexora commission). Any self-referral, fake booking loops, or owner-partner collusions will lead to immediate profile ban and forfeiture of outstanding balances.
            </p>
            <p>© 2026 Nexora India. Built for digital growth.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
