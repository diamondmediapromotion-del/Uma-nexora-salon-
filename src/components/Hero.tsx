import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  MapPin,
  Clock,
  QrCode,
  Globe,
  Star,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Gift,
  Palette
} from "lucide-react";
import { THEMES_DATA } from "../data";
import { dispatchPopState } from "../utils/navigation";

interface HeroProps {
  onOpenModal: (type: "login" | "register" | "book" | "partner" | "distributor" | "jobs" | "search-salons") => void;
  onBookingPoints: number; // dynamically feed points
}

export default function Hero({ onOpenModal, onBookingPoints }: HeroProps) {
  // Mini interactive state for the live website live-builder preview
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(1); // Minimalist Slate
  const currentTheme = THEMES_DATA[selectedThemeIndex];

  // Mock nearby salons to click or view
  const [clickedBook, setClickedBook] = useState(false);

  const trustChips = [
    { label: "Verified Salons", icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "60 Second Booking", icon: Clock, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { label: "15% QR Rewards", icon: QrCode, color: "text-purple-600 bg-purple-50 border-purple-100" },
    { label: "Free Salon Website", icon: Globe, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { label: "Jaipur Pilot Launch", icon: MapPin, color: "text-rose-600 bg-rose-50 border-rose-100" }
  ];

  return (
    <section className="relative pt-24 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/30">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-3/4 h-[500px] bg-gradient-to-bl from-blue-100/30 via-violet-100/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-1/2 h-[350px] bg-gradient-to-tr from-sky-100/20 via-blue-100/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column - Headline & Copy */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 fill-blue-600/30" />
              <span>Rajasthan's First Integrated Beauty SaaS Ecosystem</span>
            </motion.div>

            {/* Main Headline */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-900 leading-[1.12]"
              >
                Salon Nahi.<br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Poora Experience Upgrade.
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-slate-600 text-base sm:text-lg md:text-xl font-body max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light"
              >
                Discover verified salons, compare services, book faster, earn rewards, and help beauty businesses grow digitally with Nexora SalonOS.
              </motion.p>
            </div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <button
                onClick={() => {
                  window.history.pushState({}, "", "/customer");
                  dispatchPopState();
                  window.scrollTo(0, 0);
                }}
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl text-base font-semibold shadow-lg shadow-slate-950/10 transition-all hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 group"
              >
                Find Salons
                <ArrowRight className="w-4.5 h-4.5 text-slate-400 group-hover:translate-x-1 group-hover:text-white transition-all" />
              </button>
              <button
                onClick={() => {
                  window.history.pushState({}, "", "/owner-register");
                  dispatchPopState();
                  window.scrollTo(0, 0);
                }}
                className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 hover:border-blue-300 text-slate-800 hover:text-blue-700 rounded-2xl text-base font-semibold transition-all hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
              >
                Register Your Salon
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-2xs uppercase tracking-wide font-black rounded">Free</span>
              </button>
            </motion.div>

            {/* Trust Chips list */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-4"
            >
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center lg:text-left mb-4">
                What Nexora Unlocks for Jaipur
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2.5">
                {trustChips.map((chip, idx) => {
                  const Icon = chip.icon;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold ${chip.color} hover:scale-102 transition-transform`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{chip.label}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Premium Dashboard Preview Area */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            {/* Visual background circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 max-w-md mx-auto relative z-10">
              
              {/* Card 1: Nearby Salons Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white p-4 rounded-3xl border border-slate-100 premium-shadow flex flex-col gap-3 group hover:border-blue-100 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-widest">
                      Jaipur Salons Live GPS
                    </span>
                  </div>
                  <span className="text-3xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                    C-Scheme
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-slate-100/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=80"
                      className="w-10 h-10 rounded-xl object-cover"
                      alt="Salon Thumbnail"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Chique Salon & Luxury Spa</h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" /> 1.2 km away
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-0.5 justify-end">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-2xs font-bold text-slate-800">4.9</span>
                    </div>
                    <span className="text-[9px] text-slate-400">(312 reviews)</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setClickedBook(true);
                    setTimeout(() => setClickedBook(false), 2500);
                  }}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-2xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  {clickedBook ? "Opening Dynamic Planner..." : "Book Appointment in 60s"}
                </button>
              </motion.div>

              {/* Card 2: Booking Confirmed Ticket */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white p-4 rounded-3xl border border-slate-100 premium-shadow flex items-center justify-between hover:border-violet-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                    <CheckCircle className="w-5.5 h-5.5 stroke-[2.5px]" />
                  </div>
                  <div>
                    <span className="text-3xs font-extrabold text-emerald-600 tracking-wider uppercase block">
                      Confirmed instant
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">Seat reserved successfully!</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Hair cut with master stylist</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Your Seat</span>
                  <span className="text-xs font-extrabold text-slate-900">No. 03</span>
                </div>
              </motion.div>

              {/* Card 3: Rewards Points Live Tracker */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 text-white p-4 rounded-3xl border border-slate-800/80 shadow-xl flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-violet-400 fill-violet-400/20" />
                    <span className="text-3xs font-bold text-violet-300 uppercase tracking-widest">
                      Nexora Loyalty Wallet
                    </span>
                  </div>
                  <h4 className="text-2xl font-black font-display tracking-tight text-white flex items-baseline gap-1">
                    ₹{1250 + onBookingPoints}
                    <span className="text-xs font-bold text-violet-300">points</span>
                  </h4>
                  <p className="text-[9px] text-slate-400">
                    Earned 15% instant QR rewards in Jaipur network
                  </p>
                </div>
                <div className="p-2.5 bg-white/10 rounded-2xl text-center border border-white/10 backdrop-blur-sm">
                  <QrCode className="w-8 h-8 text-white mx-auto stroke-[1.5px]" />
                  <span className="text-[8px] font-bold text-violet-200 block mt-1 uppercase">Scan QR</span>
                </div>
              </motion.div>

              {/* Card 4: Free Website Live Customizer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white p-4 rounded-3xl border border-slate-100 premium-shadow space-y-3 hover:border-amber-100 transition-all"
              >
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-widest">
                      Free Salon Website subdomains
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full text-amber-800 border border-amber-100">
                    <Zap className="w-3 h-3 animate-bounce text-amber-600" />
                    <span className="text-[9px] font-bold">Live Preview</span>
                  </div>
                </div>

                {/* Subdomain representation */}
                <div className="bg-slate-50 px-3 py-1.5 rounded-xl flex items-center justify-between border border-slate-100">
                  <span className="text-2xs text-slate-500 font-mono">royalhair.nexorasalon.in</span>
                  <span className="text-3xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Active SSL
                  </span>
                </div>

                {/* Simulated Web page rendering */}
                <div className={`p-4 rounded-2xl border transition-all duration-300 ${currentTheme.bgClass} ${currentTheme.textClass}`}>
                  <div className="flex justify-between items-center mb-2">
                    <h5 className={`text-xs font-bold ${currentTheme.fontClass}`}>Royal Touch Salon</h5>
                    <span className="text-[8px] opacity-75 font-bold">Vaishali Nagar</span>
                  </div>
                  <p className="text-[9px] opacity-80 mb-3 font-serif">"Expert Hair Dressing & Grooming since 2011"</p>
                  <div className="flex gap-2">
                    <div className={`px-2 py-1 rounded text-[8px] font-bold ${currentTheme.primaryColor}`}>
                      Book Haircut
                    </div>
                    <div className={`px-2 py-1 rounded text-[8px] border font-bold ${currentTheme.accentColor}`}>
                      View Offers
                    </div>
                  </div>
                </div>

                {/* Interactive controller inside visual */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Palette className="w-3 h-3 text-slate-500" /> Try switching themes:
                  </span>
                  <div className="flex gap-1.5">
                    {THEMES_DATA.map((t, idx) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedThemeIndex(idx)}
                        className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                          selectedThemeIndex === idx
                            ? "scale-125 ring-2 ring-blue-500 ring-offset-1"
                            : "opacity-60 hover:opacity-100"
                        }`}
                        style={{
                          background: t.id === "theme-warm" ? "#78350f" : t.id === "theme-modern" ? "#0f172a" : t.id === "theme-royal" ? "#6b21a8" : "#e11d48"
                        }}
                        title={t.name}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
