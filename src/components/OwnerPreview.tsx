import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Globe,
  Layout,
  BarChart3,
  Calendar,
  Users,
  TrendingUp,
  Sparkles,
  Smartphone,
  Check,
  Plus,
  Palette,
  QrCode,
  Laptop,
  CheckCircle2,
  Building
} from "lucide-react";
import { THEMES_DATA } from "../data";

interface OwnerPreviewProps {
  onOpenModal: (type: "login" | "register" | "book" | "partner" | "distributor" | "jobs") => void;
}

export default function OwnerPreview({ onOpenModal }: OwnerPreviewProps) {
  // Website Customization States
  const [selectedThemeIdx, setSelectedThemeIdx] = useState(0);
  const [salonName, setSalonName] = useState("Vogue Hair Lounge");
  const [slogan, setSlogan] = useState("Premium hair dressing and skin therapy");
  const [selectedCity, setSelectedCity] = useState("Vaishali Nagar, Jaipur");
  const [isLiveCreating, setIsLiveCreating] = useState(false);

  const currentTheme = THEMES_DATA[selectedThemeIdx];

  // Dashboard Stats States
  const [activeTab, setActiveTab] = useState<"website" | "analytics">("website");
  const [mockAppointments, setMockAppointments] = useState([
    { id: 1, name: "Rahul Verma", time: "11:30 AM", service: "Haircut & Beard Trim", status: "Active", price: "₹699" },
    { id: 2, name: "Kirti Rawat", time: "12:15 PM", service: "Hydra Glow Facial", status: "Active", price: "₹2,999" },
    { id: 3, name: "Nitin Jain", time: "01:00 PM", service: "Classic Pedicure", status: "Completed", price: "₹799" }
  ]);

  const [newClientName, setNewClientName] = useState("");
  const [newClientService, setNewClientService] = useState("Haircut & Beard Trim");

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName) return;
    const newSlot = {
      id: Date.now(),
      name: newClientName,
      time: "02:30 PM",
      service: newClientService,
      status: "Active",
      price: newClientService.includes("Facial") ? "₹2,999" : "₹699"
    };
    setMockAppointments([newSlot, ...mockAppointments]);
    setNewClientName("");
  };

  const stats = [
    { label: "Digital Bookings", value: "148 slots", growth: "+32% this month", icon: Calendar, color: "text-blue-600 bg-blue-50" },
    { label: "Cashback Claimed", value: "₹18,450", growth: "QR Loyalty boost", icon: QrCode, color: "text-purple-600 bg-purple-50" },
    { label: "Page Views", value: "3.4k visits", growth: "From free subdomain", icon: Globe, color: "text-amber-600 bg-amber-50" },
    { label: "Customer Retention", value: "84.2%", growth: "Urban Company standard", icon: Users, color: "text-emerald-600 bg-emerald-50" }
  ];

  return (
    <div className="space-y-8">
      {/* Tab Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50">
          <button
            onClick={() => setActiveTab("website")}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "website"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Laptop className="w-4 h-4" />
            1. Free Website Builder
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "analytics"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            2. SalonOS Analytics & CRM
          </button>
        </div>
      </div>

      {activeTab === "website" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Builder Controls - Column 5 */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 premium-shadow space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-3xs font-extrabold uppercase tracking-widest">
                No-Code Builder Sandbox
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-3">Free Website & Booking Subdomain</h3>
              <p className="text-xs text-slate-500 mt-1">
                Customize your layout live. Get a fully working web page with a verified SSL booking portal on <code className="bg-slate-50 px-1 py-0.5 rounded text-blue-600 font-mono">nexorasalon.in</code>.
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-3xs font-black text-slate-400 uppercase tracking-wider mb-2">
                  Salon Brand Name
                </label>
                <input
                  type="text"
                  value={salonName}
                  onChange={(e) => setSalonName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-xs font-semibold text-slate-800 transition-all"
                  placeholder="e.g. Vogue Hair Lounge"
                />
              </div>

              <div>
                <label className="block text-3xs font-black text-slate-400 uppercase tracking-wider mb-2">
                  Brand Tagline / Slogan
                </label>
                <textarea
                  rows={2}
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-xs font-semibold text-slate-800 transition-all resize-none"
                  placeholder="e.g. Premium hair styling and organic skin therapy"
                />
              </div>

              <div>
                <label className="block text-3xs font-black text-slate-400 uppercase tracking-wider mb-2">
                  Locality (Jaipur Only)
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700"
                >
                  <option>Vaishali Nagar, Jaipur</option>
                  <option>C-Scheme, Jaipur</option>
                  <option>Malviya Nagar, Jaipur</option>
                  <option>Mansarovar, Jaipur</option>
                </select>
              </div>

              {/* Theme Selector */}
              <div>
                <label className="block text-3xs font-black text-slate-400 uppercase tracking-wider mb-3">
                  Select Visual Layout Theme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES_DATA.map((theme, idx) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedThemeIdx(idx)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-18 ${
                        selectedThemeIdx === idx
                          ? "border-blue-600 bg-blue-50/20 ring-1 ring-blue-500"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50"
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                        {theme.name}
                        {selectedThemeIdx === idx && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3px]" />}
                      </span>
                      <div className="flex gap-1.5 items-center mt-1">
                        <span className="w-3 h-3 rounded-full bg-slate-900 border" style={{ background: theme.id === "theme-warm" ? "#78350f" : theme.id === "theme-modern" ? "#0f172a" : theme.id === "theme-royal" ? "#6b21a8" : "#e11d48" }} />
                        <span className="text-[9px] text-slate-400">Preview Layout</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2">
              <button
                onClick={() => onOpenModal("register")}
                className="w-full py-3.5 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-slate-950/5"
              >
                <Globe className="w-4 h-4 text-blue-400" />
                Claim This Website Subdomain Free
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-2.5">
                No hosting fee • Lifetime SSL verified • Live in 60 seconds
              </p>
            </div>
          </div>

          {/* Device Simulator - Column 7 */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-sm rounded-[42px] bg-slate-900 p-3 shadow-2xl border border-slate-800 aspect-[9/18]">
              
              {/* Speaker / Camera Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20 flex items-center justify-center">
                <div className="w-12 h-1 bg-slate-800 rounded-full mb-1" />
              </div>

              {/* Inside Screen */}
              <div className="w-full h-full rounded-[34px] bg-white overflow-hidden relative flex flex-col pt-6 font-sans">
                
                {/* Simulated URL bar */}
                <div className="bg-slate-100/90 py-1.5 px-4 flex items-center justify-between text-[10px] font-semibold text-slate-500 border-b border-slate-200/50">
                  <span className="flex items-center gap-1">🔒 {salonName.toLowerCase().replace(/\s+/g, "")}.nexorasalon.in</span>
                  <span className="text-emerald-600 font-black text-[9px] uppercase tracking-wide">Live</span>
                </div>

                {/* Simulated Mobile Site Header */}
                <div className={`p-4 ${currentTheme.bgClass} ${currentTheme.textClass} border-b border-slate-100 flex-1 flex flex-col justify-between overflow-y-auto scrollbar-none`}>
                  
                  {/* Branding */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className={`text-sm font-black tracking-tight ${currentTheme.fontClass}`}>{salonName}</h4>
                      <p className="text-[10px] opacity-75 flex items-center gap-0.5 mt-0.5">
                        📍 {selectedCity}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                      {salonName[0]}
                    </div>
                  </div>

                  {/* Pitch */}
                  <div className="my-auto py-4 space-y-3">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-bold rounded uppercase tracking-wide">
                      Jaipur Verified Partner
                    </span>
                    <h2 className={`text-xl font-extrabold tracking-tight leading-snug ${currentTheme.fontClass}`}>
                      "{slogan}"
                    </h2>
                    <p className="text-[11px] opacity-85 font-light">
                      Book certified beauticians instantly. Pay securely on-counter with Nexora QR & receive 15% wallet points cashback.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 mt-auto">
                    <button
                      type="button"
                      onClick={() => onOpenModal("register")}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold text-center transition-all ${currentTheme.primaryColor}`}
                    >
                      Book Appointment Now (60s)
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold text-center border transition-all ${currentTheme.accentColor}`}
                      >
                        Browse Services
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold text-center border transition-all ${currentTheme.accentColor}`}
                      >
                        Offers (15% Cash)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Static Simulated Client Reviews section */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px]">
                  <h5 className="font-bold text-slate-800 mb-2">Verified Customer Reviews</h5>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Meera S.</span>
                      <span className="text-amber-500">★★★★★</span>
                    </div>
                    <p className="text-slate-500 font-light text-[9px]">"Loved the L'Oreal hair spa! Incredible discount via Nexora QR."</p>
                  </div>
                </div>

              </div>

              {/* Phone Physical Home Bar */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-800 rounded-full" />
            </div>
            <p className="text-xs text-slate-500 font-medium mt-4 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Live mobile-responsive simulation matches real output
            </p>
          </div>

        </div>
      ) : (
        /* Analytics Tab Dashboard simulation */
        <div className="space-y-6">
          {/* Bento Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-3xl border border-slate-100 premium-shadow flex flex-col justify-between hover:border-blue-100/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-widest">
                      {stat.label}
                    </span>
                    <div className={`p-2 rounded-xl ${stat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-2xl font-black font-display text-slate-900">{stat.value}</h4>
                    <p className="text-xs text-blue-600 font-bold mt-1">{stat.growth}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Quick CRM Simulator - Column 7 */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 premium-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-bold text-slate-950 text-sm">Live Seat Booking Manager</h4>
                  <p className="text-xs text-slate-500">Real-time status of seats & counters inside SalonOS.</p>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl">
                  3 Active Seats
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Client</th>
                      <th className="pb-3">Slot</th>
                      <th className="pb-3">Selected Service</th>
                      <th className="pb-3 text-right pr-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium">
                    {mockAppointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 pl-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="font-bold text-slate-800">{appt.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-600">{appt.time}</td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold text-[10px]">
                            {appt.service}
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-bold pr-2">{appt.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Appointment adder simulator - Column 5 */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 premium-shadow space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Add Direct Counter Client</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulate walk-in clients linking instantly to SalonOS QR loyalty sheets.
                </p>
              </div>

              <form onSubmit={handleAddAppointment} className="space-y-3">
                <div>
                  <label className="block text-3xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Client Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="e.g. Meera Saxena"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-3xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Select walk-in Service
                  </label>
                  <select
                    value={newClientService}
                    onChange={(e) => setNewClientService(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold"
                  >
                    <option value="Haircut & Beard Trim">Haircut & Beard Trim — ₹699</option>
                    <option value="Hydra Glow Facial">Hydra Glow Facial — ₹2,999</option>
                    <option value="Classic Pedicure">Classic Pedicure — ₹799</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Book walk-in Slot
                </button>
              </form>

              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 text-xs text-purple-950 flex items-start gap-2 pt-3">
                <QrCode className="w-4.5 h-4.5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">QR Billing Sheet Pre-Linked</p>
                  <p className="mt-0.5 text-purple-600 font-medium">
                    Walk-in clients scanning the desk QR will automatically import this slot, redeem active rewards, and pay securely.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
