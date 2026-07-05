import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Store, 
  TrendingUp, 
  ShoppingBag, 
  Briefcase, 
  Shield, 
  ArrowRight,
  Lock,
  ChevronRight,
  CheckCircle,
  Sparkles,
  Handshake,
  Package,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Map string icons to Lucide components
const IconMap: Record<string, any> = {
  User,
  Store,
  TrendingUp,
  ShoppingBag,
  Briefcase,
  Shield,
  Sparkles,
  Handshake,
  Package,
  ShieldCheck
};

interface AppLauncherProps {
  navigateTo: (path: string) => void;
}

export default function AppLauncher({ navigateTo }: AppLauncherProps) {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    fetchSessionAndApps();
  }, []);

  const fetchSessionAndApps = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      // We'll call the RPC if logged in, otherwise just show a default list
      if (session) {
        const { data, error } = await supabase.rpc('get_my_app_launcher');
        if (error) {
          console.error("RPC Error:", error);
          loadDefaultApps(!!session);
        } else {
          setApps(data || []);
        }
      } else {
        loadDefaultApps(false);
      }
    } catch (err) {
      console.error('Error fetching apps:', err);
      loadDefaultApps(false);
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultApps = (isLoggedIn: boolean) => {
    // Fallback if RPC fails or not logged in
    setApps([
      { app_key: 'customer_app', title: 'Customer App', subtitle: 'Book Salons & Spa', description: 'Discover salons, book appointments, and earn rewards.', icon_name: 'Sparkles', route_path: '/', is_public: true, has_access: true },
      { app_key: 'jobs_app', title: 'Jobs Portal', subtitle: 'Find Beauty Jobs', description: 'Browse beauty industry jobs, apply, and manage your career.', icon_name: 'Briefcase', route_path: '/jobs', is_public: true, has_access: true },
      { app_key: 'owner_app', title: 'Shop Owner App', subtitle: 'Manage Your Salon', description: 'Manage bookings, staff, finances, and growth.', icon_name: 'Store', route_path: '/owner-dashboard', required_role: 'shop_owner', is_public: false, has_access: false },
      { app_key: 'partner_app', title: 'Growth Partner App', subtitle: 'Earn Commissions', description: 'Onboard salons, complete tasks, and earn payouts.', icon_name: 'Handshake', route_path: '/partner-dashboard', required_role: 'growth_partner', is_public: false, has_access: false },
      { app_key: 'brand_app', title: 'Brand & Distributor App', subtitle: 'B2B Supply Chain', description: 'Manage products, campaigns, and salon orders.', icon_name: 'Package', route_path: '/brand-dashboard', required_role: 'brand_partner', is_public: false, has_access: false },
      { app_key: 'admin_app', title: 'Super Admin App', subtitle: 'System Control', description: 'Manage the entire Nexora ecosystem.', icon_name: 'ShieldCheck', route_path: '/admin', required_role: 'super_admin', is_public: false, has_access: false }
    ]);
  };

  const handleOpenApp = async (app: any) => {
    if (app.has_access || app.is_public) {
      // Track usage event
      if (session) {
        try {
          await supabase.rpc('track_app_usage_event', {
            p_app_key: app.app_key,
            p_route_path: app.route_path,
            p_event_name: 'open',
            p_platform: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
            p_user_agent: navigator.userAgent
          });
        } catch (e) {
          console.error("Tracking error ignored", e);
        }
      }
      navigateTo(app.route_path);
    } else {
      if (!session) {
        navigateTo('/login');
      } else {
        // If they don't have access, maybe redirect to a request access or profile page
        // For now, route to the requested path which will handle the "unauthorized" or "register" flow
        navigateTo(app.route_path);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header Area */}
      <div className="bg-slate-900 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Nexora Apps</h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl">
            Apne role ke hisaab se direct app open karein. India's beauty industry growth ecosystem.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app, index) => {
            const Icon = IconMap[app.icon_name] || ArrowRight;
            return (
              <motion.div
                key={app.app_key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col h-full relative overflow-hidden group hover:border-blue-200 transition-colors cursor-pointer"
                onClick={() => handleOpenApp(app)}
              >
                {/* Badge */}
                <div className="absolute top-6 right-6">
                  {app.has_access || app.is_public ? (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                      Available
                    </span>
                  ) : !session ? (
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Login Required
                    </span>
                  ) : app.app_key === 'admin_app' ? (
                     <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Admin Only
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Role Required
                    </span>
                  )}
                </div>

                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7" />
                </div>

                <div className="space-y-2 flex-grow">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{app.title}</h3>
                  <p className="text-sm font-bold text-blue-600">{app.subtitle}</p>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium mt-3">
                    {app.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <button 
                    className={`font-black text-xs uppercase tracking-widest flex items-center gap-2 ${
                      app.has_access || app.is_public 
                        ? 'text-blue-600 hover:text-blue-700' 
                        : 'text-slate-400'
                    }`}
                  >
                    {app.has_access || app.is_public ? 'Open App' : (!session ? 'Login to Access' : 'Apply / Learn More')}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
