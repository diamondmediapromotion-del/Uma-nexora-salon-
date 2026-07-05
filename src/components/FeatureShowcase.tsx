import React from "react";
import { motion } from "motion/react";
import {
  Users,
  Briefcase,
  Store,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
  Gift,
  Building2,
  CheckCircle,
  HelpCircle,
  Clock,
  BadgePercent,
  Check
} from "lucide-react";
import { JOBS_DATA, PARTNERS_DATA, BRANDS_DATA } from "../data";
import { dispatchPopState } from "../utils/navigation";

interface FeatureShowcaseProps {
  onOpenModal: (type: "login" | "register" | "book" | "partner" | "distributor" | "jobs") => void;
}

export default function FeatureShowcase({ onOpenModal }: FeatureShowcaseProps) {
  const growthPartnerCards = [
    { title: "Free Joining", desc: "No registration fee. Start instantly as an authorized regional partner.", icon: Users, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { title: "Free Training", desc: "Complete certification program covering salon sales and digital setup tools.", icon: Sparkles, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { title: "Weekly Payout", desc: "Get paid direct-to-bank every Friday for every verified salon onboarded.", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { title: "District Partner Status", desc: "Gain exclusive rights to operate and lead salon onboarding in your Jaipur pincode.", icon: MapPin, color: "text-rose-600 bg-rose-50 border-rose-100" },
    { title: "Network Growth", desc: "Build recurring passive commissions from salon network transaction volumes.", icon: Store, color: "text-purple-600 bg-purple-50 border-purple-100" },
    { title: "Recognition & Rewards", desc: "Earn luxury rewards, title upgrades, and monthly sales bonuses.", icon: Gift, color: "text-indigo-600 bg-indigo-50 border-indigo-100" }
  ];

  const brandCards = [
    { title: "Brand Profile", desc: "Set up a verified professional storefront for your beauty brand.", icon: Building2, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    { title: "Product Showcase", desc: "Expose your beauty kits and chemicals direct to 500+ premium salons.", icon: Gift, color: "text-pink-600 bg-pink-50 border-pink-100" },
    { title: "Sponsored Visibility", desc: "Highlight your products above organic search menus in the booking app.", icon: Sparkles, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { title: "Salon Leads", desc: "Receive direct purchase enquiries and high-volume wholesale orders.", icon: Users, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { title: "Distributor Dashboard", desc: "Track invoice metrics, supply logs, and active Jaipur regional sales.", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { title: "Industry Reach", desc: "Become the preferred supplier for rapid-expansion Jaipur beauty lounges.", icon: Store, color: "text-purple-600 bg-purple-50 border-purple-100" }
  ];

  const jobCards = [
    { title: "Post a Job", desc: "Salon owners can list hiring requirements for stylists, therapists, and cosmetic assistants.", icon: Briefcase, color: "text-rose-600 bg-rose-50 border-rose-100" },
    { title: "Find Salon Jobs", desc: "Browse and apply for checked cosmetologist, stylist, and makeup artist openings.", icon: Users, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { title: "Staff Hiring", desc: "Source qualified, certified beauty professionals directly for your salon team.", icon: Building2, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { title: "Beauty Industry Network", desc: "Connect with distributors, salon chains, and training academy members.", icon: Sparkles, color: "text-purple-600 bg-purple-50 border-purple-100" }
  ];

  return (
    <div className="space-y-24 py-12">
      
      {/* 1. GROWTH PARTNERS SECTION */}
      <section id="growth" className="relative scroll-mt-24">
        {/* Decorative background blur */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-8">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-3xs font-extrabold uppercase tracking-widest border border-blue-100">
              Nexora Growth Partner Program
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
              Salary nahi, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Growth Share.</span>
            </h2>
            <p className="text-slate-600 text-sm font-body leading-relaxed max-w-2xl">
              For beauty product salesmen, cosmetics executives, distributor staff, and salon network people who want to earn by onboarding salons. Use your industry connects to onboard salons and build a highly profitable recurring cashflow.
            </p>
          </div>

          {/* 6-Card Grid for Growth Partner benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {growthPartnerCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-3xl border border-slate-100 premium-shadow flex flex-col justify-between hover:border-blue-100 transition-colors group animate-slide-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="space-y-4">
                    <div className={`p-3 rounded-2xl w-fit ${card.color} border shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-950 text-sm group-hover:text-blue-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-slate-500 text-xs font-light leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Action Bar */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => {
                window.history.pushState({}, "", "/growth-partner");
                dispatchPopState();
                window.scrollTo(0, 0);
              }}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10 hover:-translate-y-0.5 transition-all"
            >
              Become Growth Partner → /growth-partner
            </button>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Central Rajasthan batch starting next Monday
            </span>
          </div>
        </div>
      </section>

      {/* 2. DISTRIBUTOR & BRAND SECTION */}
      <section id="brands" className="relative scroll-mt-24">
        {/* Decorative background blur */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-72 h-72 bg-purple-100/20 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-8">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-3xs font-extrabold uppercase tracking-widest border border-purple-100">
              For Beauty Brands & Distributors
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
              Showcase products, generate leads, and <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">grow visibility</span> inside India’s beauty ecosystem.
            </h2>
            <p className="text-slate-600 text-sm font-body leading-relaxed max-w-2xl">
              Equip your local network with direct distribution pipelines. Bypass physical supply delays, secure direct wholesale orders, and connect your brand to top-tier salons in major Jaipur sectors.
            </p>
          </div>

          {/* 6-Card Grid for Brands & Distributors */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brandCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-3xl border border-slate-100 premium-shadow flex flex-col justify-between hover:border-purple-200 transition-colors group animate-slide-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="space-y-4">
                    <div className={`p-3 rounded-2xl w-fit ${card.color} border shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-950 text-sm group-hover:text-purple-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-slate-500 text-xs font-light leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Action Bar */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => {
                window.history.pushState({}, "", "/distributor-brand");
                dispatchPopState();
                window.scrollTo(0, 0);
              }}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-2xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              Partner with Nexora → /distributor-brand
            </button>
            <button
              onClick={() => {
                window.history.pushState({}, "", "/brands");
                dispatchPopState();
                window.scrollTo(0, 0);
              }}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 hover:bg-slate-50 font-bold rounded-2xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
            >
              Public Brand Directory → /brands
            </button>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              Jaipur B2B hub online and ready
            </span>
          </div>
        </div>
      </section>

      {/* 3. JOBS SECTION */}
      <section id="jobs" className="relative scroll-mt-24">
        {/* Decorative background blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-100/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-8">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-3xs font-extrabold uppercase tracking-widest border border-rose-100">
              Beauty Jobs & Staff Hiring
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
              Connect salon owners with <span className="bg-gradient-to-r from-rose-600 to-indigo-600 bg-clip-text text-transparent">beauty professionals.</span>
            </h2>
            <p className="text-slate-600 text-sm font-body leading-relaxed max-w-2xl">
              Equip your salon with verified local cosmetologists, professional therapists, and executive staff. Or discover verified, secure salon job openings in your Jaipur district.
            </p>
          </div>

          {/* 4-Card Grid for Jobs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {jobCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-3xl border border-slate-100 premium-shadow flex flex-col justify-between hover:border-rose-200 transition-colors group animate-slide-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="space-y-4">
                    <div className={`p-3 rounded-2xl w-fit ${card.color} border shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-950 text-sm group-hover:text-rose-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-slate-500 text-xs font-light leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Action Bar */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => {
                window.history.pushState({}, "", "/jobs");
                dispatchPopState();
                window.scrollTo(0, 0);
              }}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-2xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              Explore Jobs → /jobs
            </button>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Jaipur hiring board updated today
            </span>
          </div>
        </div>
      </section>

    </div>
  );
}
