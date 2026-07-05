import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  Sparkles,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  MapPin,
  Calendar,
  Lock,
  QrCode,
  Globe,
  Upload,
  Trash2,
  Loader2,
  Info,
  Phone,
  MessageSquare,
  ChevronRight,
  Filter,
  X,
  Eye,
  Settings,
  ShieldCheck,
  RefreshCw,
  Award,
  Users,
  Building2,
  Briefcase,
  Smartphone
} from "lucide-react";
import FinanceControlCenter from "./finance/FinanceControlCenter";
import ServerSecretDiagnostic from "./ServerSecretDiagnostic";
import GrowthPartnersSection from "./GrowthPartnersSection";
import BrandsSection from "./BrandsSection";
import JobPortalAdmin from "./JobPortalAdmin";
import AppAnalytics from "./AppAnalytics";
import SupportAdmin from "./SupportAdmin";

interface SuperAdminDashboardProps {
  navigateTo: (path: string) => void;
}

export default function SuperAdminDashboard({ navigateTo }: SuperAdminDashboardProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Tabs: overview | approvals | qr_settings | qr_payments | referral_settings | membership_plans | finance | growth_partners | brands | jobs
  const [activeTab, setActiveTab] = useState<"overview" | "approvals" | "qr_settings" | "qr_payments" | "referral_settings" | "membership_plans" | "finance" | "growth_partners" | "brands" | "jobs">("overview");

  // QR Payments state
  const [paymentRecords, setPaymentRecords] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState<"all" | "pending" | "verified" | "rejected" | "refunded">("all");
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [isVerifyPaymentModalOpen, setIsVerifyPaymentModalOpen] = useState(false);
  const [isRejectPaymentModalOpen, setIsRejectPaymentModalOpen] = useState(false);
  const [paymentRejectionReason, setPaymentRejectionReason] = useState("");

  // Shops Data State
  const [shops, setShops] = useState<any[]>([]);
  const [servicesCounts, setServicesCounts] = useState<Record<string, number>>({});
  const [shopServicesMap, setShopServicesMap] = useState<Record<string, any[]>>({});
  const [loadingShops, setLoadingShops] = useState(false);

  // Filter for Shop Approvals tab
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected" | "suspended">("all");

  // Modal / Detail States
  const [selectedShop, setSelectedShop] = useState<any | null>(null);
  const [loadingServicesForShop, setLoadingServicesForShop] = useState(false);
  const [selectedShopServices, setSelectedShopServices] = useState<any[]>([]);

  // Confirmation Modals
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);

  // Form Fields
  const [rejectionReason, setRejectionReason] = useState("");
  const [suspensionReason, setSuspensionReason] = useState("");

  // Action feedback states
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Nexora QR Settings Form State
  const [qrId, setQrId] = useState<string | null>(null);
  const [qrTitle, setQrTitle] = useState("Nexora SalonOS Payment QR");
  const [qrPayeeName, setQrPayeeName] = useState("");
  const [qrUpiId, setQrUpiId] = useState("");
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [qrIsActive, setQrIsActive] = useState(true);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [savingQr, setSavingQr] = useState(false);
  const [qrMessage, setQrMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Referral Settings
  const [referralSettings, setReferralSettings] = useState<any>(null);

  // Membership Plans
  const [membershipPlans, setMembershipPlans] = useState<any[]>([]);



  // Fetch roles and verify Super Admin
  useEffect(() => {
    async function checkAdminAccess() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAdmin(false);
          setLoadingAuth(false);
          navigateTo("/login");
          return;
        }
        setCurrentUser(user);

        // Check user_roles table
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "super_admin");

        if (roleData && roleData.length > 0) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error checking super admin access:", err);
        setIsAdmin(false);
      } finally {
        setLoadingAuth(false);
      }
    }
    checkAdminAccess();
  }, [navigateTo]);

  // Fetch shop data if admin verified
  useEffect(() => {
    if (isAdmin === true) {
      fetchAllDashboardData();
      fetchQrSettings();
      fetchPaymentRecords();
      fetchReferralSettings();
      fetchMembershipPlans();
    }
  }, [isAdmin]);

  const fetchMembershipPlans = async () => {
    try {
        const { data } = await supabase.from("membership_plans").select("*").order("min_lifetime_points", { ascending: true });
        if (data) setMembershipPlans(data);
    } catch (err) {
        console.error("Error fetching membership plans:", err);
    }
  };

  const fetchReferralSettings = async () => {
    try {
        const { data } = await supabase.from("referral_reward_settings").select("*").single();
        if (data) setReferralSettings(data);
    } catch (err) {
        console.error("Error fetching referral settings:", err);
    }
  };

  const fetchAllDashboardData = async () => {
    setLoadingShops(true);
    setErrorMessage(null);
    try {
      // 1. Fetch all shops
      const { data: shopsData, error: shopsErr } = await supabase
        .from("shops")
        .select("*")
        .order("created_at", { ascending: false });

      if (shopsErr) throw shopsErr;
      const loadedShops = shopsData || [];
      setShops(loadedShops);

      // 2. Fetch all services counts grouped by shop_id to avoid N+1 queries
      const { data: servicesData, error: servicesErr } = await supabase
        .from("shop_services")
        .select("id, shop_id, service_name, price, duration_minutes, category, is_active");

      if (!servicesErr && servicesData) {
        const counts: Record<string, number> = {};
        const mapping: Record<string, any[]> = {};
        
        servicesData.forEach((s: any) => {
          counts[s.shop_id] = (counts[s.shop_id] || 0) + 1;
          if (!mapping[s.shop_id]) {
            mapping[s.shop_id] = [];
          }
          mapping[s.shop_id].push(s);
        });

        setServicesCounts(counts);
        setShopServicesMap(mapping);
      }
    } catch (err: any) {
      console.error("Error fetching dashboard shops:", err);
      setErrorMessage("Unable to complete action. Please try again.");
    } finally {
      setLoadingShops(false);
    }
  };

  const fetchQrSettings = async () => {
    try {
      const { data: qrData } = await supabase
        .from("platform_qr_settings")
        .select("*");

      if (qrData && qrData.length > 0) {
        // Find first active, or just the first row
        const activeQr = qrData.find((q: any) => q.is_active) || qrData[0];
        setQrId(activeQr.id);
        setQrTitle(activeQr.title || "Nexora SalonOS Payment QR");
        setQrPayeeName(activeQr.payee_name || "");
        setQrUpiId(activeQr.upi_id || "");
        setQrImageUrl(activeQr.qr_image_url || "");
        setQrIsActive(activeQr.is_active ?? true);
      }
    } catch (err) {
      console.error("Error fetching platform QR settings:", err);
    }
  };

  const fetchPaymentRecords = async () => {
    setLoadingPayments(true);
    try {
      const { data, error } = await supabase
        .from("qr_payment_records")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPaymentRecords(data || []);
    } catch (err) {
      console.error("Error fetching QR payment records:", err);
      setErrorMessage("Unable to fetch payment records.");
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleVerifyPaymentConfirm = async () => {
    if (!selectedPayment) return;
    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const paymentId = selectedPayment.id;
      const paymentRef = selectedPayment.payment_reference || selectedPayment.reference_id || selectedPayment.utr || "";

      const { data, error } = await supabase.rpc("admin_verify_nexora_qr_payment", {
        payment_id: paymentId,
        payment_reference: paymentRef
      });

      if (error) throw error;

      setSuccessMessage("Payment verified successfully.");
      setIsVerifyPaymentModalOpen(false);
      setSelectedPayment(null);
      await fetchPaymentRecords();
    } catch (err: any) {
      console.error("Error verifying payment:", err);
      setErrorMessage("Unable to verify payment. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPaymentConfirm = async () => {
    if (!selectedPayment) return;
    if (!paymentRejectionReason.trim()) {
      setErrorMessage("Rejection reason is required.");
      return;
    }
    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const paymentId = selectedPayment.id;

      const { data, error } = await supabase.rpc("admin_reject_nexora_qr_payment", {
        payment_id: paymentId,
        rejection_reason: paymentRejectionReason
      });

      if (error) throw error;

      setSuccessMessage("Payment rejected successfully.");
      setIsRejectPaymentModalOpen(false);
      setPaymentRejectionReason("");
      setSelectedPayment(null);
      await fetchPaymentRecords();
    } catch (err: any) {
      console.error("Error rejecting payment:", err);
      setErrorMessage("Unable to reject payment. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenShopDetails = (shop: any) => {
    setSelectedShop(shop);
    // Retrieve services list from loaded map or fetch
    const services = shopServicesMap[shop.id] || [];
    setSelectedShopServices(services);
  };

  // Helper to generate elegant slug from shop name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // remove non-alphanumeric except space and hyphen
      .replace(/[\s_-]+/g, "-") // replace spaces/underscores/hyphens with a single hyphen
      .replace(/^-+|-+$/g, ""); // remove leading/trailing hyphens
  };

  // 1. Approve Shop
  const handleApproveConfirm = async () => {
    if (!selectedShop || !currentUser) return;

    // RULE: Owner cannot approve own shop
    if (selectedShop.owner_id === currentUser.id) {
      setErrorMessage("Owner cannot approve own shop.");
      setIsApproveModalOpen(false);
      return;
    }

    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const slug = selectedShop.slug || generateSlug(selectedShop.shop_name);

      const updateData: any = {
        approval_status: "approved",
        is_active: true,
        approved_at: new Date().toISOString(),
        approved_by: currentUser.id,
        published_at: new Date().toISOString(),
        rejection_reason: null,
      };

      if (!selectedShop.slug) {
        updateData.slug = slug;
      }

      const { error: updateErr } = await supabase
        .from("shops")
        .update(updateData)
        .eq("id", selectedShop.id);

      if (updateErr) throw updateErr;

      // Insert into shop_approval_logs
      const { error: logErr } = await supabase
        .from("shop_approval_logs")
        .insert({
          shop_id: selectedShop.id,
          admin_id: currentUser.id,
          action: "approved",
          previous_status: selectedShop.approval_status || "pending",
          new_status: "approved",
          reason: null
        });

      if (logErr) console.error("Error writing approval log:", logErr);

      setSuccessMessage("Shop approved successfully.");
      await fetchAllDashboardData();
      setSelectedShop(null);
      setIsApproveModalOpen(false);
    } catch (err: any) {
      console.error("Error approving shop:", err);
      setErrorMessage("Unable to complete action. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Reject Shop
  const handleRejectConfirm = async () => {
    if (!selectedShop || !currentUser) return;
    if (!rejectionReason.trim()) {
      setErrorMessage("Rejection reason is required.");
      return;
    }

    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error: updateErr } = await supabase
        .from("shops")
        .update({
          approval_status: "rejected",
          is_active: false,
          rejection_reason: rejectionReason
        })
        .eq("id", selectedShop.id);

      if (updateErr) throw updateErr;

      // Insert log
      const { error: logErr } = await supabase
        .from("shop_approval_logs")
        .insert({
          shop_id: selectedShop.id,
          admin_id: currentUser.id,
          action: "rejected",
          previous_status: selectedShop.approval_status || "pending",
          new_status: "rejected",
          reason: rejectionReason
        });

      if (logErr) console.error("Error writing rejection log:", logErr);

      setSuccessMessage("Shop rejected successfully.");
      await fetchAllDashboardData();
      setSelectedShop(null);
      setIsRejectModalOpen(false);
      setRejectionReason("");
    } catch (err: any) {
      console.error("Error rejecting shop:", err);
      setErrorMessage("Unable to complete action. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Suspend Shop
  const handleSuspendConfirm = async () => {
    if (!selectedShop || !currentUser) return;
    if (!suspensionReason.trim()) {
      setErrorMessage("Suspension reason is required.");
      return;
    }

    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error: updateErr } = await supabase
        .from("shops")
        .update({
          approval_status: "suspended",
          is_active: false,
          rejection_reason: suspensionReason
        })
        .eq("id", selectedShop.id);

      if (updateErr) throw updateErr;

      // Insert log
      const { error: logErr } = await supabase
        .from("shop_approval_logs")
        .insert({
          shop_id: selectedShop.id,
          admin_id: currentUser.id,
          action: "suspended",
          previous_status: selectedShop.approval_status || "approved",
          new_status: "suspended",
          reason: suspensionReason
        });

      if (logErr) console.error("Error writing suspension log:", logErr);

      setSuccessMessage("Shop suspended successfully.");
      await fetchAllDashboardData();
      setSelectedShop(null);
      setIsSuspendModalOpen(false);
      setSuspensionReason("");
    } catch (err: any) {
      console.error("Error suspending shop:", err);
      setErrorMessage("Unable to complete action. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Reactivate Approved Shop
  const handleReactivateConfirm = async () => {
    if (!selectedShop || !currentUser) return;

    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error: updateErr } = await supabase
        .from("shops")
        .update({
          approval_status: "approved",
          is_active: true,
          rejection_reason: null
        })
        .eq("id", selectedShop.id);

      if (updateErr) throw updateErr;

      // Insert log
      const { error: logErr } = await supabase
        .from("shop_approval_logs")
        .insert({
          shop_id: selectedShop.id,
          admin_id: currentUser.id,
          action: "reactivated",
          previous_status: selectedShop.approval_status || "suspended",
          new_status: "approved",
          reason: null
        });

      if (logErr) console.error("Error writing reactivation log:", logErr);

      setSuccessMessage("Shop reactivated successfully.");
      await fetchAllDashboardData();
      setSelectedShop(null);
      setIsReactivateModalOpen(false);
    } catch (err: any) {
      console.error("Error reactivating shop:", err);
      setErrorMessage("Unable to complete action. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Platform QR Image Upload
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size and extension
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const validExtensions = ["jpg", "jpeg", "png", "webp"];
    if (!validExtensions.includes(ext)) {
      setQrMessage({ type: "error", text: "Image must be JPG, PNG or WEBP." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setQrMessage({ type: "error", text: "Image size must be under 5MB." });
      return;
    }

    setUploadingQr(true);
    setQrMessage(null);

    try {
      const filePath = `company-qr/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("nexora-company-qr")
        .upload(filePath, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: publicUrlData } = supabase.storage
        .from("nexora-company-qr")
        .getPublicUrl(filePath);

      setQrImageUrl(publicUrlData.publicUrl);
      setQrMessage({ type: "success", text: "QR image uploaded. Please click 'Save QR Settings' to apply." });
    } catch (err: any) {
      console.error("Error uploading QR image:", err);
      setQrMessage({ type: "error", text: "Unable to upload image. Please try again." });
    } finally {
      setUploadingQr(false);
    }
  };

  // Save QR Settings Form
  const handleSaveQrSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrTitle.trim() || !qrPayeeName.trim() || !qrUpiId.trim()) {
      setQrMessage({ type: "error", text: "All fields except QR image are required." });
      return;
    }

    setSavingQr(true);
    setQrMessage(null);

    try {
      const payload = {
        title: qrTitle,
        payee_name: qrPayeeName,
        upi_id: qrUpiId,
        qr_image_url: qrImageUrl,
        is_active: qrIsActive,
        updated_at: new Date().toISOString()
      };

      if (qrId) {
        // Update
        const { error } = await supabase
          .from("platform_qr_settings")
          .update(payload)
          .eq("id", qrId);

        if (error) throw error;
      } else {
        // Insert
        const { data, error } = await supabase
          .from("platform_qr_settings")
          .insert({
            ...payload,
            created_at: new Date().toISOString()
          })
          .select();

        if (error) throw error;
        if (data && data.length > 0) {
          setQrId(data[0].id);
        }
      }

      // If set to active, ensure other settings are inactive
      if (qrIsActive && qrId) {
        await supabase
          .from("platform_qr_settings")
          .update({ is_active: false })
          .neq("id", qrId);
      }

      setQrMessage({ type: "success", text: "Nexora QR settings saved successfully." });
    } catch (err: any) {
      console.error("Error saving platform QR settings:", err);
      setQrMessage({ type: "error", text: "Unable to complete action. Please try again." });
    } finally {
      setSavingQr(false);
    }
  };

  // KPI calculations
  const totalShops = shops.length;
  const pendingShops = shops.filter(s => s.approval_status === "pending" || !s.approval_status).length;
  const approvedShops = shops.filter(s => s.approval_status === "approved").length;
  const rejectedShops = shops.filter(s => s.approval_status === "rejected").length;
  const suspendedShops = shops.filter(s => s.approval_status === "suspended").length;
  const activePublicWebsites = shops.filter(s => s.approval_status === "approved" && s.is_active === true).length;

  // Filtered shops for list
  const filteredShops = shops.filter(s => {
    const status = s.approval_status || "pending";
    if (filterStatus === "all") return true;
    return status === filterStatus;
  });

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-bold">Verifying admin credentials...</p>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-slate-900">Access Denied</h1>
          <p className="text-sm text-slate-500">
            Super admin access required.
          </p>

          {/* TEMP_ADMIN_DEBUG_REMOVE_LATER */}
          <div className="p-4 bg-slate-50 rounded-xl text-[10px] text-slate-500 text-left font-mono mt-4">
             Email: {currentUser?.email || "N/A"}
             <br/>
             User ID: {currentUser?.id || "N/A"}
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-3xs font-black text-blue-600 uppercase tracking-widest block">Nexora SalonOS</span>
            <h1 className="text-base font-black text-slate-900">Super Admin Control Center</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllDashboardData}
            disabled={loadingShops}
            className="p-2 hover:bg-slate-100 rounded-xl transition cursor-pointer text-slate-500 hover:text-slate-900 disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loadingShops ? "animate-spin text-blue-600" : ""}`} />
          </button>
          <button 
            onClick={() => navigateTo("/")}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Back to App
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Dynamic Alerts */}
        {successMessage && (
          <div className="p-4 rounded-3xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-bold flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-3xl bg-rose-50 text-rose-800 border border-rose-100 text-xs font-bold flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dashboard Tabs */}
        <div className="flex border-b border-slate-200 gap-6 overflow-x-auto scrollbar-none">
          {[
            { id: "overview", label: "Overview", icon: Globe },
            { id: "approvals", label: `Shop Approvals (${pendingShops})`, icon: FileText },
            { id: "qr_settings", label: "Nexora QR Settings", icon: QrCode },
            { id: "qr_payments", label: `QR Payment Verification (${paymentRecords.filter(p => p.status === 'pending').length})`, icon: CheckCircle },
            { id: "referral_settings", label: "Referral Settings", icon: Sparkles },
            { id: "membership_plans", label: "Membership Plans", icon: Award },
            { id: "finance", label: "Finance Control Center", icon: ShieldCheck },
            { id: "growth_partners", label: "Growth Partners", icon: Users },
            { id: "brands", label: "Brand Management", icon: Building2 },
            { id: "jobs", label: "Job Portal", icon: Briefcase },
            { id: "support", label: "Support & Trust", icon: ShieldCheck },
            { id: "app_analytics", label: "App Analytics", icon: Smartphone }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-xs font-black uppercase tracking-wider transition relative cursor-pointer flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? "text-blue-600 border-b-2 border-blue-600 font-black" 
                    : "text-slate-400 hover:text-slate-600 font-semibold"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Shops</span>
                <h3 className="text-2xl font-black text-slate-900">{totalShops}</h3>
                <p className="text-[9px] text-slate-400 font-medium">registered on platform</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-2">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider block">Pending</span>
                <h3 className="text-2xl font-black text-amber-600">{pendingShops}</h3>
                <p className="text-[9px] text-slate-400 font-medium">awaiting review</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-2">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider block">Approved</span>
                <h3 className="text-2xl font-black text-emerald-600">{approvedShops}</h3>
                <p className="text-[9px] text-slate-400 font-medium">on-boarded salons</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-2">
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider block">Rejected</span>
                <h3 className="text-2xl font-black text-rose-600">{rejectedShops}</h3>
                <p className="text-[9px] text-slate-400 font-medium">rejected applications</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-2">
                <span className="text-[10px] font-black text-red-500 uppercase tracking-wider block">Suspended</span>
                <h3 className="text-2xl font-black text-red-600">{suspendedShops}</h3>
                <p className="text-[9px] text-slate-400 font-medium">temporarily banned</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-2 bg-gradient-to-br from-blue-50/20 to-indigo-50/10">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">Live Websites</span>
                <h3 className="text-2xl font-black text-blue-700">{activePublicWebsites}</h3>
                <p className="text-[9px] text-slate-400 font-medium">active public stores</p>
              </div>

            </div>

            {/* Quick platform update info */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Nexora Platform Directives</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-2xl font-light">
                  All newly registered salons remain locked in "Pending" status and cannot be searched or accessed via public links. Upon approval, their custom SEO friendly slug is reserved and they gain full access to scheduling tools and client bookings.
                </p>
              </div>
              <button 
                onClick={() => setActiveTab("approvals")}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition shadow-md shadow-blue-500/10 whitespace-nowrap cursor-pointer"
              >
                View Approvals Queue
              </button>
            </div>

            {/* Server Secrets Diagnostic Component */}
            <ServerSecretDiagnostic />
          </div>
        )}

        {/* Tab 2: SHOP APPROVALS */}
        {activeTab === "approvals" && (
          <div className="space-y-6">
            
            {/* Filter buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "All Shops" },
                  { id: "pending", label: `Pending (${pendingShops})` },
                  { id: "approved", label: `Approved (${approvedShops})` },
                  { id: "rejected", label: `Rejected (${rejectedShops})` },
                  { id: "suspended", label: `Suspended (${suspendedShops})` }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterStatus(f.id as any)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                      filterStatus === f.id 
                        ? "bg-blue-600 text-white shadow-sm" 
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Showing {filteredShops.length} stores
              </span>
            </div>

            {/* Shop list */}
            {filteredShops.length === 0 ? (
              <div className="bg-white py-16 text-center rounded-3xl border border-slate-100 text-slate-400 font-medium">
                No shops found matching the selected status filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredShops.map((shop) => {
                  const status = shop.approval_status || "pending";
                  const sCount = servicesCounts[shop.id] || 0;
                  return (
                    <div 
                      key={shop.id} 
                      className="bg-white rounded-3xl border border-slate-100 shadow-2xs flex flex-col justify-between overflow-hidden hover:border-slate-200 transition group"
                    >
                      {/* Shop Preview Header */}
                      <div className="p-5 space-y-4 flex-1">
                        <div className="flex justify-between items-start">
                          <span className="text-3xs font-mono bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg">
                            Owner: #{shop.owner_id ? shop.owner_id.slice(0, 8) : "N/A"}
                          </span>
                          
                          <div className="flex flex-col gap-1 items-end">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              status === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                              status === "pending" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                              status === "rejected" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                              "bg-red-50 text-red-700 border border-red-100"
                            }`}>
                              {status}
                            </span>
                            <span className={`text-[8px] font-bold uppercase ${
                              shop.is_active ? "text-emerald-500" : "text-slate-400"
                            }`}>
                              {shop.is_active ? "● Publicly Active" : "○ Offline"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 pt-1">
                          <h4 className="text-sm font-black text-slate-900 leading-tight group-hover:text-blue-600 transition">
                            {shop.shop_name}
                          </h4>
                          <p className="text-xs text-slate-400 font-medium capitalize">
                            {shop.category ? shop.category.replace("_", " ") : "Beauty"}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 text-3xs text-slate-400 pt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-300" />
                          <span>{shop.area || "Area"}, {shop.city || "Jaipur"}</span>
                        </div>

                        <div className="border-t border-dashed border-slate-100 pt-3.5 flex items-center justify-between text-3xs text-slate-400">
                          <div>
                            Template: <span className="font-bold text-slate-700 font-mono capitalize">{shop.selected_template || "modern"}</span>
                          </div>
                          <div>
                            Services: <span className="font-bold text-slate-700">{sCount}</span>
                          </div>
                        </div>

                        {shop.rejection_reason && (
                          <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100 text-3xs text-rose-700 italic leading-relaxed">
                            Reason: "{shop.rejection_reason}"
                          </div>
                        )}
                      </div>

                      {/* Detail Link button */}
                      <div className="bg-slate-50 border-t border-slate-100 px-5 py-3.5 flex justify-between items-center">
                        <span className="text-[9px] text-slate-400 font-medium font-mono">
                          Registered: {shop.created_at ? new Date(shop.created_at).toLocaleDateString() : "-"}
                        </span>
                        
                        <button
                          onClick={() => handleOpenShopDetails(shop)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition cursor-pointer"
                        >
                          View Details
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: NEXORA QR SETTINGS */}
        {activeTab === "qr_settings" && (
          <div className="max-w-2xl mx-auto space-y-6">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              
              <div className="space-y-1.5">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Platform QR Code Management</h3>
                <p className="text-2xs text-slate-400 leading-relaxed">
                  Configure the primary Nexora company QR code used by customers at checkout. Registered owners are prohibited from uploading individual QR codes; all payments route to Nexora first.
                </p>
              </div>

              {/* Form Feedback Alert */}
              {qrMessage && (
                <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                  qrMessage.type === "success" 
                    ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                    : "bg-rose-50 text-rose-800 border-rose-100"
                }`}>
                  <CheckCircle className="w-4 h-4" />
                  <span>{qrMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveQrSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-3xs font-black uppercase tracking-wider text-slate-400">QR Title Label</label>
                    <input 
                      required
                      type="text"
                      value={qrTitle}
                      onChange={(e) => setQrTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-blue-600 outline-none transition-all font-semibold"
                      placeholder="Nexora SalonOS UPI Pay"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-3xs font-black uppercase tracking-wider text-slate-400">Payee Merchant Name</label>
                    <input 
                      required
                      type="text"
                      value={qrPayeeName}
                      onChange={(e) => setQrPayeeName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                      placeholder="e.g. Nexora Beauty Solutions"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-3xs font-black uppercase tracking-wider text-slate-400">UPI ID / Address</label>
                    <input 
                      required
                      type="text"
                      value={qrUpiId}
                      onChange={(e) => setQrUpiId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-blue-600 outline-none transition-all font-mono"
                      placeholder="e.g. nexorapay@bank"
                    />
                  </div>

                </div>

                {/* QR Image File Upload */}
                <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-3xs font-black uppercase tracking-wider text-slate-400 font-black">QR Code Image</label>
                      <span className="text-[10px] text-slate-400 font-medium">JPG, PNG, WEBP. Max 5MB</span>
                    </div>
                    {qrImageUrl && (
                      <button
                        type="button"
                        onClick={() => setQrImageUrl("")}
                        className="text-3xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-100 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="relative w-28 h-28 rounded-2xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
                      {uploadingQr ? (
                        <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white text-[10px] font-bold">
                          <Loader2 className="w-5 h-5 animate-spin text-white mb-1" />
                          Uploading...
                        </div>
                      ) : qrImageUrl ? (
                        <img 
                          src={qrImageUrl} 
                          alt="Company QR Preview" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain p-1.5" 
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-3 text-center">
                          <QrCode className="w-8 h-8 text-slate-300 mb-1" />
                          <span className="text-[9px] text-slate-400 font-bold">No Image</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <label className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-3xs font-bold rounded-xl cursor-pointer shadow-sm transition">
                        <Upload className="w-3.5 h-3.5" />
                        {uploadingQr ? "Uploading File..." : "Select QR Image File"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleQrUpload}
                          disabled={uploadingQr}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-slate-400 font-light leading-normal">
                        This image is rendered on the public website booking details page and shop fronts.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-3xs font-black text-slate-400 uppercase tracking-wider block">Activate QR Configuration</span>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                      If active, this UPI details structure is embedded onto approved websites.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={qrIsActive} 
                      onChange={(e) => setQrIsActive(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={savingQr || uploadingQr}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-blue-500/10"
                >
                  {savingQr ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Saving settings...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4" />
                      Save QR Settings
                    </>
                  )}
                </button>
              </form>

            </div>
          </div>
        )}

        {/* Tab 4: REFERRAL SETTINGS */}
        {activeTab === "referral_settings" && (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-6">Referral Reward Settings</h3>
                {referralSettings ? (
                    <div className="space-y-4">
                        <p className="text-xs text-slate-500">Min Payment: ₹{referralSettings.min_payment_amount}</p>
                        <p className="text-xs text-slate-500">Referrer Reward: ₹{referralSettings.referrer_reward_amount}</p>
                        <p className="text-xs text-slate-500">Referred Reward: ₹{referralSettings.referred_customer_reward_amount}</p>
                        <p className="text-xs text-slate-500">Active: {referralSettings.is_active ? "Yes" : "No"}</p>
                    </div>
                ) : (
                    <p className="text-sm font-bold text-slate-500">Loading settings...</p>
                )}
            </div>
        )}

        {/* Tab 5: MEMBERSHIP PLANS */}
        {activeTab === "membership_plans" && (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-6">Membership Plans</h3>
                <div className="space-y-4">
                    {membershipPlans.map(plan => (
                        <div key={plan.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
                            <div>
                                <p className="font-bold text-slate-900">{plan.name}</p>
                                <p className="text-xs text-slate-500">Discount: {plan.discount_percent}%</p>
                            </div>
                            <button className="text-xs font-bold text-blue-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">Edit</button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Tab Finance Control Center */}
        {activeTab === "finance" && (
            <FinanceControlCenter />
        )}

        {/* Tab Growth Partners */}
        {activeTab === "growth_partners" && (
            <GrowthPartnersSection 
              showNotification={(type, text) => {
                if (type === "success") {
                  setSuccessMessage(text);
                } else {
                  setErrorMessage(text);
                }
              }} 
            />
        )}

        {/* Tab Brand Management */}
        {activeTab === "brands" && (
            <BrandsSection />
        )}

        {/* Tab Job Portal */}
        {activeTab === "jobs" && (
            <JobPortalAdmin />
        )}

        {/* Tab Support & Trust */}
        {activeTab === "support" && (
            <SupportAdmin />
        )}

        {/* Tab App Analytics */}
        {activeTab === "app_analytics" && (
            <AppAnalytics />
        )}

      </main>

      {/* Shop Detail Drawer / Modal Overlay */}
      {selectedShop && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-end font-sans">
          <div className="bg-white w-full max-w-xl min-h-screen p-8 flex flex-col justify-between shadow-2xl relative animate-slide-left overflow-y-auto">
            
            <button 
              onClick={() => setSelectedShop(null)} 
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition text-slate-400 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6 flex-1 pb-8">
              {/* Header */}
              <div className="space-y-1.5 pr-8">
                <span className="text-3xs font-black uppercase text-blue-600 tracking-wider">
                  Shop Identity Audit
                </span>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {selectedShop.shop_name}
                </h3>
                <p className="text-xs text-slate-400 capitalize font-medium">
                  {selectedShop.category ? selectedShop.category.replace("_", " ") : "General Category"}
                </p>
              </div>

              {/* Layout banner / logo previews if available */}
              {(selectedShop.logo_url || selectedShop.banner_url || selectedShop.cover_image_url) && (
                <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {selectedShop.logo_url && (
                    <div className="space-y-1 text-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Logo</span>
                      <div className="w-14 h-14 rounded-full border border-slate-200 bg-white mx-auto overflow-hidden flex items-center justify-center">
                        <img src={selectedShop.logo_url} alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                  {(selectedShop.banner_url || selectedShop.cover_image_url) && (
                    <div className="col-span-2 space-y-1">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Banner</span>
                      <div className="h-14 rounded-xl border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
                        <img 
                          src={selectedShop.banner_url || selectedShop.cover_image_url} 
                          alt="Cover" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {selectedShop.description && (
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">About/Description</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-light bg-slate-50 p-4 rounded-2xl border border-slate-100/60">
                    "{selectedShop.description}"
                  </p>
                </div>
              )}

              {/* Details table Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Address</span>
                  <p className="font-semibold text-slate-800 pt-0.5">{selectedShop.address || "N/A"}</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Area, City</span>
                  <p className="font-semibold text-slate-800 pt-0.5">{selectedShop.area || "N/A"}, {selectedShop.city || "Jaipur"}</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Phone Contact</span>
                  <p className="font-semibold text-slate-800 pt-0.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {selectedShop.phone || "N/A"}
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">WhatsApp Business</span>
                  <p className="font-semibold text-slate-800 pt-0.5 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    {selectedShop.whatsapp || "N/A"}
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Working Schedule</span>
                  <p className="font-semibold text-slate-800 pt-0.5">
                    {selectedShop.opening_time || "09:00 AM"} - {selectedShop.closing_time || "08:00 PM"}
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Weekly Off Day</span>
                  <p className="font-semibold text-slate-800 pt-0.5 capitalize">{selectedShop.weekly_off || "None"}</p>
                </div>

              </div>

              {/* Template */}
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-500">Selected Website Template:</span>
                <span className="px-3 py-1 bg-white rounded-lg border border-slate-200 text-3xs font-black font-mono uppercase text-slate-700">
                  {selectedShop.selected_template || "modern_salon"}
                </span>
              </div>

              {/* Services List inside shop */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Menu / Services Catalog ({selectedShopServices.length})
                </span>
                
                {selectedShopServices.length === 0 ? (
                  <div className="p-4 rounded-2xl border border-slate-100 text-center text-slate-400 text-xs font-medium">
                    No services created for this salon menu yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {selectedShopServices.map((s) => (
                      <div key={s.id} className="pt-2 flex justify-between items-center text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">{s.service_name}</p>
                          <p className="text-3xs text-slate-400 font-medium capitalize">{s.category || "General"} • {s.duration_minutes} mins</p>
                        </div>
                        <span className="font-black text-blue-600">₹{s.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Actions panel */}
            <div className="border-t border-slate-100 pt-6 mt-6 space-y-4">
              
              <div className="flex flex-wrap gap-3">
                {/* Approve Button */}
                {(selectedShop.approval_status !== "approved" || !selectedShop.is_active) && (
                  <button
                    onClick={() => setIsApproveModalOpen(true)}
                    className="flex-1 min-w-[120px] py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition cursor-pointer shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Shop
                  </button>
                )}

                {/* Reactivate Button (Only for Suspended Shop) */}
                {selectedShop.approval_status === "suspended" && (
                  <button
                    onClick={() => setIsReactivateModalOpen(true)}
                    className="flex-1 min-w-[120px] py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition cursor-pointer shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Reactivate Shop
                  </button>
                )}

                {/* Reject Button (Only for Pending) */}
                {selectedShop.approval_status === "pending" && (
                  <button
                    onClick={() => setIsRejectModalOpen(true)}
                    className="flex-1 min-w-[120px] py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Application
                  </button>
                )}

                {/* Suspend Button (Only for Approved) */}
                {selectedShop.approval_status === "approved" && (
                  <button
                    onClick={() => setIsSuspendModalOpen(true)}
                    className="flex-1 min-w-[120px] py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-xs transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Suspend Shop
                  </button>
                )}
              </div>

              <button 
                onClick={() => setSelectedShop(null)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition cursor-pointer"
              >
                Close Drawer
              </button>

            </div>

          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {isApproveModalOpen && selectedShop && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-6 font-sans">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl border border-slate-100 shadow-2xl space-y-5 animate-fade-in">
            <h3 className="text-base font-black text-slate-900">Approve Shop</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to approve <span className="font-bold text-slate-900">"{selectedShop.shop_name}"</span>? 
              This will automatically allocate their live slug subdomain and activate their public booking website.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveConfirm}
                disabled={actionLoading}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1"
              >
                {actionLoading ? "Processing..." : "Yes, Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {isRejectModalOpen && selectedShop && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-6 font-sans">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl border border-slate-100 shadow-2xl space-y-4 animate-fade-in">
            <h3 className="text-base font-black text-slate-900">Reject Shop Application</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Please enter a detailed explanation of why the registration for <span className="font-bold text-slate-900">"{selectedShop.shop_name}"</span> is being rejected. The owner will see this feedback.
            </p>

            <textarea
              required
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-rose-500 outline-none transition-all resize-none"
              placeholder="e.g. Incomplete verification documents. Shop license copy is expired or blurry."
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectionReason("");
                }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={actionLoading || !rejectionReason.trim()}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? "Processing..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Reason Modal */}
      {isSuspendModalOpen && selectedShop && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-6 font-sans">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl border border-slate-100 shadow-2xl space-y-4 animate-fade-in">
            <h3 className="text-base font-black text-slate-900">Suspend Salon Store</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Please specify the required reason for suspending <span className="font-bold text-slate-900">"{selectedShop.shop_name}"</span>. 
              The store website will be immediately turned offline and inaccessible.
            </p>

            <textarea
              required
              rows={4}
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none"
              placeholder="e.g. Unresolved customer hygiene complaints. Failure to update active salon menu pricing."
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsSuspendModalOpen(false);
                  setSuspensionReason("");
                }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendConfirm}
                disabled={actionLoading || !suspensionReason.trim()}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? "Processing..." : "Confirm Suspension"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reactivate Confirmation Modal */}
      {isReactivateModalOpen && selectedShop && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-6 font-sans">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl border border-slate-100 shadow-2xl space-y-5 animate-fade-in">
            <h3 className="text-base font-black text-slate-900">Reactivate Suspended Shop</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to lift the suspension for <span className="font-bold text-slate-900">"{selectedShop.shop_name}"</span>? 
              This will re-approve their website and make it live for customers immediately.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsReactivateModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReactivateConfirm}
                disabled={actionLoading}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? "Processing..." : "Yes, Reactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
