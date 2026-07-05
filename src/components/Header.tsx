import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Menu, X, ArrowRight, ShieldCheck, HelpCircle, Loader2, User, ChevronDown, Settings, LogOut, Briefcase } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { dispatchPopState } from "../utils/navigation";
import { supabase } from "../lib/supabase";

interface HeaderProps {
  onOpenModal: (type: "login" | "register" | "book" | "partner" | "distributor" | "jobs") => void;
  activeSection?: string;
  onNavigateSection?: (sectionId: string) => void;
}

export default function Header({ onOpenModal, activeSection, onNavigateSection }: HeaderProps) {
  const { session } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);
  const [profile, setProfile] = useState<{
    full_name: string | null;
    email: string | null;
    role: string | null;
    avatar_url: string | null;
  } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setProfile(null);
      return;
    }

    let isMounted = true;
    const loadProfile = async () => {
      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, email, role, avatar_url")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching header profile:", error);
        } else if (data && isMounted) {
          setProfile(data);
        }
      } catch (err) {
        console.error("Error loading header profile:", err);
      } finally {
        if (isMounted) setProfileLoading(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);

  const displayName = profile?.full_name || "Nexora User";
  const displayEmail = profile?.email || session?.user?.email || "";
  const avatarLetter = (displayName ? displayName[0] : (displayEmail ? displayEmail[0] : "N")).toUpperCase();

  const getRoleBasedItem = (role: string | null | undefined) => {
    switch (role) {
      case "customer":
        return { label: "Customer App", path: "/customer" };
      case "shop_owner":
        return { label: "Owner Dashboard", path: "/owner-register" };
      case "growth_partner":
        return { label: "Growth Partner Dashboard", path: "/growth-partner" };
      case "distributor":
        return { label: "Brand Portal", path: "/distributor-brand" };
      case "super_admin":
        return { label: "Admin Panel", path: "/admin" };
      default:
        return { label: "Customer App", path: "/customer" };
    }
  };

  const navItems = [
    { label: "Apps", id: "apps", path: "/apps" },
    { label: "Customers", id: "customers", path: "/customer" },
    { label: "Salon Owners", id: "owners", path: "/owner-register" },
    { label: "Growth Partner", id: "growth", path: "/growth-partner" },
    { label: "Distributor & Brand", id: "brands", path: "/distributor-brand" },
    { label: "Jobs", id: "jobs", path: "/jobs" }
  ];

  const handleRouteNavigate = (path: string) => {
    setIsMobileMenuOpen(false);
    window.history.pushState({}, "", path);
    dispatchPopState();
    window.scrollTo(0, 0);
  };

  const handleLinkClick = (id: string) => {
    setIsMobileMenuOpen(false);
    
    // If not on "/", navigate to home first, then scroll
    if (window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
      dispatchPopState();
      setTimeout(() => {
        if (onNavigateSection) {
          onNavigateSection(id);
        } else {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }, 150);
      return;
    }

    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md border-b border-slate-200/50 py-3 shadow-sm shadow-slate-100/10"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div
              onClick={() => handleLinkClick("top")}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                N
              </div>
              <div>
                <span className="font-display font-bold text-lg tracking-tight text-slate-900 flex items-center gap-1">
                  Nexora <span className="text-blue-600 text-xs font-semibold px-1.5 py-0.5 bg-blue-50 rounded-md border border-blue-100">SalonOS</span>
                </span>
                <span className="block text-[9px] text-slate-400 font-medium tracking-wider uppercase -mt-1">
                  India's Beauty SaaS
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav id="header-nav" className="hidden md:flex items-center gap-1 lg:gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleRouteNavigate(item.path)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    window.location.pathname === item.path || (window.location.pathname === "/" && activeSection === item.id)
                      ? "text-blue-600 bg-blue-50/50"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {/* TEMP_ADMIN_TEST_BUTTON_REMOVE_LATER */}
              <button
                onClick={() => handleRouteNavigate("/admin")}
                className="px-3 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer"
              >
                Admin Panel
              </button>
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-all cursor-pointer"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={displayName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                        {avatarLetter}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-slate-800 max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <>
                        {/* Backdrop to close dropdown on outside click */}
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-56 bg-white border border-slate-150 rounded-2xl shadow-xl z-50 py-2 origin-top-right overflow-hidden font-sans"
                        >
                          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                            <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                            <p className="text-sm font-bold text-slate-800 truncate">{displayName}</p>
                            <p className="text-[11px] text-slate-500 truncate">{displayEmail}</p>
                          </div>

                          <div className="p-1">
                            {/* Role based action */}
                            {profile?.role && (
                              <button
                                onClick={() => {
                                  setIsDropdownOpen(false);
                                  handleRouteNavigate(getRoleBasedItem(profile.role).path);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-black uppercase tracking-wider text-blue-600 hover:bg-blue-50/60 rounded-xl transition-colors text-left font-sans"
                              >
                                <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                                {getRoleBasedItem(profile.role).label}
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setIsDropdownOpen(false);
                                handleRouteNavigate("/profile");
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-xl transition-colors text-left font-sans"
                            >
                              <User className="w-4 h-4 text-slate-400 shrink-0" />
                              My Profile
                            </button>

                            <button
                              onClick={() => {
                                setIsDropdownOpen(false);
                                handleRouteNavigate("/job-seeker-dashboard");
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-xl transition-colors text-left font-sans"
                            >
                              <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                              Jobs Dashboard
                            </button>

                            <button
                              onClick={() => {
                                setIsDropdownOpen(false);
                                handleRouteNavigate("/settings");
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-xl transition-colors text-left font-sans"
                            >
                              <Settings className="w-4 h-4 text-slate-400 shrink-0" />
                              Settings
                            </button>

                            <div className="border-t border-slate-100 my-1" />

                            <button
                              onClick={async () => {
                                setIsDropdownOpen(false);
                                const { error } = await supabase.auth.signOut();
                                if (!error) {
                                  handleRouteNavigate("/login");
                                }
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left font-sans"
                            >
                              <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                              Logout
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleRouteNavigate("/login")}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      if (isSignUpLoading) return;
                      setIsSignUpLoading(true);
                      setTimeout(() => {
                        handleRouteNavigate("/sign-up");
                        setIsSignUpLoading(false);
                      }, 800);
                    }}
                    disabled={isSignUpLoading}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer shadow-md shadow-blue-600/10 hover:shadow-lg flex items-center justify-center gap-1.5 min-w-[110px] disabled:opacity-85"
                  >
                    {isSignUpLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Wait...</span>
                      </>
                    ) : (
                      <>
                        Sign Up
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Mobile Hamburger button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => {
                  if (isSignUpLoading) return;
                  setIsSignUpLoading(true);
                  setTimeout(() => {
                    handleRouteNavigate("/sign-up");
                    setIsSignUpLoading(false);
                  }, 800);
                }}
                disabled={isSignUpLoading}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center justify-center gap-1 min-w-[76px] disabled:opacity-85"
              >
                {isSignUpLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-white" />
                    <span>Wait...</span>
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-30 md:hidden bg-white border-b border-slate-200 shadow-xl p-5 space-y-4"
          >
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
                Explore Platforms
              </p>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleRouteNavigate(item.path)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                    window.location.pathname === item.path || (window.location.pathname === "/" && activeSection === item.id)
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                </button>
              ))}
              {/* TEMP_ADMIN_TEST_BUTTON_REMOVE_LATER */}
              <button
                onClick={() => handleRouteNavigate("/admin")}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer"
              >
                Admin Panel
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              {session ? (
                <div className="space-y-3 font-sans">
                  {/* Profile info header */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={displayName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm">
                        {avatarLetter}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{displayName}</p>
                      <p className="text-xs text-slate-500 truncate">{displayEmail}</p>
                    </div>
                  </div>

                  {/* Actions list */}
                  <div className="grid grid-cols-2 gap-2">
                    {profile?.role && (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleRouteNavigate(getRoleBasedItem(profile.role).path);
                        }}
                        className="col-span-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 text-center flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-white shrink-0 animate-pulse" />
                        {getRoleBasedItem(profile.role).label}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleRouteNavigate("/profile");
                      }}
                      className="py-2.5 px-3 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-center flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      My Profile
                    </button>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleRouteNavigate("/job-seeker-dashboard");
                      }}
                      className="py-2.5 px-3 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-center flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                      Jobs
                    </button>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleRouteNavigate("/settings");
                      }}
                      className="py-2.5 px-3 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-center flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400 shrink-0" />
                      Settings
                    </button>

                    <button
                      onClick={async () => {
                        setIsMobileMenuOpen(false);
                        const { error } = await supabase.auth.signOut();
                        if (!error) {
                          handleRouteNavigate("/login");
                        }
                      }}
                      className="col-span-2 py-3 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 text-center flex items-center justify-center gap-2 transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleRouteNavigate("/login")}
                    className="w-full py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 border border-slate-200 text-center cursor-pointer"
                  >
                    Login to Dashboard
                  </button>
                  <button
                    onClick={() => {
                      if (isSignUpLoading) return;
                      setIsSignUpLoading(true);
                      setTimeout(() => {
                        handleRouteNavigate("/sign-up");
                        setIsSignUpLoading(false);
                      }, 800);
                    }}
                    disabled={isSignUpLoading}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 text-center cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-500/15 disabled:opacity-85"
                  >
                    {isSignUpLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        Sign Up
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Authorized Jaipur rollout member
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
