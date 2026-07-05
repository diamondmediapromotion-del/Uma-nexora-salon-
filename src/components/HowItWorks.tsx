import React from "react";
import { motion } from "motion/react";
import { 
  Search, 
  Clock, 
  QrCode, 
  Eye,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Customer searches nearby salon",
      description: "Filter Jaipur outlets easily by pincode, specializations, and real-time open slots.",
      icon: Search,
      color: "text-blue-600 bg-blue-50 border-blue-100"
    },
    {
      step: "02",
      title: "Customer views services, photos, staff and prices",
      description: "Inspect pre-verified price lists, staff certificates, and real geolocated venue photos.",
      icon: Eye,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100"
    },
    {
      step: "03",
      title: "Customer books appointment in 60 seconds",
      description: "Lock your desired seat and time slot instantly with our rapid automated checkout engine.",
      icon: Clock,
      color: "text-rose-600 bg-rose-50 border-rose-100"
    },
    {
      step: "04",
      title: "Customer pays via Nexora QR and earns rewards",
      description: "Scan the customized counter standee to pay, instantly claiming 15% digital wallet cashback.",
      icon: QrCode,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white border-b border-slate-100 scroll-mt-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-3xs font-extrabold uppercase tracking-widest border border-slate-100">
            Platform Workflow
          </span>
          <h2 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
            How <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">Nexora Works</span>
          </h2>
          <p className="text-slate-500 text-sm md:text-base font-body font-light">
            A frictionless, transparent journey for Jaipur customers looking to level up their beauty routines.
          </p>
        </div>

        {/* 4-Step Process Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 relative z-10 flex flex-col justify-between hover:bg-white hover:border-blue-100 transition-all duration-300 premium-shadow group"
              >
                <div>
                  {/* Step badge & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-display font-black tracking-tight text-slate-200 group-hover:text-blue-100 transition-colors">
                      {step.step}
                    </span>
                    <div className={`p-3 rounded-2xl ${step.color} border shadow-sm`}>
                      <Icon className="w-5 h-5 stroke-[2px]" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-950 group-hover:text-blue-600 transition-colors leading-snug">
                      {step.title}
                    </h4>
                    <p className="text-slate-500 text-xs font-light leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Micro badge indicator */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>100% Secure Flow</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
