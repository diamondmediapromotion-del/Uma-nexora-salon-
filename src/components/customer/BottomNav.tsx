import React from "react";
import { Sparkles, Search, Clock, Star, User } from "lucide-react";

interface BottomNavProps {
  currentPath: string;
  navigateTo: (path: string) => void;
}

const BottomNav = ({ currentPath, navigateTo }: BottomNavProps) => {
  const tabs = [
    { icon: Sparkles, label: "Home", path: "/customer", match: ["/customer", "/salon/*"] },
    { icon: Clock, label: "Bookings", path: "/my-bookings", match: ["/my-bookings", "/booking/*", "/booking/details/*"] },
    { icon: Star, label: "Rewards", path: "/rewards", match: ["/rewards"] },
    { icon: User, label: "Profile", path: "/profile", match: ["/profile", "/profile/edit", "/notifications", "/support", "/privacy", "/settings"] },
  ];

  const isActive = (match: string[]) => {
    return match.some(m => {
      if (m.endsWith("/*")) {
        return currentPath.startsWith(m.slice(0, -2));
      }
      return currentPath === m;
    });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around p-3 z-50">
      {tabs.map((item) => (
        <button 
          key={item.label} 
          onClick={() => navigateTo(item.path)} 
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${
            isActive(item.match) ? "text-blue-600 scale-110" : "text-slate-400 hover:text-slate-500"
          }`}
        >
          <item.icon className={`w-5 h-5 ${isActive(item.match) ? "fill-blue-50/50" : ""}`} />
          <span className={`text-[10px] font-bold ${isActive(item.match) ? "opacity-100" : "opacity-80"}`}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
