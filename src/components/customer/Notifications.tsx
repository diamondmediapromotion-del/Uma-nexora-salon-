import React from "react";
import { Bell, Calendar, Gift, Star, Info, ChevronRight, Sparkles, Search, Clock, User } from "lucide-react";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

interface CustomerNotificationsProps {
  navigateTo: (path: string) => void;
}

const NOTIFICATIONS_DATA = [
  {
    id: 1,
    type: "booking",
    title: "Booking Confirmed",
    message: "Your appointment at Chique Salon is confirmed for today at 10:30 AM.",
    time: "2 mins ago",
    read: false,
    icon: Calendar,
    color: "text-blue-600 bg-blue-50"
  },
  {
    id: 2,
    type: "reward",
    title: "Points Earned!",
    message: "You earned 35 Nexora points from your last visit. Keep it up!",
    time: "2 hours ago",
    read: false,
    icon: Gift,
    color: "text-emerald-600 bg-emerald-50"
  },
  {
    id: 3,
    type: "system",
    title: "Welcome to Nexora",
    message: "Start exploring Jaipur's best salons and earn rewards on every booking.",
    time: "1 day ago",
    read: true,
    icon: Sparkles,
    color: "text-purple-600 bg-purple-50"
  },
  {
    id: 4,
    type: "promo",
    title: "Weekend Special",
    message: "Get extra 10% rewards on all hair spa services this weekend.",
    time: "2 days ago",
    read: true,
    icon: Star,
    color: "text-amber-600 bg-amber-50"
  }
];

const CustomerNotifications = ({ navigateTo }: CustomerNotificationsProps) => {
  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <TopBar 
        title="Notifications" 
        subtitle="Stay updated with your Nexora activity"
        onBack={() => navigateTo("/profile")} 
        showHome={true}
        onHome={() => navigateTo("/customer")}
        showMainSite={true}
        onMainSite={() => navigateTo("/")}
      />

      <div className="max-w-md mx-auto p-4 space-y-4">
        {NOTIFICATIONS_DATA.length > 0 ? (
          <div className="space-y-3">
            {NOTIFICATIONS_DATA.map((n) => {
              const Icon = n.icon;
              return (
                <div 
                  key={n.id} 
                  className={`bg-white p-4 rounded-2xl border ${n.read ? "border-slate-100" : "border-blue-100 shadow-sm shadow-blue-50"} flex gap-4 transition-all`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className={`text-sm font-bold ${n.read ? "text-slate-700" : "text-slate-900"}`}>{n.title}</h3>
                      <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
                    {!n.read && (
                      <div className="pt-1">
                        <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <Bell className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">No Notifications</h3>
              <p className="text-xs text-slate-500 max-w-[200px] mx-auto">We'll notify you about bookings, rewards, and more.</p>
            </div>
            <button 
              onClick={() => navigateTo("/customer")}
              className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Explore Salons
            </button>
          </div>
        )}
      </div>

      <BottomNav currentPath="/notifications" navigateTo={navigateTo} />
    </div>
  );
};

export default CustomerNotifications;
