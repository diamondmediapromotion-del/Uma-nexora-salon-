import React, { useState } from "react";
import { 
  ArrowLeft, 
  Sparkles, 
  Search, 
  Clock, 
  Star, 
  User, 
  ChevronRight, 
  Bell, 
  Globe, 
  Shield, 
  Lock as LockIcon, 
  Settings as SettingsIcon, 
  LogOut, 
  AlertTriangle,
  Smartphone,
  Eye,
  Trash2
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

interface SettingsProps {
  navigateTo: (path: string) => void;
}

const Settings = ({ navigateTo }: SettingsProps) => {
  const [notifications, setNotifications] = useState({
    bookingReminders: true,
    rewardUpdates: true,
    salonOffers: false,
    referralUpdates: true,
    appAnnouncements: false
  });

  const [appPrefs, setAppPrefs] = useState({
    darkMode: false,
    nearbyRecs: true,
    autoLocation: true,
    rewardReminders: true
  });

  const [language, setLanguage] = useState("English");

  const handleToggle = (key: string, type: 'notif' | 'app') => {
    if (type === 'notif') {
      setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof notifications] }));
    } else {
      setAppPrefs(prev => ({ ...prev, [key]: !prev[key as keyof typeof appPrefs] }));
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    alert("Language preference UI ready. Real language settings will be connected later.");
  };

  const handlePrivacyAction = () => {
    alert("This privacy action will be connected later.");
  };

  const handleSecurityAction = () => {
    alert("Security settings will be connected later.");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigateTo("/login");
  };

  const handleDeleteRequest = () => {
    alert("Account deletion request UI ready. Real deletion flow will be connected later.");
  };

  const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
    <button 
      onClick={onToggle}
      className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${active ? 'bg-blue-600' : 'bg-slate-200'}`}
    >
      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${active ? 'left-6' : 'left-1'}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <TopBar 
        title="Account Settings" 
        subtitle="Manage your Nexora customer preferences"
        onBack={() => navigateTo("/profile")} 
        showHome={true}
        onHome={() => navigateTo("/customer")}
        showMainSite={true}
        onMainSite={() => navigateTo("/")}
      />

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Account Section */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Account</h2>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {[
              { icon: User, label: "Edit Profile", path: "/profile/edit" },
              { icon: Clock, label: "My Bookings", path: "/my-bookings" },
              { icon: Star, label: "Rewards", path: "/rewards" },
              { icon: Bell, label: "Notifications", path: "/notifications" },
            ].map((item, idx) => (
              <button 
                key={idx} 
                onClick={() => navigateTo(item.path)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 text-slate-600 rounded-xl">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>
            ))}
          </div>
        </section>

        {/* Notification Preferences */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Notifications</h2>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-2">
            {[
              { label: "Booking reminders", key: "bookingReminders" },
              { label: "Reward updates", key: "rewardUpdates" },
              { label: "Salon offers", key: "salonOffers" },
              { label: "Referral updates", key: "referralUpdates" },
              { label: "App announcements", key: "appAnnouncements" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0">
                <span className="text-xs font-bold text-slate-700">{item.label}</span>
                <Toggle 
                  active={notifications[item.key as keyof typeof notifications]} 
                  onToggle={() => handleToggle(item.key, 'notif')} 
                />
              </div>
            ))}
          </div>
        </section>

        {/* Language Preference */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Language</h2>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 flex gap-3">
            {["English", "Hindi"].map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`flex-1 py-3 rounded-2xl text-[10px] font-bold transition ${
                  language === lang 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                  : "bg-slate-50 text-slate-500 border border-slate-100"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </section>

        {/* Privacy & Security */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Privacy & Security</h2>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {[
              { icon: Shield, label: "Manage personal data", action: handlePrivacyAction },
              { icon: Eye, label: "Download account data", action: handlePrivacyAction },
              { icon: LockIcon, label: "Change Password", action: handleSecurityAction },
              { icon: Smartphone, label: "Login Activity", action: handleSecurityAction },
            ].map((item, idx) => (
              <button 
                key={idx} 
                onClick={item.action}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 text-slate-600 rounded-xl">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>
            ))}
          </div>
        </section>

        {/* App Preferences */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">App Preferences</h2>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-2">
            {[
              { label: "Enable dark mode", key: "darkMode" },
              { label: "Nearby salon recommendations", key: "nearbyRecs" },
              { label: "Auto location suggestion", key: "autoLocation" },
              { label: "Show rewards reminders", key: "rewardReminders" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0">
                <span className="text-xs font-bold text-slate-700">{item.label}</span>
                <Toggle 
                  active={appPrefs[item.key as keyof typeof appPrefs]} 
                  onToggle={() => handleToggle(item.key, 'app')} 
                />
              </div>
            ))}
          </div>
        </section>

        {/* Logout Section */}
        <div className="pt-4">
          <button 
            onClick={handleLogout}
            className="w-full p-4 bg-white border border-rose-100 rounded-3xl text-rose-600 font-black text-sm flex items-center justify-center gap-2 hover:bg-rose-50 transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Danger Zone */}
        <section className="pt-6">
          <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-rose-900">Delete Account</h3>
                <p className="text-[10px] text-rose-700 opacity-70">Deleting account will be added after final policy.</p>
              </div>
            </div>
            <button 
              onClick={handleDeleteRequest}
              className="w-full py-4 bg-white border border-rose-200 text-rose-600 rounded-2xl text-xs font-black hover:bg-rose-100 transition flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Request Account Delete
            </button>
          </div>
        </section>
      </div>

      <BottomNav currentPath="/settings" navigateTo={navigateTo} />
    </div>
  );
};

export default Settings;
