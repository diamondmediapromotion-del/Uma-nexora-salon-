import React from "react";
import { motion } from "motion/react";
import { 
  MapPin, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  TrendingUp,
  ArrowRight
} from "lucide-react";

export default function TrustImpact() {
  const rolloutPoints = [
    {
      id: "jaipur-pilot-rollout",
      label: "Jaipur Pilot Rollout",
      description: "Active local setup in progress across C-Scheme, Vaishali Nagar, and Malviya Nagar.",
      icon: MapPin,
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
      accentLine: "bg-blue-500",
      status: "Live Phase 1"
    },
    {
      id: "verified-partner-salons",
      label: "Verified Partner Salons",
      description: "Physical audit & quality certification underway for premium Jaipur beauty lounges.",
      icon: ShieldCheck,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      accentLine: "bg-emerald-500",
      status: "Audit Ongoing"
    },
    {
      id: "growing-beauty-network",
      label: "Growing Beauty Network",
      description: "Connecting salon owners, professional stylists, sales executives, and brands direct.",
      icon: Users,
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
      accentLine: "bg-indigo-500",
      status: "Expanding"
    },
    {
      id: "rewards-launching-soon",
      label: "Rewards Launching Soon",
      description: "Flat 15% wallet savings and custom counter QR standees active in the upcoming release.",
      icon: Sparkles,
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
      accentLine: "bg-amber-500",
      status: "Coming Soon"
    }
  ];

  return (
    <section id="impact" className="py-24 bg-white border-t border-slate-100/80 scroll-mt-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-3xs font-extrabold uppercase tracking-widest border border-slate-100">
            Current Status
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
            Our Early <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Jaipur Rollout</span>
          </h2>
          
          <p className="text-slate-500 text-sm md:text-base font-body font-light">
            We are working closely with regional beauty outlets, expert cosmetologists, and localized sales networks to build India’s premium digital beauty ecosystem.
          </p>
        </div>

        {/* 4-Column Grid for Early Rollout Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rolloutPoints.map((point, idx) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={point.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 premium-shadow flex flex-col justify-between hover:bg-white hover:border-blue-100 transition-all duration-300 relative group"
              >
                {/* Accent line on hover */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${point.accentLine} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-t-3xl`} />
                
                <div className="space-y-6">
                  {/* Icon & Status Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl border ${point.iconBg} shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50/75 border border-blue-100 px-2.5 py-1 rounded-full">
                      {point.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <span className="text-2xs font-extrabold uppercase tracking-wider text-slate-400 block">
                      {point.label}
                    </span>
                    <p className="text-slate-600 text-xs sm:text-sm font-light leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>

                {/* Micro interaction */}
                <div className="mt-8 pt-4 border-t border-slate-100/50 flex items-center justify-between text-3xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                  <span>Partner Onboarding Started</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
