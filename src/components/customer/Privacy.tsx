import React, { useState } from "react";
import { 
  ArrowLeft, 
  Sparkles, 
  Search, 
  Clock, 
  Star, 
  User, 
  Shield, 
  FileText, 
  CalendarCheck, 
  Award, 
  Lock as LockIcon,
  ChevronRight,
  Info
} from "lucide-react";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

interface PrivacyProps {
  navigateTo: (path: string) => void;
}

type TabType = "Privacy" | "Terms" | "Booking Rules" | "Rewards" | "Safety";

const Privacy = ({ navigateTo }: PrivacyProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("Privacy");

  const tabs: { id: TabType; icon: any }[] = [
    { id: "Privacy", icon: Shield },
    { id: "Terms", icon: FileText },
    { id: "Booking Rules", icon: CalendarCheck },
    { id: "Rewards", icon: Award },
    { id: "Safety", icon: LockIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <TopBar 
        title="Privacy & Terms" 
        subtitle="Important customer information for using Nexora SalonOS"
        onBack={() => navigateTo("/profile")} 
        showHome={true}
        onHome={() => navigateTo("/customer")}
        showMainSite={true}
        onMainSite={() => navigateTo("/")}
      />

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 sticky top-[68px] z-10 overflow-x-auto no-scrollbar">
        <div className="flex p-2 gap-2 min-w-max px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold transition whitespace-nowrap ${
                activeTab === tab.id 
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              <tab.icon className="w-3 h-3" />
              {tab.id}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Privacy Section */}
        {activeTab === "Privacy" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-sm font-black text-slate-900 ml-1">Privacy Policy</h2>
            
            <div className="space-y-3">
              {[
                { title: "Personal Information", text: "Nexora may store your name, email, mobile number, city, area and profile details to provide customer account and booking experience." },
                { title: "Booking Information", text: "Your booking-related information will be used to show appointments, reminders and booking history when booking backend is connected." },
                { title: "Location Information", text: "City and area help Nexora show nearby salons and relevant services." },
                { title: "Data Control", text: "Customers can update basic profile details from the profile section." }
              ].map((card, i) => (
                <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Terms Section */}
        {activeTab === "Terms" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-sm font-black text-slate-900 ml-1">Customer Terms</h2>
            
            <div className="space-y-3">
              {[
                { title: "Account Use", text: "Customers should use correct personal details while signing up and booking salon services." },
                { title: "Service Information", text: "Salon prices, services, staff and availability will be shown based on partner salon data when real shop backend is connected." },
                { title: "Platform Role", text: "Nexora helps customers discover salons and book faster. Actual service delivery is provided by the selected salon." }
              ].map((card, i) => (
                <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking Rules Section */}
        {activeTab === "Booking Rules" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-sm font-black text-slate-900 ml-1">Booking Rules</h2>
            
            <div className="grid gap-3">
              {[
                "Select correct service, staff, date and time",
                "Arrive at least 10 minutes early",
                "Booking confirmation will be connected in backend steps",
                "Cancellation and reschedule rules will be added when real booking system is live"
              ].map((rule, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                    <ChevronRight className="w-3 h-3" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-700 mt-1">{rule}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rewards Section */}
        {activeTab === "Rewards" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-sm font-black text-slate-900 ml-1">Rewards & QR Notes</h2>
            
            <div className="grid gap-3">
              {[
                "Rewards will be connected with Nexora QR module later",
                "Reward points will apply only after eligible QR payment",
                "Cashback/rewards are not cash withdrawal",
                "Real reward rules will be controlled by Nexora admin"
              ].map((note, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3">
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                    <Award className="w-3 h-3" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-700 mt-1">{note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safety Section */}
        {activeTab === "Safety" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-sm font-black text-slate-900 ml-1">Customer Safety</h2>
            
            <div className="grid gap-3">
              {[
                "Choose verified salons",
                "Check price and service before booking",
                "Report salon issues from Help & Support",
                "Keep booking confirmation available during visit"
              ].map((safety, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                    <LockIcon className="w-3 h-3" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-700 mt-1">{safety}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated Card */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-900/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/10 rounded-xl">
              <Info className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
              <p className="text-xs font-black">Draft Version</p>
            </div>
          </div>
          
          <p className="text-[10px] text-slate-400 italic leading-relaxed mb-4">
            “This page is a UI draft. Final legal policy text will be reviewed before public launch.”
          </p>
          
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <p className="text-[10px] font-bold text-slate-500">Last updated</p>
            <p className="text-[10px] font-black text-blue-400">July 2026</p>
          </div>
        </div>
      </div>

      <BottomNav currentPath="/privacy" navigateTo={navigateTo} />
    </div>
  );
};

export default Privacy;
