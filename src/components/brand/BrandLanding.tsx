import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Sparkles, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  PlayCircle,
  Package,
  Globe
} from 'lucide-react';

interface BrandLandingProps {
  navigateTo: (path: string) => void;
  onOpenModal: (type: "login" | "register" | "book" | "partner" | "distributor" | "jobs") => void;
}

export default function BrandLanding({ navigateTo, onOpenModal }: BrandLandingProps) {
  const benefits = [
    { title: "Verified Brand Status", desc: "Build authority with a professional verified storefront and profile.", icon: ShieldCheck, color: "text-blue-600 bg-blue-50" },
    { title: "Product Catalog", desc: "Expose your entire wholesale inventory to Jaipur's top salon owners.", icon: Package, color: "text-indigo-600 bg-indigo-50" },
    { title: "Sponsored Ads", desc: "Boost visibility and rank higher in salon search results with ad placements.", icon: Sparkles, color: "text-amber-600 bg-amber-50" },
    { title: "Direct Leads", desc: "Receive real-time B2B purchase inquiries direct on your dashboard.", icon: Users, color: "text-rose-600 bg-rose-50" },
    { title: "Analytics Suite", desc: "Track impressions, clicks, and conversion metrics for every product.", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
    { title: "Regional Network", desc: "Connect with the fastest-growing salon chain ecosystem in Rajasthan.", icon: Globe, color: "text-violet-600 bg-violet-50" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-500/30">
      {/* Hero Section */}
      <div className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest"
              >
                <Zap className="w-4 h-4 fill-current" />
                Nexora B2B Distribution
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-display font-black text-white leading-tight tracking-tight"
              >
                Scale Your Beauty Brand with <span className="text-blue-500">SalonOS</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-400 text-lg leading-relaxed max-w-xl"
              >
                Empowering beauty brands and distributors to reach 500+ verified salons in Jaipur through a streamlined B2B ecosystem.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <button 
                  onClick={() => onOpenModal('distributor')}
                  className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  Apply as Partner
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => navigateTo('/brands')}
                  className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  Explore Directory
                </button>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative aspect-video rounded-[40px] overflow-hidden border border-white/10 shadow-2xl group cursor-pointer"
            >
              <img 
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1200" 
                alt="Brand Portal" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center group-hover:bg-slate-900/20 transition-all">
                <div className="w-20 h-20 bg-white text-slate-950 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-10 h-10" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-slate-900 border border-slate-800 p-10 rounded-[40px] space-y-6 hover:border-blue-500/50 transition-all group"
              >
                <div className={`w-14 h-14 ${benefit.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-display font-black text-white">{benefit.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{benefit.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Trust Quote */}
      <div className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="text-center space-y-8">
          <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto">
            <Building2 className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-black text-white max-w-4xl mx-auto leading-tight">
            "Nexora transformed how we supply to Jaipur. No more offline chasing—our orders are now digital and verified."
          </h2>
          <div className="space-y-1">
            <p className="text-white font-bold">Vikram Shekhawat</p>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">VP Operations, Premium Beauty Supply Co.</p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-5xl mx-auto px-6 pb-32">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-12 md:p-20 rounded-[60px] text-center space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10 space-y-4">
            <h2 className="text-4xl md:text-6xl font-display font-black text-white tracking-tight">
              Ready to claim your <br />Brand Profile?
            </h2>
            <p className="text-blue-100 text-lg max-w-xl mx-auto">
              Join the official Jaipur beauty supply network. Start showcasing your wholesale products to salon owners today.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => onOpenModal('distributor')}
              className="px-12 py-5 bg-white text-slate-950 font-black rounded-2xl text-sm uppercase tracking-widest hover:bg-slate-50 transition-all shadow-2xl"
            >
              Get Started Now
            </button>
            <button 
              onClick={() => navigateTo('/support')}
              className="px-12 py-5 bg-transparent border-2 border-white/30 text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
