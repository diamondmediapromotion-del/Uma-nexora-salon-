import React, { useState, useEffect } from "react";
import { ArrowLeft, LogOut, Award, User, Clock, Star, MapPin, ChevronRight, Bell, HelpCircle, Shield, Settings, Scissors, Sparkles, Search, Heart } from "lucide-react";
import { supabase } from "../../lib/supabase";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

import { getShopImage } from "../../lib/shopUtils";
import AppOnboardingChecklist from "../apps/AppOnboardingChecklist";

interface ProfileProps {
  navigateTo: (path: string) => void;
}

const Profile = ({ navigateTo }: ProfileProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rewardData, setRewardData] = useState<any>(null); // Added
  const [membership, setMembership] = useState<any>(null);
  const [referralData, setReferralData] = useState<any>(null);
  const [reviewsCount, setReviewsCount] = useState<number>(0);
  const [bookingsCount, setBookingsCount] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [debugInfo, setDebugInfo] = useState<{ userId: string; favCount: number | null }>({ userId: "Not Authenticated", favCount: null });
  const [savedSalons, setSavedSalons] = useState<any[]>([]);
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setDebugInfo(prev => ({ ...prev, userId: user.id }));
        
        // Fetch profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);

        // Fetch stats, referral data and membership in parallel
        const [favsRes, reviewsRes, bookingsRes, rewardRes, refCodeRes, refEventsRes, membershipRes] = await Promise.all([
          supabase.from('customer_favourites').select('shop_id').eq('customer_id', user.id),
          supabase.from('customer_reviews').select('*', { count: 'exact', head: true }).eq('customer_id', user.id),
          supabase.from('customer_bookings').select('*', { count: 'exact', head: true }).eq('customer_id', user.id),
          supabase.from('customer_reward_wallets').select('*').eq('customer_id', user.id).maybeSingle(),
          supabase.rpc("generate_customer_referral_code", { customer_id: user.id }),
          supabase.from('customer_referral_events').select('*').eq('referrer_id', user.id),
          supabase.from('customer_memberships').select('*, membership_plans(*)').eq('customer_id', user.id).maybeSingle()
        ]);
        
        if (!rewardRes.error && rewardRes.data) {
          setRewardData(rewardRes.data);
        }
        
        setReferralData({
            code: refCodeRes.data,
            events: refEventsRes.data || []
        });
        
        if (membershipRes.data) {
            setMembership(membershipRes.data);
        } else {
            // If missing, ensure it
            await supabase.rpc("ensure_customer_membership", { customer_id: user.id });
            const { data } = await supabase.from('customer_memberships').select('*, membership_plans(*)').eq('customer_id', user.id).maybeSingle();
            setMembership(data);
        }
        
        if (!favsRes.error && favsRes.data) {
          setDebugInfo(prev => ({ ...prev, favCount: favsRes.data.length }));
          
          if (favsRes.data.length > 0) {
            const shopIds = favsRes.data.map(f => f.shop_id);
            const { data: shopsData } = await supabase
              .from('shops')
              .select('id, shop_name, category, area, city, rating, starting_price, is_verified, is_open, cover_image_url')
              .in('id', shopIds);
              
            if (shopsData) {
              setSavedSalons(shopsData);
            }
          }
        }

        if (!reviewsRes.error) {
          setReviewsCount(reviewsRes.count || 0);
        }

        if (!bookingsRes.error) {
          setBookingsCount(bookingsRes.count || 0);
          
          // Also count completed bookings
          const { count: compCount } = await supabase
            .from('customer_bookings')
            .select('*', { count: 'exact', head: true })
            .eq('customer_id', user.id)
            .eq('status', 'completed');
          
          setCompletedCount(compCount || 0);
        }
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigateTo("/login");
  };

  const removeSavedSalon = async (shopId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setSavedSalons(prev => prev.filter(s => s.id !== shopId));
    setDebugInfo(prev => ({ ...prev, favCount: (prev.favCount || 1) - 1 }));
    setLocalMessage("Salon removed from saved.");
    
    try {
      await supabase
        .from("customer_favourites")
        .delete()
        .eq("customer_id", user.id)
        .eq("shop_id", shopId);
    } catch (err) {
      console.error("Error removing fav", err);
    }
    
    setTimeout(() => {
      setLocalMessage(null);
    }, 3000);
  };

  const menuItems = [
    { icon: User, label: "Edit Profile", path: "/profile/edit" },
    { icon: Clock, label: "My Bookings", path: "/my-bookings" },
    { icon: Star, label: "Rewards", path: "/rewards" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: HelpCircle, label: "Help & Support", path: "/support" },
    { icon: Shield, label: "Privacy & Terms", path: "/privacy" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      {localMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-fade-in pointer-events-none">
          <div className="bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-slate-900/20">
            {localMessage}
          </div>
        </div>
      )}
      <TopBar 
        title="My Profile" 
        onBack={() => navigateTo("/customer")} 
        showHome={true}
        onHome={() => navigateTo("/customer")}
        showMainSite={true}
        onMainSite={() => navigateTo("/")}
      />

      <div className="px-4 py-6 space-y-6">
        
        {/* Onboarding Checklist */}
        <AppOnboardingChecklist appKey="customer_app" />

        {/* Profile Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-xl overflow-hidden border border-slate-100">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profile?.full_name ? profile.full_name[0] : "N"
                )}
            </div>
            <div className="flex-1">
                <h2 className="font-bold text-slate-900">{profile?.full_name || "Nexora Customer"}</h2>
                <p className="text-xs text-slate-500">{profile?.email || "No email"}</p>
                <p className="text-[10px] text-blue-600 font-bold mt-1">Customer</p>
            </div>
        </div>

        {/* Verification Debug Section */}
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm">
            <h3 className="text-[10px] text-amber-800 font-bold uppercase mb-2">Supabase Verification</h3>
            <div className="space-y-1">
                <p className="text-[10px] text-slate-600">
                    <span className="font-bold">Profile ID:</span> {debugInfo.userId}
                </p>
                <p className="text-[10px] text-slate-600">
                    <span className="font-bold">Favourites Count:</span> {debugInfo.favCount !== null ? (debugInfo.favCount === -1 ? "Error" : debugInfo.favCount) : "Loading..."}
                </p>
            </div>
        </div>

        {/* Membership Card */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl text-white shadow-lg">
              <div className="flex justify-between items-start mb-4">
                  <div>
                      <p className="text-[10px] opacity-80 font-bold uppercase">Current Level</p>
                      <p className="font-black text-lg">Gold Member</p>
                  </div>
                  <Award className="w-6 h-6 text-amber-300" />
              </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-3xl text-white shadow-lg">
              <div className="flex justify-between items-start mb-4">
                  <div>
                      <p className="text-[10px] opacity-80 font-bold uppercase">Rewards</p>
                      <p className="font-black text-lg">₹{rewardData?.balance || 0}</p>
                  </div>
                  <Sparkles className="w-6 h-6 text-yellow-300" />
              </div>
              <button onClick={() => navigateTo("/rewards")} className="w-full py-2 bg-white/20 rounded-xl text-[10px] font-bold">View Rewards</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
            {[
              {label: "Total Bookings", val: bookingsCount.toString()}, 
              {label: "Completed Visits", val: completedCount.toString()}, 
              {label: "Favourite Salons", val: (debugInfo.favCount || 0).toString()}, 
              {label: "Reviews Given", val: reviewsCount.toString()}
            ].map(stat => (
                <div key={stat.label} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] text-slate-500 font-bold">{stat.label}</p>
                    <p className="font-black text-lg text-slate-900">{stat.val}</p>
                </div>
            ))}
        </div>

        {/* Membership Card */}
        {membership && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Membership Card</h3>
                <div className={`p-6 rounded-3xl text-white shadow-lg ${
                    membership.membership_plans.name === 'Platinum' ? 'bg-gradient-to-br from-slate-700 to-slate-900' :
                    membership.membership_plans.name === 'Gold' ? 'bg-gradient-to-br from-amber-500 to-amber-700' :
                    'bg-gradient-to-br from-slate-400 to-slate-600'
                }`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[10px] opacity-80 font-bold uppercase">{membership.membership_plans.name} Member</p>
                            <p className="font-black text-lg">{membership.membership_plans.discount_percent}% Discount</p>
                        </div>
                        <Award className="w-6 h-6 text-white/50" />
                    </div>
                </div>
            </div>
        )}
        
        {/* Referral Section */}
        {referralData && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Invite Friends</h3>
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-600">Your Code: <span className="text-blue-600">{referralData.code}</span></p>
                  <button onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/sign-up?ref=${referralData.code}`);
                      setLocalMessage("Referral link copied!");
                  }} className="text-[10px] font-bold bg-white px-3 py-1.5 rounded-lg border border-slate-200">Copy Link</button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 p-3 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400">Total</p>
                      <p className="font-black text-sm">{referralData.events.length}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400">Pending</p>
                      <p className="font-black text-sm">{referralData.events.filter((e: any) => e.status === 'pending').length}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400">Rewarded</p>
                      <p className="font-black text-sm">{referralData.events.filter((e: any) => e.status === 'rewarded').length}</p>
                  </div>
              </div>
          </div>
        )}

        {/* Favourites */}
        <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3">Saved Salons</h3>
            {savedSalons.length > 0 ? (
              <div className="space-y-4">
                  {savedSalons.map(s => (
                      <div key={s.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group">
                          <div className="relative h-32 bg-slate-100">
                              <img src={getShopImage(s)} alt={s.shop_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <div className="absolute top-2 left-2 flex gap-1">
                                {s.is_verified && (
                                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                                    Verified
                                  </span>
                                )}
                                {s.is_open ? (
                                  <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider">Open</span>
                                ) : (
                                  <span className="bg-slate-500 text-white px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider">Closed</span>
                                )}
                              </div>
                              <button
                                onClick={() => removeSavedSalon(s.id)}
                                className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-sm transition-all z-10 cursor-pointer"
                              >
                                <span className="text-xs text-rose-500 font-bold px-1">Remove</span>
                              </button>
                          </div>
                          
                          <div className="p-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-bold text-slate-900 text-base leading-tight">{s.shop_name}</h3>
                              <div className="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                                <Star className="w-2.5 h-2.5 fill-amber-600" />
                                <span className="text-[10px] font-bold">{s.rating}</span>
                              </div>
                            </div>
                            
                            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide flex items-center gap-1 mb-3">
                              <span>{s.category.replace('_', ' ')}</span>
                              <span>•</span>
                              <span>{s.area}, {s.city}</span>
                            </p>
                            
                            <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between mb-3">
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Starting from</p>
                                <p className="font-black text-slate-900 text-xs">₹{s.starting_price}</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <button 
                                onClick={() => navigateTo(`/salon/${s.id}`)} 
                                className="flex-1 py-2 text-[10px] font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                View Salon
                              </button>
                              <button 
                                onClick={() => navigateTo(`/booking/${s.id}`)} 
                                className="flex-1 py-2 text-[10px] font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all cursor-pointer"
                              >
                                Book Now
                              </button>
                            </div>
                          </div>
                      </div>
                  ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-200 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-3">
                  <Heart className="w-6 h-6 text-rose-300" />
                </div>
                <p className="text-sm font-bold text-slate-900 mb-1">No saved salons yet</p>
                <p className="text-[10px] text-slate-500 font-medium mb-4">Tap the heart icon on any salon to save it here.</p>
                <button 
                  onClick={() => navigateTo("/customer")}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  Find Salons
                </button>
              </div>
            )}
        </div>

        {/* Account Options */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
            {menuItems.map(item => (
                <button key={item.label} onClick={() => navigateTo(item.path)} className="w-full p-4 flex items-center justify-between border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
            ))}
            <button onClick={handleLogout} className="w-full p-4 flex items-center justify-between border-t border-slate-50 hover:bg-rose-50 transition-colors">
                <div className="flex items-center gap-3">
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-bold text-rose-600">Logout</span>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-300" />
            </button>
        </div>
      </div>

      <BottomNav currentPath="/profile" navigateTo={navigateTo} />
    </div>
  );
};

export default Profile;
