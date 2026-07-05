import React from "react";
import { ArrowLeft, Home, Globe, LogOut } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  onHome?: () => void;
  showHome?: boolean;
  onMainSite?: () => void;
  showMainSite?: boolean;
  onLogout?: () => void;
  showLogout?: boolean;
}

const TopBar = ({ 
  title, 
  subtitle, 
  onBack, 
  showBack = true,
  onHome,
  showHome = false,
  onMainSite,
  showMainSite = false,
  onLogout,
  showLogout = false
}: TopBarProps) => {
  return (
    <header className="sticky top-0 bg-white/90 backdrop-blur-md px-4 py-3 flex items-center border-b border-slate-100 z-40 shadow-sm">
      <div className="flex items-center gap-1 shrink-0">
        {showBack && (
          <button 
            onClick={onBack} 
            className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors group"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
        )}
        {showHome && (
          <button 
            onClick={onHome} 
            className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors"
            title="Customer Home"
          >
            <Home className="w-5 h-5" />
          </button>
        )}
        {showMainSite && (
          <button 
            onClick={onMainSite} 
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Main Website"
          >
            <Globe className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 text-center px-2">
        <h1 className="text-sm font-black text-slate-900 tracking-tight truncate">{title}</h1>
        {subtitle && <p className="text-[10px] text-slate-500 font-medium truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-1 shrink-0 min-w-[40px] justify-end">
        {showLogout && (
          <button 
            onClick={onLogout} 
            className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
};

export default TopBar;
