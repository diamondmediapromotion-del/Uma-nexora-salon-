import { motion } from "motion/react";
import React, { useState, useEffect } from "react";
import AuthDebugger from "./components/AuthDebugger";
import Header from "./components/Header";
import Hero from "./components/Hero";
import CustomerPreview from "./components/CustomerPreview";
import OwnerPreview from "./components/OwnerPreview";
import HowItWorks from "./components/HowItWorks";
import DemoVideo from "./components/DemoVideo";
import FeatureShowcase from "./components/FeatureShowcase";
import TrustImpact from "./components/TrustImpact";
import FinalCTA from "./components/FinalCTA";
import FloatingCTA from "./components/FloatingCTA";
import Footer from "./components/Footer";
import Modal from "./components/Modal";
import ScrollFadeIn from "./components/ScrollFadeIn";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import CustomerHome from "./components/customer/CustomerHome";
import Profile from "./components/customer/Profile";
import PlaceholderPage from "./components/customer/PlaceholderPage";
import SalonDetail from "./components/customer/SalonDetail";
import SalonDetailPlaceholder from "./components/customer/SalonDetailPlaceholder";
import ServiceSelection from "./components/customer/ServiceSelection";
import StaffSelection from "./components/customer/StaffSelection";
import DateTimeSelection from "./components/customer/DateTimeSelection";
import BookingConfirmation from "./components/customer/BookingConfirmation";
import BookingPlaceholder from "./components/customer/BookingPlaceholder";
import MyBookings from "./components/customer/MyBookings";
import BookingDetails from "./components/customer/BookingDetails";
import BookingDetailPlaceholder from "./components/customer/BookingDetailPlaceholder";
import Rewards from "./components/customer/Rewards";
import EditProfile from "./components/customer/EditProfile";
import TrustCenter from "./components/trust/TrustCenter";
import LegalPage from "./components/trust/LegalPage";
import HelpCenter from "./components/trust/HelpCenter";
import Contact from "./components/trust/Contact";
import SupportTickets from "./components/trust/SupportTickets";
import Privacy from "./components/customer/Privacy";
import SettingsPage from "./components/customer/Settings";
import UserNotifications from "./components/customer/Notifications";
import OwnerRegister from "./components/owner/OwnerRegister";
import OwnerDashboardPlaceholder from "./components/owner/OwnerDashboardPlaceholder";
import OwnerCreateWebsite from "./components/owner/OwnerCreateWebsite";
import PublicShopWebsite from "./components/owner/PublicShopWebsite";
import SuperAdminDashboard from "./components/admin/SuperAdminDashboard";
import GrowthPartnerLanding from "./components/partner/GrowthPartnerLanding";
import PartnerDashboard from "./components/partner/PartnerDashboard";
import PublicBrandListing from "./components/brand/PublicBrandListing";
import PublicBrandDetail from "./components/brand/PublicBrandDetail";
import BrandDashboard from "./components/brand/BrandDashboard";
import BrandLanding from "./components/brand/BrandLanding";
import SponsorSection from "./components/SponsorSection";
import LoadingState from "./components/customer/LoadingState";

// Job Portal Components
import JobPortal from "./components/jobs/JobPortal";
import JobDetail from "./components/jobs/JobDetail";
import JobSeekerDashboard from "./components/jobs/JobSeekerDashboard";
import JobSeekerProfile from "./components/jobs/JobSeekerProfile";
import MyApplications from "./components/jobs/MyApplications";
import PostJob from "./components/owner/PostJob";
import AppLauncher from "./components/apps/AppLauncher";
import PWAInstallPrompt from "./components/apps/PWAInstallPrompt";

import { supabase } from "./lib/supabase";
import { Salon, Service } from "./types";
import { dispatchPopState } from "./utils/navigation";
import {
  Sparkles,
  ShieldCheck,
  Lock,
  HelpCircle,
  ChevronDown,
  Gift,
  CheckCircle,
  MapPin,
  Info,
  Clock,
  PhoneCall,
  QrCode,
  Globe,
  Calendar,
  Layout,
  BarChart3,
  TrendingUp,
  Award,
  MessageSquare,
  Star,
  SlidersHorizontal,
  ArrowRight,
  ArrowLeft,
  Users,
  Lock as LockIcon
} from "lucide-react";

// FAQ Item Interface
interface FAQItem {
  question: string;
  answer: string;
}

export default function App() {
  // Simple state router
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [rpcError, setRpcError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [benefitsFilter, setBenefitsFilter] = useState('All');

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfileAndRoles(session.user.id);
      } else {
        setAuthLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfileAndRoles(session.user.id);
      } else {
        setUserProfile(null);
        setUserRoles([]);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfileAndRoles = async (userId: string) => {
    try {
      // 1. Fetch user profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        setUserProfile(data);
      }

      // 2. Fetch user roles from user_roles table
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      let existingRoles = rolesData ? rolesData.map((r: any) => r.role) : [];

      if (!existingRoles.includes('customer')) {
        // Auto-provision role "customer" because they either have no roles, or have other roles (like shop_owner) but not customer.
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'customer' });
        
        if (!insertError) {
          existingRoles.push('customer');
        } else {
          console.error("Error auto-provisioning customer role:", insertError);
        }
      }

      setUserRoles(existingRoles);
      
      // 3. Check super_admin status
      const { data: hasRole, error: rpcError } = await supabase.rpc("current_user_has_role", {
        p_role: "super_admin"
      });
      if (rpcError) {
        console.error("RPC current_user_has_role failed, falling back:", rpcError);
        setRpcError(rpcError.message);
        // Fallback: check existingRoles directly
        const isSuperAdminFallback = existingRoles.includes('super_admin');
        setIsSuperAdmin(isSuperAdminFallback);
      } else {
        setRpcError(null);
        setIsSuperAdmin(!!hasRole);
      }
    } catch (err: any) {
      console.error("Error fetching profile and roles:", err);
      setRpcError(err.message || "Unknown error");
      setIsSuperAdmin(false);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handleLocationChange);
    
    // Intercept standard local anchor links (e.g., href="/customer")
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor) {
        const href = anchor.getAttribute("href");
        if (href && href.startsWith("/")) {
          e.preventDefault();
          window.history.pushState({}, "", href);
          window.dispatchEvent(new Event("popstate"));
          window.scrollTo(0, 0);
        }
      }
    };
    document.addEventListener("click", handleAnchorClick);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  // App Usage Tracking
  useEffect(() => {
    const trackUsage = async () => {
      let appKey = 'customer_app';
      if (currentPath.includes('owner')) appKey = 'owner_app';
      else if (currentPath.includes('partner')) appKey = 'partner_app';
      else if (currentPath.includes('brand') || currentPath.includes('distributor')) appKey = 'brand_app';
      else if (currentPath.includes('jobs')) appKey = 'jobs_app';
      else if (currentPath.includes('admin')) appKey = 'admin_app';

      // We only want to track major dashboard openings ideally, 
      // but tracking any main route mapped to an app is fine too.
      try {
        await supabase.rpc('track_app_usage_event', {
          p_app_key: appKey,
          p_route_path: currentPath,
          p_event_name: 'open',
          p_platform: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
          p_user_agent: navigator.userAgent
        });
      } catch (err) {
        // ignore silently
      }
    };
    
    // Slight debounce
    const t = setTimeout(trackUsage, 1000);
    return () => clearTimeout(t);
  }, [currentPath]);

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    // Use a more robust way to dispatch popstate
    dispatchPopState();
    window.scrollTo(0, 0);
  };

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"login" | "register" | "book" | "partner" | "distributor" | "jobs" | null>(null);
  
  // Active salon or service details passed to the booking modal
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Live reward point state (Hero section tracking updates on booking success)
  const [bookingPointsAdded, setBookingPointsAdded] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // FAQ Accordion toggler states
  const [openFAQIdx, setOpenFAQIdx] = useState<number | null>(0);

  // Header active scroll tracking
  const [activeSection, setActiveSection] = useState("top");

  // Scroll progress tracker
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScrollProgress = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener("scroll", handleScrollProgress, { passive: true });
    handleScrollProgress();

    return () => window.removeEventListener("scroll", handleScrollProgress);
  }, []);

  // Intersection Observer to highlight active header links on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["customers", "owners", "growth", "brands", "jobs"];
      const scrollPosition = window.scrollY + 160;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            return;
          }
        }
      }
      setActiveSection("top");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Open respective modal trigger
  const handleOpenModal = (type: "login" | "register" | "book" | "partner" | "distributor" | "jobs") => {
    setModalType(type);
    setIsModalOpen(true);
  };

  // Open express book modal
  const handleSelectServiceToBook = (salon: Salon, service: Service) => {
    setSelectedSalon(salon);
    setSelectedService(service);
    handleOpenModal("book");
  };

  // Callback when a booking is simulated successfully
  const handleBookingSuccess = (pointsGained: number) => {
    setBookingPointsAdded((prev) => prev + pointsGained);
    triggerToast(`✨ Seat booked! You've gained +${pointsGained} cashback rewards points!`);
  };

  // Callback when registration is simulated successfully
  const handleRegisterSuccess = (salonName: string) => {
    triggerToast(`🎉 Subdomain created successfully for ${salonName}!`);
  };

  // Help triggers toast notifications
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Manual section scrolling
  const handleNavigateSection = (sectionId: string) => {
    if (sectionId === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Collapsible FAQ list data
  const faqData: FAQItem[] = [
    {
      question: "Is Nexora free for customers?",
      answer: "Yes, completely! Nexora is 100% free for customers. You can discover Jaipur's top-tier salons, compare hair cut/spa rates, and check stylist availability with absolutely zero booking fees or hidden charges."
    },
    {
      question: "Is salon website really free for shop owners?",
      answer: "Yes, it is 100% free. Salon owners get a high-quality website with a custom subdomain, live calendar slot management, WhatsApp scheduling, and digital reward ledger tools completely free."
    },
    {
      question: "How does 60 second booking work?",
      answer: "Simply pick a salon in Jaipur, select your preferred styling service, assign an expert beauty professional, and lock your slot time. Your seat is instantly reserved in under a minute without any phone calls."
    },
    {
      question: "How do QR rewards work?",
      answer: "Every partner salon is equipped with a custom counter standee QR. When you pay at the desk, scanning the QR awards you flat 15% wallet cashback savings for your next booking."
    },
    {
      question: "Who can become a Growth Partner?",
      answer: "Anyone living in Jaipur can join! Students, freelancers, or local beauty professionals can apply. We provide full digital training materials. You receive set commissions on onboarding verified local salons."
    },
    {
      question: "How can brands/distributors join?",
      answer: "Authorized beauty brands and distributors in Rajasthan can set up professional brand storefronts to showcase product lines and handle wholesale supply orders directly for partner salons."
    }
  ];

  if (authLoading) {
    return <LoadingState />;
  }

  // Define customer routes that need protection
  const customerRoutes = [
    "/customer", "/salon/demo", "/booking/demo", "/booking/staff", 
    "/booking/date-time", "/booking/confirm", "/my-bookings", 
    "/rewards", "/profile", "/profile/edit", "/notifications", 
    "/support", "/privacy", "/settings", "/booking/details/demo"
  ];

  const isCustomerRoute = customerRoutes.includes(currentPath) || currentPath.startsWith("/salon/") || currentPath.startsWith("/booking/");

  // Route Protection
  if (isCustomerRoute && !session) {
    // Save current path to redirect back after login
    // window.location.href = "/login"; // This would cause refresh
    navigateTo("/login");
    return null;
  }

  // Role Check for Customer Routes
  if (isCustomerRoute && session) {
    const hasCustomerRole = userRoles.includes("customer") || userRoles.includes("super_admin");
    if (!hasCustomerRole) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
              <LockIcon className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-slate-900">This section is for customers.</h1>
            <p className="text-sm text-slate-500">You do not have customer access under your current role(s). Please log in with a customer account.</p>
            <button 
              onClick={() => navigateTo("/")}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-slate-800 transition cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }
  }

  if (currentPath === "/sign-up") {
    return <SignUp navigateTo={navigateTo} />;
  }

  if (currentPath === "/login") {
    return <Login navigateTo={navigateTo} />;
  }

  if (currentPath === "/forgot-password") {
    return <ForgotPassword navigateTo={navigateTo} />;
  }

  const pathWithoutQuery = currentPath.split("?")[0];

  // Job Portal Routes
  if (currentPath === "/jobs") {
    return <JobPortal navigateTo={navigateTo} />;
  }
    if (currentPath.startsWith("/jobs/")) {
      const parts = pathWithoutQuery.split("/");
      if (parts.length === 3 && parts[2]) {
        return <JobDetail jobId={parts[2]} navigateTo={navigateTo} onBack={() => navigateTo("/jobs")} />;
      }
    }
  if (currentPath === "/job-seeker-dashboard") {
    return <JobSeekerDashboard navigateTo={navigateTo} />;
  }
  if (currentPath === "/job-seeker-profile") {
    return <JobSeekerProfile navigateTo={navigateTo} />;
  }
  if (currentPath === "/my-job-applications") {
    return <MyApplications onBack={() => navigateTo("/job-seeker-dashboard")} />;
  }

  if (currentPath === "/post-job") {
    const hasOwnerRole = userRoles.includes("shop_owner") || userRoles.includes("super_admin");
    if (!hasOwnerRole) {
      return <OwnerRegister navigateTo={navigateTo} />;
    }
    return <PostJob navigateTo={navigateTo} />;
  }

  if (currentPath.startsWith("/shop/")) {
    const parts = pathWithoutQuery.split("/");
    if (parts.length === 3) {
      const slug = parts[2];
      return <PublicShopWebsite slug={slug} navigateTo={navigateTo} />;
    }
  }

  if (currentPath === "/admin") {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-sm text-slate-500 font-medium">Verifying Session...</p>
        </div>
      );
    }
    if (!session) {
      navigateTo("/login");
      return null;
    }
    
    if (isSuperAdmin === null) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans">
          <p className="text-sm text-slate-500">Checking admin access...</p>
        </div>
      );
    }
    
    if (!isSuperAdmin) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
              <LockIcon className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-slate-900">Access Denied</h1>
            <p className="text-sm text-slate-500">
              Super admin access required.
            </p>
            
            {/* TEMP_ADMIN_DEBUG_REMOVE_LATER */}
            <div className="p-4 bg-slate-50 rounded-xl text-[10px] text-slate-500 text-left font-mono mt-4">
               Email: {session.user?.email || "N/A"}
               <br/>
               User ID: {session.user?.id || "N/A"}
               <br/>
               RPC Error: {rpcError || "None"}
               <br/><br/>
               Ask database admin to add this user id/email to public.user_roles with role super_admin.
            </div>
            
            <button 
              onClick={() => navigateTo("/")}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl text-sm shadow-lg hover:bg-blue-700 transition cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }
    
    return <SuperAdminDashboard navigateTo={navigateTo} />;
  }

  if (currentPath === "/owner-create-website") {
    if (!session) {
      navigateTo("/login");
      return null;
    }
    const hasOwnerRole = userRoles.includes("shop_owner") || userRoles.includes("super_admin");
    if (!hasOwnerRole) {
      navigateTo("/owner-register");
      return null;
    }
    return <OwnerCreateWebsite navigateTo={navigateTo} />;
  }

  if (currentPath === "/owner-dashboard") {
    if (!session) {
      navigateTo("/login");
      return null;
    }
    const hasOwnerRole = userRoles.includes("shop_owner") || userRoles.includes("super_admin");
    if (!hasOwnerRole) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
              <LockIcon className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-slate-900">Access Denied</h1>
            <p className="text-sm text-slate-500">Only shop owners can access the owner dashboard. Please register your shop first.</p>
            <button 
              onClick={() => navigateTo("/owner-register")}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl text-sm shadow-lg hover:bg-blue-700 transition cursor-pointer"
            >
              Register Your Business
            </button>
            <button 
              onClick={() => navigateTo("/")}
              className="w-full py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl text-sm hover:bg-slate-200 transition cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }
    return <OwnerDashboardPlaceholder navigateTo={navigateTo} />;
  }

  if (currentPath === "/growth-partner") {
    return <GrowthPartnerLanding navigateTo={navigateTo} />;
  }

  if (currentPath === "/partner-dashboard") {
    if (!session) {
      navigateTo("/login");
      return null;
    }
    const hasPartnerRole = userRoles.includes("growth_partner") || userRoles.includes("super_admin");
    if (!hasPartnerRole) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
              <LockIcon className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-slate-900">Partner Access Required</h1>
            <p className="text-sm text-slate-500">Only approved Nexora Growth Partners can access this dashboard. Apply now to start your journey.</p>
            <button 
              onClick={() => navigateTo("/growth-partner")}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl text-sm shadow-lg hover:bg-blue-700 transition cursor-pointer"
            >
              Become a Growth Partner
            </button>
            <button 
              onClick={() => navigateTo("/")}
              className="w-full py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl text-sm hover:bg-slate-200 transition cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }
    return <PartnerDashboard navigateTo={navigateTo} />;
  }

  if (currentPath === "/brands") {
    return <PublicBrandListing navigateTo={navigateTo} />;
  }

  if (currentPath.startsWith("/brands/")) {
    const parts = pathWithoutQuery.split("/");
    if (parts.length === 3) {
      return <PublicBrandDetail brandCode={parts[2]} navigateTo={navigateTo} />;
    }
  }

  if (currentPath === "/brand-dashboard") {
    if (!session) {
      navigateTo("/login");
      return null;
    }
    const hasBrandRole = userRoles.includes("brand_partner") || userRoles.includes("distributor") || userRoles.includes("distributor_brand") || userRoles.includes("super_admin");
    if (!hasBrandRole) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
              <LockIcon className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-slate-900">Brand Access Required</h1>
            <p className="text-sm text-slate-500">Only approved Brands & Distributors can access this dashboard.</p>
            <button 
              onClick={() => navigateTo("/distributor-brand")}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl text-sm shadow-lg hover:bg-blue-700 transition cursor-pointer"
            >
              Apply as Brand Partner
            </button>
            <button 
              onClick={() => navigateTo("/")}
              className="w-full py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl text-sm hover:bg-slate-200 transition cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }
    return <BrandDashboard navigateTo={navigateTo} />;
  }

  if (currentPath === "/distributor-brand") {
    return <BrandLanding navigateTo={navigateTo} onOpenModal={handleOpenModal} />;
  }

  if (currentPath === "/apps") {
    return <AppLauncher navigateTo={navigateTo} />;
  }

  if (currentPath === "/owner-register") {
    if (!session) {
      navigateTo("/login");
      return null;
    }
    return <OwnerRegister navigateTo={navigateTo} />;
  }

  if (currentPath === "/customer") {
    return <CustomerHome navigateTo={navigateTo} />;
  }

  if (currentPath === "/my-bookings") {
    return <MyBookings navigateTo={navigateTo} />;
  }

  if (currentPath === "/rewards") {
    return <Rewards navigateTo={navigateTo} />;
  }

  if (currentPath === "/profile") {
    return <Profile navigateTo={navigateTo} />;
  }

  if (currentPath.startsWith("/salon/")) {
    const parts = pathWithoutQuery.split("/");
    if (parts.length === 3 && parts[2] !== "demo") {
      return <SalonDetail navigateTo={navigateTo} shopId={parts[2]} />;
    }
    if (currentPath === "/salon/demo") {
      return <SalonDetail navigateTo={navigateTo} />;
    }
    return <SalonDetailPlaceholder navigateTo={navigateTo} />;
  }

  if (currentPath.startsWith("/booking/")) {
    const parts = pathWithoutQuery.split("/");
    // /booking/{shopId}
    if (parts.length === 3 && parts[2] !== "demo") {
      return <ServiceSelection navigateTo={navigateTo} shopId={parts[2]} />;
    }
    // /booking/{shopId}/staff
    if (parts.length === 4 && parts[3] === "staff") {
       return <StaffSelection navigateTo={navigateTo} shopId={parts[2]} />;
    }
    // /booking/{shopId}/date-time
    if (parts.length === 4 && parts[3] === "date-time") {
       return <DateTimeSelection navigateTo={navigateTo} shopId={parts[2]} />;
    }
    // /booking/{shopId}/confirm
    if (parts.length === 4 && parts[3] === "confirm") {
       return <BookingConfirmation navigateTo={navigateTo} shopId={parts[2]} />;
    }

    if (currentPath === "/booking/demo") {
      return <ServiceSelection navigateTo={navigateTo} />;
    }
    if (currentPath === "/booking/staff") {
      return <StaffSelection navigateTo={navigateTo} />;
    }
    if (currentPath === "/booking/date-time") {
      return <DateTimeSelection navigateTo={navigateTo} />;
    }
    if (currentPath === "/booking/confirm") {
      return <BookingConfirmation navigateTo={navigateTo} />;
    }
    return <BookingPlaceholder navigateTo={navigateTo} />;
  }

  if (currentPath === "/profile/edit") {
    return <EditProfile navigateTo={navigateTo} />;
  }

  if (currentPath === "/notifications") {
    return <UserNotifications navigateTo={navigateTo} />;
  }

  if (currentPath === "/trust") {
    return <TrustCenter navigateTo={navigateTo} />;
  }

  if (currentPath === "/help") {
    return <HelpCenter navigateTo={navigateTo} />;
  }

  if (currentPath === "/contact") {
    return <Contact navigateTo={navigateTo} />;
  }

  if (currentPath === "/support") {
    return <SupportTickets navigateTo={navigateTo} />;
  }

  const legalRoutes = [
    '/privacy-policy', 
    '/terms-and-conditions', 
    '/refund-cancellation-policy',
    '/data-deletion-policy',
    '/owner-policy',
    '/growth-partner-policy',
    '/brand-distributor-policy',
    '/job-portal-policy'
  ];

  if (legalRoutes.includes(currentPath) || currentPath === "/privacy") {
    const slug = currentPath === "/privacy" ? "privacy-policy" : currentPath.substring(1);
    return <LegalPage slug={slug} navigateTo={navigateTo} />;
  }

  if (currentPath === "/settings") {
    return <SettingsPage navigateTo={navigateTo} />;
  }
  
  if (currentPath.startsWith("/booking/details/")) {
    const parts = pathWithoutQuery.split("/");
    if (parts.length === 4 && parts[3] !== "demo") {
      return <BookingDetails navigateTo={navigateTo} bookingId={parts[3]} />;
    }
  }

  if (currentPath === "/booking/details/demo") {
    return <BookingDetailPlaceholder navigateTo={navigateTo} />;
  }

  if (currentPath !== "/") {
    // Determine title based on requested routes
    let routeTitle = "Nexora Module";
    if (currentPath === "/customer") routeTitle = "For Customers";
    else if (currentPath === "/owner-register") routeTitle = "Register Your Salon";
    else if (currentPath === "/owner-create-website") routeTitle = "Create Free Website";
    else if (currentPath === "/growth-partner") routeTitle = "Nexora Growth Partner Program";
    else if (currentPath === "/distributor-brand") routeTitle = "Brands & Distributors";
    else if (currentPath === "/jobs") routeTitle = "Beauty Jobs & Staff Hiring";

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 premium-shadow space-y-6 animate-fade-in">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 shadow-sm">
            <Sparkles className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-display font-black text-slate-900 tracking-tight">
              {routeTitle}
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Path: {currentPath}
            </p>
          </div>

          <p className="text-slate-500 text-sm leading-relaxed">
            This module will be built in next steps. Keep exploring other connected features in Jaipur's favorite beauty ecosystem.
          </p>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-3xs text-slate-400 uppercase tracking-widest font-black flex items-center justify-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>On-Schedule Deployment</span>
          </div>

          <button
            onClick={() => navigateTo("/")}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50/50">
      
      {/* Scroll Progress Bar at the absolute top of the viewport */}
      <div 
        id="top-scroll-progress"
        className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 z-[100] transition-all duration-75 ease-out origin-left pointer-events-none"
        style={{ width: `${scrollProgress}%` }}
      />
      
      {/* Dynamic Toast feedback alerts */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800 animate-slide-up">
          <CheckCircle className="w-5.5 h-5.5 text-emerald-500 shrink-0" />
          <p className="text-xs font-bold leading-relaxed">{toastMessage}</p>
        </div>
      )}

      {/* PWA Install Prompt */}
      <PWAInstallPrompt appKey={
        currentPath.includes('owner') ? 'owner_app' : 
        currentPath.includes('partner') ? 'partner_app' :
        currentPath.includes('brand') || currentPath.includes('distributor') ? 'brand_app' :
        currentPath.includes('jobs') ? 'jobs_app' :
        currentPath.includes('admin') ? 'admin_app' : 'customer_app'
      } />

      {/* 1. STICKY PREMIUM HEADER */}
      <Header
        onOpenModal={handleOpenModal}
        activeSection={activeSection}
        onNavigateSection={handleNavigateSection}
      />

      {/* 2. PREMIUM HERO SECTION WITH LIVE REWARDS TRACKER */}
      <Hero
        onOpenModal={handleOpenModal}
        onBookingPoints={bookingPointsAdded}
      />

      {/* 3. DYNAMIC CUSTOMER DISCOVERY AND BOOKING MARKETPLACE */}
      <section id="customers" className="py-20 bg-white border-y border-slate-200/50 scroll-mt-18">
        <ScrollFadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Section title */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-3xs font-extrabold uppercase tracking-widest border border-blue-100">
              For Customers
            </div>
            <h2 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
              Salon ja rahe ho? <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Nexora kiya kya?</span>
            </h2>
            <p className="text-slate-500 text-sm md:text-base font-body">
              Discover verified salons, compare service menus, pick expert stylists, and earn guaranteed 15% QR rewards with Jaipur's favorite beauty assistant.
            </p>
          </div>

          {/* 8-Card Customer Benefits Grid */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {['All', 'Popular', 'Luxury', 'Budget', 'Express'].map((f) => (
              <button 
                key={f}
                onClick={() => setBenefitsFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${benefitsFilter === f ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { title: "Nearby Salon Search", desc: "Instantly pinpoint Jaipur's top verified beauty spots around you.", icon: MapPin, color: "text-blue-600 bg-blue-50 border-blue-100", categories: ['Popular'] },
              { title: "Price Comparison", desc: "Compare express haircuts, facials, and hair styling rates seamlessly.", icon: SlidersHorizontal, color: "text-indigo-600 bg-indigo-50 border-indigo-100", categories: ['Budget'] },
              { title: "Verified Photos & Reviews", desc: "Browse real geolocated photos and checked reviews on location.", icon: Star, color: "text-amber-600 bg-amber-50 border-amber-100", categories: ['Popular'] },
              { title: "Staff Selection", desc: "Select your preferred professional cosmetologist beforehand.", icon: Users, color: "text-violet-600 bg-violet-50 border-violet-100", categories: ['Luxury'] },
              { title: "60 Second Booking", desc: "Lock your express seat and slot timeline in under a minute.", icon: Clock, color: "text-rose-600 bg-rose-50 border-rose-100", categories: ['Express'] },
              { title: "WhatsApp Confirmation", desc: "Receive immediate slot confirmation details direct on WhatsApp.", icon: MessageSquare, color: "text-emerald-600 bg-emerald-50 border-emerald-100", categories: ['Express'] },
              { title: "Reward Points", desc: "Earn digital cash-points automatically on every reservation made.", icon: Gift, color: "text-pink-600 bg-pink-50 border-pink-100", categories: ['Popular'] },
              { title: "15% QR Benefits", desc: "Scan the counter standee QR to claim instant flat 15% wallet cashback.", icon: QrCode, color: "text-sky-600 bg-sky-50 border-sky-100", categories: ['Budget'] }
            ].filter(card => benefitsFilter === 'All' || card.categories.includes(benefitsFilter)).map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div 
                  key={card.title} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05, y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                  className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 hover:border-blue-100 transition-colors group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className={`p-2.5 rounded-xl w-fit ${card.color} border shadow-3xs`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs tracking-tight group-hover:text-blue-600 transition-colors">
                      {card.title}
                    </h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed font-light">
                      {card.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Customer CTA Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-blue-50/40 rounded-3xl border border-blue-100/50 gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
              </span>
              <p className="text-xs font-bold text-blue-950">
                Ready to search and compare? Try our live directory list below!
              </p>
            </div>
            <button
              onClick={() => {
                navigateTo("/customer");
              }}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10"
            >
              Explore Customer App → /customer
            </button>
          </div>

          {/* Interactive Explorer Anchor */}
          <div id="search-explorer" className="pt-8 border-t border-slate-100">
            <p className="text-3xs font-black text-slate-400 uppercase tracking-widest mb-4">
              Interactive Jaipur Salon Directory
            </p>
            <CustomerPreview
              onSelectService={handleSelectServiceToBook}
              onOpenModal={handleOpenModal}
            />
          </div>

        </ScrollFadeIn>
      </section>

      {/* 4. PREMIUM SALON OWNER SaaS OS SUITE */}
      <section id="owners" className="py-20 scroll-mt-18 bg-gradient-to-b from-slate-50/50 to-white">
        <ScrollFadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Section title */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-3xs font-extrabold uppercase tracking-widest border border-blue-100">
              For Salon Owners
            </div>
            <h2 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
              100% Free <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">Apne Naam Ki Website</span>
            </h2>
            <p className="text-slate-500 text-sm md:text-base font-body">
              Stop paying high aggregator commissions. Claim a free premium website with a custom subdomain, live seat booking manager, WhatsApp scheduling, and an instant rewards counter.
            </p>
          </div>

          {/* 8-Card Owner Benefits Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { title: "Free White-Label Website", desc: "Get a custom subdomain with gorgeous mobile themes instantly.", icon: Globe, color: "text-blue-600 bg-blue-50 border-blue-100" },
              { title: "Online Booking", desc: "Receive automated digital seat bookings without phone interruption.", icon: Calendar, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
              { title: "Service Menu", desc: "Put your express haircuts, facial sessions, and prices on a beautiful board.", icon: Layout, color: "text-violet-600 bg-violet-50 border-violet-100" },
              { title: "Staff Management", desc: "Allocate therapist rosters and supervise stylist booking workloads.", icon: Users, color: "text-purple-600 bg-purple-50 border-purple-100" },
              { title: "Customer Reviews", desc: "Publish geolocated ratings online to capture local micro-trust.", icon: Star, color: "text-amber-600 bg-amber-50 border-amber-100" },
              { title: "QR Reward System", desc: "Redeem points, track digital checks, and reward direct wallet cash.", icon: QrCode, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
              { title: "Growth Analytics", desc: "Monitor daily revenues, booking charts, and website traffic logs.", icon: BarChart3, color: "text-rose-600 bg-rose-50 border-rose-100" },
              { title: "Repeat Customers", desc: "Increase client retention by 45% with automatic booking reminders.", icon: TrendingUp, color: "text-sky-600 bg-sky-50 border-sky-100" }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div key={idx} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors group flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className={`p-2.5 rounded-xl w-fit ${card.color} border shadow-3xs`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs tracking-tight group-hover:text-indigo-600 transition-colors">
                      {card.title}
                    </h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed font-light">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Owner CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
            <div className="text-center sm:text-left mr-auto">
              <h4 className="text-white font-bold text-sm">Boost your salon with SalonOS today</h4>
              <p className="text-slate-400 text-2xs mt-1">Claim your subdomain or start custom layout creation below</p>
            </div>
            <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-center">
              <button
                onClick={() => {
                  navigateTo("/owner-register");
                }}
                className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-blue-500/10 flex items-center gap-1.5"
              >
                Register Your Salon → /owner-register
              </button>
              <button
                onClick={() => {
                  navigateTo("/owner-create-website");
                }}
                className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer border border-slate-200"
              >
                Create Free Website → /owner-create-website
              </button>
            </div>
          </div>

          {/* Sandbox interactive builder element anchor */}
          <div id="owner-sandbox" className="pt-8 border-t border-slate-100">
            <p className="text-3xs font-black text-slate-400 uppercase tracking-widest mb-4">
              No-Code Website Builder & Sandbox Demo
            </p>
            <OwnerPreview onOpenModal={handleOpenModal} />
          </div>

        </ScrollFadeIn>
      </section>

      {/* 5. How Nexora Works */}
      <HowItWorks />

      {/* Interactive Demo Video walkthrough */}
      <DemoVideo />

      {/* 5. DYNAMIC SPONSOR SECTION */}
      <SponsorSection navigateTo={navigateTo} />

      {/* 5. MULTI-MODULE LANDING FEATURES (GROWTH PARTNERS, DISTRIBUTOR B2B, Careers) */}
      <div className="bg-white border-y border-slate-200/50">
        <ScrollFadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeatureShowcase onOpenModal={handleOpenModal} />
        </ScrollFadeIn>
      </div>

      {/* 6. COLLAPSIBLE FAQ ACCORDION */}
      <section className="py-20 bg-slate-50/50">
        <ScrollFadeIn className="max-w-3xl mx-auto px-4 sm:px-6">
          
          {/* FAQ title */}
          <div className="text-center space-y-3 mb-16">
            <div className="inline-flex items-center gap-1 p-1 bg-white rounded-full border border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" /> FAQ
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-950 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-xs font-semibold">
              Everything you need to know about Nexora's Jaipur beauty ecosystem.
            </p>
          </div>

          {/* Accordion List */}
          <div className="space-y-4">
            {faqData.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-100 premium-shadow overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFAQIdx(openFAQIdx === idx ? null : idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between font-bold text-slate-900 text-sm sm:text-base hover:bg-slate-50/60 transition-colors cursor-pointer"
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${
                      openFAQIdx === idx ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {openFAQIdx === idx && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-500 leading-relaxed border-t border-slate-50/80">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Additional support banner */}
          <div className="mt-10 p-5 bg-blue-50/60 rounded-2xl border border-blue-100/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Info className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-xs text-blue-900 font-semibold">
                Have specific B2B enterprise questions? Contact our regional Jaipur support desk.
              </p>
            </div>
            <button
              onClick={() => {
                window.location.href = "mailto:support@nexorasalon.in";
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-2xs cursor-pointer transition-colors"
            >
              Contact Support
            </button>
          </div>

        </ScrollFadeIn>
      </section>

      {/* Trust & Impact Section with Animated Counters */}
      <TrustImpact />

      {/* 11. Final CTA Section */}
      <FinalCTA />

      {/* 12. PRESET FOOTER */}
      <Footer
        onOpenModal={handleOpenModal}
        onNavigateSection={handleNavigateSection}
      />

      {/* 8. UNIVERSAL OVERLAY MODALS (LOGIN, BOOKINGS, REGISTRATIONS, PARTNERS, DISTRIBUTOR, JOBS) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalType(null);
          setSelectedSalon(null);
          setSelectedService(null);
        }}
        type={modalType}
        salonData={selectedSalon}
        serviceData={selectedService}
        onBookingSuccess={handleBookingSuccess}
        onRegisterSuccess={handleRegisterSuccess}
      />

      {/* Floating Sticky Register Salon CTA */}
      <FloatingCTA onTrigger={() => navigateTo("/owner-register")} />
      <AuthDebugger />

    </div>
  );
}
