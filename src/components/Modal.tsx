import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Calendar, Sparkles, Smartphone, Building2, Store, Heart, Star, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Salon, Service } from "../types";
import { supabase } from "../lib/supabase";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "login" | "register" | "book" | "partner" | "distributor" | "jobs" | "search-salons" | null;
  salonData?: Salon | null;
  serviceData?: Service | null;
  onBookingSuccess?: (pointsGained: number) => void;
  onRegisterSuccess?: (salonName: string) => void;
}

export default function Modal({
  isOpen,
  onClose,
  type,
  salonData,
  serviceData,
  onBookingSuccess,
  onRegisterSuccess
}: ModalProps) {
  // Common states
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = input, 2 = confirmation / otp
  const [name, setName] = useState("");
  const [city, setCity] = useState("Jaipur");
  const [brandName, setBrandName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [salonType, setSalonType] = useState("Single Salon");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Reset modal state on type change or reopen
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPhone("");
      setOtp("");
      setName("");
      setSuccess(false);
      setLoading(false);
      if (serviceData) {
        setSelectedService(serviceData);
      } else if (salonData && salonData.services.length > 0) {
        setSelectedService(salonData.services[0]);
      } else {
        setSelectedService(null);
      }
    }
  }, [isOpen, type, salonData, serviceData]);

  if (!isOpen) return null;

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 800);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setLoading(true);

    try {
      if (type === 'distributor') {
        const { error } = await supabase.from('brand_applications').insert({
          brand_name: brandName,
          full_name: name,
          email: email,
          mobile: phone,
          city: city,
          about_brand: message,
          status: 'pending_review'
        });
        if (error) throw error;
      } else if (type === 'partner') {
        const { error } = await supabase.from('partner_applications').insert({
          full_name: name,
          mobile: phone,
          city: city,
          status: 'pending'
        });
        if (error) throw error;
      }
      
      setLoading(false);
      setSuccess(true);
      if (onRegisterSuccess) {
        onRegisterSuccess(name);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setLoading(false);
      alert('Registration failed. Please try again.');
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      if (onBookingSuccess && selectedService) {
        const points = Math.round(selectedService.price * 0.15); // 15% reward
        onBookingSuccess(points);
      }
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-100 premium-shadow z-50 overflow-hidden text-slate-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
                {type === "login" && "Secured OTP Gateway"}
                {type === "register" && "Partner Onboarding"}
                {type === "book" && "Express Booking (60s)"}
                {type === "partner" && "Growth Partner Registration"}
                {type === "distributor" && "Distributor & Brand Hub"}
                {type === "jobs" && "Nexora Careers Store"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-6"
              >
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6 border border-emerald-100 animate-bounce">
                  <Check className="w-8 h-8 stroke-[3px]" />
                </div>

                {type === "login" && (
                  <>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900">Successfully Signed In</h3>
                    <p className="text-slate-500 mt-2 text-sm max-w-xs">
                      Welcome back! Your dashboard is syncing. You are now browsing Nexora SalonOS in VIP preview mode.
                    </p>
                  </>
                )}

                {type === "register" && (
                  <>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900">Salon Registered!</h3>
                    <p className="text-slate-500 mt-2 text-sm max-w-sm">
                      Congratulations! <strong className="text-blue-600">{name}</strong> is now pre-registered for the C-Scheme & Vaishali Nagar rollout. Our representative will contact you on <strong className="text-slate-800">+91 {phone}</strong> in 24 hours.
                    </p>
                    <div className="mt-6 p-4 bg-blue-50/50 rounded-2xl text-left border border-blue-100/50 w-full text-xs text-blue-800 space-y-1">
                      <p className="font-semibold text-blue-900 flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3.5 h-3.5" /> Next Steps Preview:
                      </p>
                      <p>• Your free salon website subdomain will be live instantly after phone verification.</p>
                      <p>• Get free SalonOS premium software, QR code templates & booking sheets.</p>
                    </div>
                  </>
                )}

                {type === "book" && (
                  <>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900">Booking Confirmed!</h3>
                    <p className="text-slate-500 mt-2 text-sm max-w-xs">
                      Your seat is reserved at <strong>{salonData?.name}</strong>.
                    </p>
                    <div className="mt-6 p-5 bg-gradient-to-tr from-violet-50 to-indigo-50 rounded-2xl w-full border border-violet-100 text-left">
                      <div className="flex justify-between items-start mb-3 pb-3 border-b border-violet-100/60">
                        <div>
                          <p className="text-xs text-violet-600 font-semibold">Service</p>
                          <p className="text-slate-800 font-semibold text-sm">{selectedService?.name}</p>
                        </div>
                        <p className="text-slate-900 font-bold">₹{selectedService?.price}</p>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Today (Immediate slot)
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">
                          +15% Rewards Point Added!
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {type === "partner" && (
                  <>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900">Application Submitted</h3>
                    <p className="text-slate-500 mt-2 text-sm max-w-sm">
                      Thank you <strong className="text-slate-900">{name}</strong> for choosing to grow with Nexora. Our Territory Head will call you within 12 hours to explain the onboarding payout structure.
                    </p>
                  </>
                )}

                {type === "distributor" && (
                  <>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900">Distributor Hub Linked</h3>
                    <p className="text-slate-500 mt-2 text-sm max-w-sm">
                      Your wholesale catalog request for <strong className="text-slate-900">{name}</strong> has been logged. We are routing you directly to authorized local distributor yards.
                    </p>
                  </>
                )}

                {type === "jobs" && (
                  <>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900">Application Transmitted!</h3>
                    <p className="text-slate-500 mt-2 text-sm max-w-sm">
                      Your interest has been instantly pinged to the Salon's manager. They will schedule a short video interview. Good luck!
                    </p>
                  </>
                )}

                <button
                  onClick={onClose}
                  className="mt-8 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close Window
                </button>
              </motion.div>
            ) : (
              <div>
                {/* 1. LOGIN TYPE */}
                {type === "login" && (
                  <form onSubmit={step === 1 ? handleSendOTP : handleVerifyOTP} className="space-y-5">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Access SalonOS</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Sign in instantly via high-speed Indian SMS OTP gateway.
                      </p>
                    </div>

                    {step === 1 ? (
                      <div className="space-y-4">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Enter Mobile Number
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold border-r border-slate-100 pr-3">
                            +91
                          </span>
                          <input
                            type="tel"
                            required
                            pattern="[6-9][0-9]{9}"
                            placeholder="98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            className="w-full pl-16 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-sm transition-all font-medium"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={phone.length < 10 || loading}
                          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 cursor-pointer disabled:opacity-40"
                        >
                          {loading ? "Sending Secure OTP..." : "Get One-Time OTP"}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between text-xs text-blue-800">
                          <span>SMS OTP sent to +91 {phone}</span>
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="font-bold underline text-blue-600 hover:text-blue-800"
                          >
                            Change Number
                          </button>
                        </div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Enter 4-Digit Verification OTP
                        </label>
                        <input
                          type="text"
                          required
                          pattern="[0-9]{4}"
                          placeholder="••••"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          className="w-full text-center tracking-[1.5em] text-xl font-bold py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                        />
                        <button
                          type="submit"
                          disabled={otp.length < 4 || loading}
                          className="w-full py-4 px-6 bg-slate-900 text-white font-bold rounded-2xl text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                        >
                          {loading ? "Verifying Credentials..." : "Verify & Log In"}
                        </button>
                      </div>
                    )}
                  </form>
                )}

                {/* 2. REGISTER SALON TYPE */}
                {type === "register" && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-5">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Register Your Salon</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Go live digitally in Jaipur. Join the modern beauty SaaS ecosystem.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Salon / Studio Business Name
                        </label>
                        <div className="relative">
                          <Store className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Royal Glow Hair Salon"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-medium transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Select Salon Type
                          </label>
                          <select
                            value={salonType}
                            onChange={(e) => setSalonType(e.target.value)}
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-medium transition-all"
                          >
                            <option>Single Salon</option>
                            <option>Multi-Outlet Chain</option>
                            <option>Premium Spa & Resort</option>
                            <option>Independent Professional</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Operating City
                          </label>
                          <select
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-medium transition-all"
                          >
                            <option>Jaipur Launch</option>
                            <option disabled>Delhi NCR (Coming Soon)</option>
                            <option disabled>Mumbai (Coming Soon)</option>
                            <option disabled>Bangalore (Coming Soon)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Owner WhatsApp Contact
                        </label>
                        <div className="relative">
                          <Smartphone className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <span className="absolute left-11 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                            +91
                          </span>
                          <input
                            type="tel"
                            required
                            pattern="[6-9][0-9]{9}"
                            placeholder="98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            className="w-full pl-20 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-medium transition-all"
                          />
                        </div>
                      </div>

                      <div className="flex items-start gap-2 pt-2 text-xs text-slate-500">
                        <input type="checkbox" required id="consent" className="mt-0.5 rounded border-slate-300" />
                        <label htmlFor="consent">
                          I agree to create my free digital store, accept booking calendar syncs, and receive platform updates.
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={!name || phone.length < 10 || loading}
                        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 cursor-pointer disabled:opacity-40"
                      >
                        {loading ? "Provisioning Website Subdomain..." : "Generate Free Salon Website & Dashboard"}
                      </button>
                    </div>
                  </form>
                )}

                {/* 3. BOOK SALON TYPE */}
                {type === "book" && salonData && (
                  <form onSubmit={handleBookingSubmit} className="space-y-5">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                      <img
                        src={salonData.image}
                        alt={salonData.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{salonData.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{salonData.area}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-bold text-slate-700">{salonData.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Select Service
                        </label>
                        <select
                          value={selectedService ? selectedService.name : ""}
                          onChange={(e) => {
                            const found = salonData.services.find((s) => s.name === e.target.value);
                            if (found) setSelectedService(found);
                          }}
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-medium transition-all"
                        >
                          {salonData.services.map((s) => (
                            <option key={s.name} value={s.name}>
                              {s.name} — ₹{s.price} ({s.duration})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Your Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-medium transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Mobile (For Rewards OTP)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                              +91
                            </span>
                            <input
                              type="tel"
                              required
                              pattern="[6-9][0-9]{9}"
                              placeholder="9876543210"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                              className="w-full pl-11 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-medium transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-start gap-2.5">
                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">
                          %
                        </div>
                        <div className="text-xs text-emerald-800">
                          <p className="font-bold">Nexora 15% Instant QR Reward Applicable</p>
                          <p className="mt-0.5 text-emerald-600">
                            Book this service in 60s and gain ₹
                            {selectedService ? Math.round(selectedService.price * 0.15) : 0} cashback in your loyalty wallet instantly upon checkout.
                          </p>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!name || phone.length < 10 || loading}
                        className="w-full py-4 px-6 bg-slate-900 text-white font-bold rounded-2xl text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                      >
                        {loading ? "Confirming Slot with Salon Manager..." : "Confirm Express Booking"}
                      </button>
                    </div>
                  </form>
                )}

                {/* 4. GROWTH PARTNER APPLICATION */}
                {type === "partner" && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-5">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Become a Growth Partner</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Help salons go digital in your neighborhood and secure recurring lifeshare earnings.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Your Full Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Rajesh Sharma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-medium transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Operating Locality
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. C-Scheme, Jaipur"
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Prior Experience
                          </label>
                          <select className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-medium">
                            <option>No sales experience</option>
                            <option>Urban Company Lead</option>
                            <option>Justdial Sales Exec</option>
                            <option>Other B2B SaaS Sales</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          WhatsApp Mobile
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                            +91
                          </span>
                          <input
                            type="tel"
                            required
                            pattern="[6-9][0-9]{9}"
                            placeholder="9876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            className="w-full pl-14 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-medium transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!name || phone.length < 10 || loading}
                        className="w-full py-4 px-6 bg-blue-600 text-white font-bold rounded-2xl text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                      >
                        {loading ? "Transmitting Profile..." : "Submit Partner Application"}
                      </button>
                    </div>
                  </form>
                )}
                {/* 5. DISTRIBUTOR HUB APPLICATION */}
                {type === "distributor" && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-5">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Nexora B2B Brand Hub</h3>
                      <p className="text-sm text-slate-500 font-medium">
                        Apply to showcase your beauty products to 500+ verified salons in Jaipur.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                            Brand Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Pure Glam Cosmetics"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                            Contact Person
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Vikram Singh"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                            Business Email
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="vikram@brand.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                            Operating City
                          </label>
                          <select 
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold"
                          >
                            <option value="Jaipur">Jaipur (Rajasthan)</option>
                            <option value="Jodhpur">Jodhpur</option>
                            <option value="Udaipur">Udaipur</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                          WhatsApp Mobile Number
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                            +91
                          </span>
                          <input
                            type="tel"
                            required
                            pattern="[6-9][0-9]{9}"
                            placeholder="9876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            className="w-full pl-14 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-medium transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                          Tell us about your brand portfolio
                        </label>
                        <textarea
                          rows={3}
                          placeholder="What major products or categories do you distribute?"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-medium resize-none"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={!name || phone.length < 10 || !brandName || loading}
                        className="w-full py-4 px-6 bg-slate-900 text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 shadow-xl shadow-slate-900/20"
                      >
                        {loading ? "Registering Brand..." : "Request Distribution Access"}
                      </button>
                    </div>
                  </form>
                )}

                {/* 6. JOBS ENROLLMENT */}
                {type === "jobs" && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-5">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Apply for Beautician & Stylist Jobs</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Apply to verified salons with set salaries, PF, incentives, and clean accommodation.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Your Full Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Pooja Verma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Select Job Specialty
                          </label>
                          <select className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm">
                            <option>Hair Dresser & Stylist</option>
                            <option>Skin Expert & Beautician</option>
                            <option>Nail Artist Specialist</option>
                            <option>Salon Manager / Front Desk</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Years of Experience
                          </label>
                          <select className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm">
                            <option>Fresher (Nexora Academy grad)</option>
                            <option>1-2 Years</option>
                            <option>3-5 Years</option>
                            <option>5+ Years</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          WhatsApp Mobile Number
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                            +91
                          </span>
                          <input
                            type="tel"
                            required
                            pattern="[6-9][0-9]{9}"
                            placeholder="9876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            className="w-full pl-14 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-medium transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!name || phone.length < 10 || loading}
                        className="w-full py-4 px-6 bg-blue-600 text-white font-bold rounded-2xl text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                      >
                        {loading ? "Matching with Job Postings..." : "Send Profile to Verified Salons"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
