import React, { useState } from "react";
import { ArrowLeft, Sparkles, Search, Clock, Star, User, Gift, Copy, Share2, Award, Zap, QrCode } from "lucide-react";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

interface RewardsProps {
  navigateTo: (path: string) => void;
}

const RewardHistoryData = [
    { salon: "Chique Salon & Luxury Spa", points: 35, date: "Today", status: "Earned" },
    { salon: "Royal Touch Salon", points: 20, date: "Last Week", status: "Earned" },
    { salon: "Referral Bonus", points: 50, date: "Last Month", status: "Pending" },
];

const Rewards = ({ navigateTo }: RewardsProps) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <TopBar 
        title="Rewards" 
        subtitle="Earn benefits when you visit Nexora partner salons"
        onBack={() => navigateTo("/customer")} 
        showHome={true}
        onHome={() => navigateTo("/customer")}
        showMainSite={true}
        onMainSite={() => navigateTo("/")}
      />

      <div className="px-4 py-6 space-y-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-lg shadow-blue-500/20">
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Reward Points</p>
            <p className="text-4xl font-black mb-1">1,250</p>
            <p className="text-[10px] font-medium opacity-80 mb-6">Use your points at Nexora partner salons after QR payment module is live.</p>
            <div className="bg-white/20 p-3 rounded-xl flex items-center justify-between backdrop-blur-sm">
                <div>
                    <p className="text-[10px] font-bold opacity-80">Membership Level</p>
                    <p className="font-bold text-sm">Gold Member</p>
                </div>
                <Award className="w-6 h-6 text-amber-300" />
            </div>
        </div>

        {/* Membership Levels */}
        <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3">Membership Levels</h3>
            <div className="grid grid-cols-3 gap-3">
                {["Silver", "Gold", "Platinum"].map((level, i) => (
                    <div key={level} className={`p-3 rounded-2xl border ${i === 1 ? "bg-white border-blue-500 shadow-blue-50" : "bg-white border-slate-100"} shadow-sm`}>
                        <p className={`text-[10px] font-bold ${i === 1 ? "text-blue-600" : "text-slate-400"}`}>{level}</p>
                        <p className="text-[10px] text-slate-600 font-medium">{[5, 10, 15][i]}% benefits</p>
                    </div>
                ))}
            </div>
        </div>

        {/* QR Rewards */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><QrCode className="w-5 h-5" /></div>
                <h3 className="font-bold text-slate-900 text-sm">QR Rewards</h3>
            </div>
            <p className="text-[10px] text-slate-500">Scan Nexora QR at partner salons and earn rewards after payment.</p>
            <div className="grid grid-cols-2 gap-2 text-center">
                {["Scan QR", "Pay", "Earn", "Redeem"].map(s => <div key={s} className="bg-slate-50 p-2 rounded-lg text-[10px] font-bold text-slate-600">{s}</div>)}
            </div>
            <p className="text-[9px] text-slate-400 italic">“QR payment and real rewards will be connected in backend steps.”</p>
        </div>

        {/* Referral */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Invite Friends</h3>
            <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl">
                <span className="font-mono font-bold text-slate-900 text-sm">NEXORA1250</span>
                <button onClick={copyCode} className="text-blue-600"><Copy className="w-4 h-4" /></button>
            </div>
            {copied && <p className="text-[10px] text-emerald-600 font-bold">Referral code copied.</p>}
            <button onClick={() => alert("WhatsApp sharing will be connected later.")} className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
                <Share2 className="w-4 h-4" /> Share on WhatsApp
            </button>
        </div>

        {/* History */}
        <div>
             <h3 className="font-bold text-slate-900 text-sm mb-3">Reward History</h3>
             <div className="space-y-2">
                {RewardHistoryData.map((b, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="font-bold text-slate-900 text-xs">{b.salon}</p>
                            <p className="text-[10px] text-slate-400">{b.date}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-emerald-600 text-xs">+{b.points} pts</p>
                            <p className="text-[9px] text-slate-400 font-bold">{b.status}</p>
                        </div>
                    </div>
                ))}
             </div>
        </div>
      </div>

      <BottomNav currentPath="/rewards" navigateTo={navigateTo} />
    </div>
  );
};

export default Rewards;
