import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  Award, 
  CheckCircle, 
  X, 
  AlertCircle, 
  ShieldCheck, 
  FileText,
  MapPin,
  Plus,
  Loader2,
  Wallet,
  Building,
  CreditCard,
  Check,
  Eye,
  Info,
  BookOpen,
  Calendar,
  ClipboardList,
  Search,
  Filter
} from "lucide-react";

interface GrowthPartnersSectionProps {
  showNotification: (type: "success" | "error", text: string) => void;
}

export default function GrowthPartnersSection({ showNotification }: GrowthPartnersSectionProps) {
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<
    "applications" | "partners" | "leads" | "visits" | "tasks" | "assignments" | "ledger" | "payouts" | "training" | "milestones"
  >("applications");

  // Data States
  const [applications, setApplications] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [ledgerRows, setLedgerRows] = useState<any[]>([]);
  const [allShops, setAllShops] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);

  // 9B New Admin Data States
  const [leads, setLeads] = useState<any[]>([]);
  const [visitLogs, setVisitLogs] = useState<any[]>([]);
  const [onboardingTasks, setOnboardingTasks] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [trainingProgress, setTrainingProgress] = useState<any[]>([]);
  const [trainingModules, setTrainingModules] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);

  // Filtering & Searching States
  const [appFilter, setAppFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [leadPartnerFilter, setLeadPartnerFilter] = useState<string>("all");
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>("all");
  const [leadDistrictSearch, setLeadDistrictSearch] = useState<string>("");

  // Selection / Modal States
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [assignPartner, setAssignPartner] = useState<any | null>(null);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Link Converted Shop Modal/State
  const [linkingLead, setLinkingLead] = useState<any | null>(null);
  const [linkingShopId, setLinkingShopId] = useState("");

  // Manual Payout Form State
  const [payoutPartner, setPayoutPartner] = useState<any | null>(null);
  const [payoutRef, setPayoutRef] = useState("");
  const [payoutAmount, setPayoutAmount] = useState(0);

  // Partner Training detail expanded state
  const [expandedPartnerTrainingId, setExpandedPartnerTrainingId] = useState<string | null>(null);

  // 9C New Admin Payout Actions State
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [targetPartnerId, setTargetPartnerId] = useState("all");
  const [generatingPayouts, setGeneratingPayouts] = useState(false);

  // Mark Paid dialog state
  const [paidPayoutId, setPaidPayoutId] = useState<string | null>(null);
  const [paidReference, setPaidReference] = useState("");

  // Mark Failed dialog state
  const [failedPayoutId, setFailedPayoutId] = useState<string | null>(null);
  const [failureReasonStr, setFailureReasonStr] = useState("");

  // Admin view breakdown details state
  const [adminSelectedPayout, setAdminSelectedPayout] = useState<any | null>(null);
  const [adminPayoutItems, setAdminPayoutItems] = useState<any[]>([]);
  const [loadingAdminPayoutItems, setLoadingAdminPayoutItems] = useState(false);

  useEffect(() => {
    // Prefill last Monday and Sunday
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday is 0, Monday is 1...
    
    // Calculate last Monday
    const lastMonday = new Date(today);
    const mondayDiff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    lastMonday.setDate(today.getDate() + mondayDiff - 7);
    
    // Calculate last Sunday
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);
    
    setWeekStart(lastMonday.toISOString().split('T')[0]);
    setWeekEnd(lastSunday.toISOString().split('T')[0]);
  }, []);

  // 9C Admin Summary KPI States
  const [adminSummary, setAdminSummary] = useState<any | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const fetchAdminSummary = async () => {
    setLoadingSummary(true);
    setSummaryError(null);
    try {
      const { data, error } = await supabase.rpc("admin_get_partner_summary");
      if (error) throw error;
      setAdminSummary(data);
    } catch (err: any) {
      console.error("Error loading admin partner summary:", err);
      setSummaryError(err.message || "Failed to load admin summary KPIs.");
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch admin summary
      await fetchAdminSummary();
      
      // 1. Fetch Applications
      const { data: apps } = await supabase
        .from("partner_applications")
        .select("*")
        .order("created_at", { ascending: false });
      setApplications(apps || []);

      // 2. Fetch Partners
      const { data: ptners } = await supabase
        .from("partner_profiles")
        .select("*")
        .order("created_at", { ascending: false });
      setPartners(ptners || []);

      // 3. Fetch Ledger
      const { data: ledg } = await supabase
        .from("partner_commission_ledger")
        .select("*")
        .order("created_at", { ascending: false });
      setLedgerRows(ledg || []);

      // 4. Fetch All Shops (for dropdowns)
      const { data: shops } = await supabase
        .from("shops")
        .select("id, name, city, area");
      setAllShops(shops || []);

      // 5. Fetch Weekly Payouts
      const { data: pay } = await supabase
        .from("partner_weekly_payouts")
        .select("*")
        .order("created_at", { ascending: false });
      setPayouts(pay || []);

      // 6. Fetch Leads
      const { data: leadsData } = await supabase
        .from("partner_leads")
        .select("*")
        .order("created_at", { ascending: false });
      setLeads(leadsData || []);

      // 7. Fetch Visit Logs
      const { data: visitLogsData } = await supabase
        .from("partner_visit_logs")
        .select("*")
        .order("visit_at", { ascending: false });
      setVisitLogs(visitLogsData || []);

      // 8. Fetch Onboarding Tasks
      const { data: tasksData } = await supabase
        .from("partner_onboarding_tasks")
        .select("*")
        .order("created_at", { ascending: false });
      setOnboardingTasks(tasksData || []);

      // 9. Fetch Shop Assignments
      const { data: assignmentsData } = await supabase
        .from("partner_shop_assignments")
        .select("*")
        .order("created_at", { ascending: false });
      setAssignments(assignmentsData || []);

      // 10. Fetch Training Modules
      const { data: modulesData } = await supabase
        .from("partner_training_modules")
        .select("*")
        .order("display_order", { ascending: true });
      setTrainingModules(modulesData || []);

      // 11. Fetch Training Progress
      const { data: progressData } = await supabase
        .from("partner_training_progress")
        .select("*");
      setTrainingProgress(progressData || []);

      // 12. Fetch Milestones
      const { data: milestonesData } = await supabase
        .from("partner_milestone_rewards")
        .select("*")
        .order("milestone_shops", { ascending: true });
      setMilestones(milestonesData || []);

    } catch (err) {
      console.error("Error fetching admin growth partners data:", err);
      showNotification("error", "Failed to load growth partners module data.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApp = async (appId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.rpc("admin_approve_partner_application", {
        p_application_id: appId
      });

      if (error) throw error;

      showNotification("success", "Application approved successfully! Partner profile has been auto-created.");
      setSelectedApp(null);
      await fetchData();
    } catch (err: any) {
      console.error("Approve error:", err);
      showNotification("error", err.message || "Failed to approve partner application.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectApp = async (appId: string) => {
    if (!rejectionReason) {
      showNotification("error", "Please provide a reason for rejection.");
      return;
    }
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("partner_applications")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason,
          rejected_at: new Date().toISOString(),
          admin_note: `Rejected by super_admin on ${new Date().toLocaleDateString()}`
        })
        .eq("id", appId);

      if (error) throw error;

      showNotification("success", "Application marked as rejected.");
      setSelectedApp(null);
      setShowRejectForm(false);
      setRejectionReason("");
      await fetchData();
    } catch (err: any) {
      console.error("Reject error:", err);
      showNotification("error", err.message || "Failed to reject partner application.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignPartner || !selectedShopId) return;

    setActionLoading(true);
    try {
      const { error } = await supabase.rpc("admin_assign_shop_to_partner", {
        p_partner_id: assignPartner.id,
        p_shop_id: selectedShopId
      });

      if (error) throw error;

      showNotification("success", "Shop assigned successfully! Commission mapping is now active.");
      setAssignPartner(null);
      setSelectedShopId("");
      await fetchData();
    } catch (err: any) {
      console.error("Assignment error:", err);
      showNotification("error", err.message || "Failed to assign shop. Make sure shop is not already assigned to another active partner.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcessManualPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutPartner || payoutAmount <= 0 || !payoutRef) return;

    setActionLoading(true);
    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const weekEnd = new Date();

      // 1. Create a row in partner_weekly_payouts
      const { error: payoutErr } = await supabase
        .from("partner_weekly_payouts")
        .insert({
          partner_id: payoutPartner.id,
          partner_user_id: payoutPartner.user_id,
          week_start: weekStart.toISOString().split("T")[0],
          week_end: weekEnd.toISOString().split("T")[0],
          total_commission_amount: payoutAmount,
          payout_amount: payoutAmount,
          status: "paid",
          payout_reference: payoutRef,
          processed_at: new Date().toISOString()
        });

      if (payoutErr) throw payoutErr;

      // 2. Update ledger rows to 'paid'
      const { error: ledgerErr } = await supabase
        .from("partner_commission_ledger")
        .update({
          status: "paid",
          paid_at: new Date().toISOString()
        })
        .eq("partner_id", payoutPartner.id)
        .eq("status", "unpaid");

      if (ledgerErr) throw ledgerErr;

      // 3. Update partner profile
      const { error: profileErr } = await supabase
        .from("partner_profiles")
        .update({
          paid_partner_earning: (payoutPartner.paid_partner_earning || 0) + payoutAmount,
          pending_partner_earning: 0,
          updated_at: new Date().toISOString()
        })
        .eq("id", payoutPartner.id);

      if (profileErr) throw profileErr;

      showNotification("success", "Manual payout recorded successfully! Partner profile and commission ledger rows updated.");
      setPayoutPartner(null);
      setPayoutRef("");
      setPayoutAmount(0);
      await fetchData();
    } catch (err: any) {
      console.error("Payout error:", err);
      showNotification("error", err.message || "Failed to process payout.");
    } finally {
      setActionLoading(false);
    }
  };

  // Link Converted Lead to Actual Shop
  const handleLinkLeadToShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingLead || !linkingShopId) return;

    setActionLoading(true);
    try {
      // 1. Update the lead's converted_shop_id in partner_leads
      const { error: leadErr } = await supabase
        .from("partner_leads")
        .update({
          converted_shop_id: linkingShopId,
          status: "converted",
          updated_at: new Date().toISOString()
        })
        .eq("id", linkingLead.id);

      if (leadErr) throw leadErr;

      // 2. Map this shop as an assignment to the partner
      const { error: assignErr } = await supabase.rpc("admin_assign_shop_to_partner", {
        p_partner_id: linkingLead.partner_id,
        p_shop_id: linkingShopId
      });

      if (assignErr) {
        console.warn("Auto-assignment warn: shop may already have active mapping:", assignErr.message);
      }

      showNotification("success", "Converted Lead linked to actual registered shop and assigned to partner successfully!");
      setLinkingLead(null);
      setLinkingShopId("");
      await fetchData();
    } catch (err: any) {
      console.error("Error linking lead to shop:", err);
      showNotification("error", err.message || "Failed to link lead to shop.");
    } finally {
      setActionLoading(false);
    }
  };

  // 9C New Payout Action Handlers
  const handleGeneratePayouts = async () => {
    if (!weekStart || !weekEnd) {
      showNotification("error", "Please provide both start and end dates.");
      return;
    }
    setGeneratingPayouts(true);
    try {
      if (targetPartnerId === "all") {
        const { data, error } = await supabase.rpc("admin_generate_all_partner_weekly_payouts", {
          p_week_start: weekStart,
          p_week_end: weekEnd
        });
        if (error) throw error;
        showNotification("success", `Successfully generated weekly payouts cycle for all eligible partners!`);
      } else {
        const { data, error } = await supabase.rpc("admin_generate_partner_weekly_payout", {
          p_partner_id: targetPartnerId,
          p_week_start: weekStart,
          p_week_end: weekEnd
        });
        if (error) throw error;
        showNotification("success", `Successfully generated weekly payout for selected partner!`);
      }
      await fetchData();
    } catch (err: any) {
      console.error("Error generating payouts:", err);
      showNotification("error", err.message || "Failed to generate weekly payouts batch.");
    } finally {
      setGeneratingPayouts(false);
    }
  };

  const handleMarkPayoutProcessing = async (payoutId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.rpc("admin_mark_partner_payout_processing", {
        p_payout_id: payoutId
      });
      if (error) throw error;
      showNotification("success", "Payout marked as processing.");
      await fetchData();
    } catch (err: any) {
      console.error("Error marking payout processing:", err);
      showNotification("error", err.message || "Failed to mark payout as processing.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPayoutPaidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paidPayoutId || !paidReference.trim()) {
      showNotification("error", "Please provide a valid transfer reference.");
      return;
    }
    setActionLoading(true);
    try {
      const { error } = await supabase.rpc("admin_mark_partner_payout_paid", {
        p_payout_id: paidPayoutId,
        p_payout_reference: paidReference.trim()
      });
      if (error) throw error;
      showNotification("success", "Payout successfully finalized and marked as PAID!");
      setPaidPayoutId(null);
      setPaidReference("");
      await fetchData();
    } catch (err: any) {
      console.error("Error marking payout paid:", err);
      showNotification("error", err.message || "Failed to finalize paid payout.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPayoutFailedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!failedPayoutId || !failureReasonStr.trim()) {
      showNotification("error", "Please provide a valid failure reason.");
      return;
    }
    setActionLoading(true);
    try {
      const { error } = await supabase.rpc("admin_mark_partner_payout_failed", {
        p_payout_id: failedPayoutId,
        p_failure_reason: failureReasonStr.trim()
      });
      if (error) throw error;
      showNotification("success", "Payout marked as FAILED. Wallet ledger balances are rollbacked automatically.");
      setFailedPayoutId(null);
      setFailureReasonStr("");
      await fetchData();
    } catch (err: any) {
      console.error("Error marking payout failed:", err);
      showNotification("error", err.message || "Failed to fail payout.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewAdminPayoutBreakdown = async (payout: any) => {
    setAdminSelectedPayout(payout);
    setAdminPayoutItems([]);
    setLoadingAdminPayoutItems(true);
    try {
      const { data, error } = await supabase
        .from("partner_weekly_payout_items")
        .select(`
          id,
          payout_id,
          commission_ledger_id,
          amount,
          created_at
        `)
        .eq("payout_id", payout.id);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const ledgerIds = data.map(item => item.commission_ledger_id).filter(Boolean);
        if (ledgerIds.length > 0) {
          const { data: ledgerDetails, error: ledgerErr } = await supabase
            .from("partner_commission_ledger")
            .select("id, booking_id, nexora_commission_amount, partner_commission_rate, created_at")
            .in("id", ledgerIds);
          
          if (!ledgerErr && ledgerDetails) {
            const enriched = data.map(item => {
              const led = ledgerDetails.find(l => l.id === item.commission_ledger_id);
              return { ...item, ledger: led };
            });
            setAdminPayoutItems(enriched);
            return;
          }
        }
      }
      setAdminPayoutItems(data || []);
    } catch (err) {
      console.error("Error loading admin payout breakdown items:", err);
      showNotification("error", "Failed to load individual payout items.");
    } finally {
      setLoadingAdminPayoutItems(false);
    }
  };

  // Milestone rewarded action
  const handleRewardMilestone = async (milestoneId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("partner_milestone_rewards")
        .update({
          status: "rewarded",
          updated_at: new Date().toISOString()
        })
        .eq("id", milestoneId);

      if (error) throw error;
      showNotification("success", "Milestone reward status marked as REWARDED successfully!");
      await fetchData();
    } catch (err: any) {
      showNotification("error", err.message || "Failed to reward milestone.");
    } finally {
      setActionLoading(false);
    }
  };

  // Helper: map partner profiles to ID
  const getPartnerName = (partnerId: string) => {
    const p = partners.find(part => part.id === partnerId);
    return p ? p.full_name : "Unknown Partner";
  };

  const filteredApps = applications.filter(app => {
    if (appFilter === "all") return true;
    return app.status === appFilter;
  });

  const filteredLeads = leads.filter(lead => {
    const partnerMatch = leadPartnerFilter === "all" || lead.partner_id === leadPartnerFilter;
    const statusMatch = leadStatusFilter === "all" || lead.status === leadStatusFilter;
    const districtMatch = !leadDistrictSearch || (lead.district && lead.district.toLowerCase().includes(leadDistrictSearch.toLowerCase()));
    return partnerMatch && statusMatch && districtMatch;
  });

  return (
    <div id="admin_growth_partners" className="space-y-8 font-sans">
      {/* Admin Growth Partner Summary Header */}
      <div className="flex justify-between items-center bg-white p-5 border border-slate-100 rounded-3xl shadow-3xs">
        <div>
          <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider">Admin Growth Partner Summary</h2>
          <p className="text-[10px] text-slate-400 font-medium">Real-time status tracking via database RPC metrics.</p>
        </div>
        <button 
          onClick={fetchAdminSummary}
          disabled={loadingSummary}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          {loadingSummary ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5" />}
          Refresh KPIs
        </button>
      </div>

      {/* Error Alert Card */}
      {summaryError && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <div className="flex-1">
            <p className="font-bold">Summary Sync Issue</p>
            <p className="text-[10px] text-rose-700 font-medium font-sans">{summaryError}</p>
          </div>
          <button 
            onClick={fetchAdminSummary}
            className="px-3 py-1 bg-white border border-rose-200 text-rose-700 text-[10px] font-black uppercase rounded-lg hover:bg-rose-50 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 12 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* 1. Total Applications */}
        <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Total Applications</span>
          <p className="text-lg font-black text-slate-900">{adminSummary?.total_applications ?? applications.length}</p>
          <p className="text-[8px] text-slate-400 font-medium">All applications submitted</p>
        </div>

        {/* 2. Pending Applications */}
        <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
          <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider block">Pending Applications</span>
          <p className="text-lg font-black text-amber-600">{adminSummary?.pending_applications ?? applications.filter(a => a.status === 'pending').length}</p>
          <p className="text-[8px] text-slate-400 font-medium">Awaiting admin review</p>
        </div>

        {/* 3. Approved Partners */}
        <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
          <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider block">Approved Partners</span>
          <p className="text-lg font-black text-blue-600">{adminSummary?.approved_partners ?? partners.length}</p>
          <p className="text-[8px] text-slate-400 font-medium">Active partners directory</p>
        </div>

        {/* 4. Suspended Partners */}
        <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
          <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider block">Suspended Partners</span>
          <p className="text-lg font-black text-rose-600">{adminSummary?.suspended_partners ?? 0}</p>
          <p className="text-[8px] text-slate-400 font-medium">Accounts temporarily paused</p>
        </div>

        {/* 5. Total Leads */}
        <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Total Leads</span>
          <p className="text-lg font-black text-slate-900">{adminSummary?.total_leads ?? leads.length}</p>
          <p className="text-[8px] text-slate-400 font-medium">Registered lead pipelines</p>
        </div>

        {/* 6. Converted Leads */}
        <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wider block">Converted Leads</span>
          <p className="text-lg font-black text-emerald-600">{adminSummary?.converted_leads ?? leads.filter(l => l.status === 'converted').length}</p>
          <p className="text-[8px] text-slate-400 font-medium">Converted into real shops</p>
        </div>

        {/* 7. Active Shop Assignments */}
        <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Active Assignments</span>
          <p className="text-lg font-black text-slate-900">{adminSummary?.active_shop_assignments ?? assignments.filter(a => a.is_active).length}</p>
          <p className="text-[8px] text-slate-400 font-medium">Linked shops to partners</p>
        </div>

        {/* 8. Eligible Commission Amount */}
        <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
          <span className="text-[9px] font-black text-teal-600 uppercase tracking-wider block font-bold text-teal-600">Eligible Commission</span>
          <p className="text-sm font-mono font-black text-teal-600">₹{Math.round(adminSummary?.eligible_commission_amount ?? 0).toLocaleString()}</p>
          <p className="text-[8px] text-slate-400 font-medium">Pending weekly processing</p>
        </div>

        {/* 9. This Week Eligible Earning */}
        <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">This Week Earning</span>
          <p className="text-sm font-mono font-black text-slate-800">₹{Math.round(adminSummary?.this_week_eligible_earning ?? 0).toLocaleString()}</p>
          <p className="text-[8px] text-slate-400 font-medium">Current week collection cycle</p>
        </div>

        {/* 10. Pending Weekly Payouts */}
        <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
          <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider block">Pending Weekly Payouts</span>
          <p className="text-sm font-mono font-black text-amber-600">₹{Math.round(adminSummary?.pending_weekly_payout_amount ?? 0).toLocaleString()}</p>
          <p className="text-[8px] text-slate-400 font-medium font-sans">Awaiting admin batch trigger</p>
        </div>

        {/* 11. Paid Weekly Payouts */}
        <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wider block font-bold text-emerald-600">Paid Weekly Payouts</span>
          <p className="text-sm font-mono font-black text-emerald-600">₹{Math.round(adminSummary?.paid_weekly_payout_amount ?? 0).toLocaleString()}</p>
          <p className="text-[8px] text-slate-400 font-medium">Paid out weekly runs</p>
        </div>

        {/* 12. Paid Commission Amount */}
        <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Total Ledger Earnings Paid</span>
          <p className="text-sm font-mono font-black text-slate-700">₹{Math.round(adminSummary?.paid_commission_amount ?? 0).toLocaleString()}</p>
          <p className="text-[8px] text-slate-400 font-medium">Total finalized commission rows</p>
        </div>
      </div>

      {/* 9B 10 Sub-Tabs navigation */}
      <div className="flex border-b border-slate-100 gap-4 overflow-x-auto scrollbar-none pb-1">
        {[
          { id: "applications", label: `Applications (${applications.filter(a => a.status === 'pending').length})` },
          { id: "partners", label: `Partners (${partners.length})` },
          { id: "leads", label: `Leads (${leads.length})` },
          { id: "visits", label: `Visit Logs (${visitLogs.length})` },
          { id: "tasks", label: "Onboarding Tasks" },
          { id: "assignments", label: "Shop Assignments" },
          { id: "ledger", label: "Commission Ledger" },
          { id: "payouts", label: "Weekly Payouts" },
          { id: "training", label: "Training Academy" },
          { id: "milestones", label: "Milestones" }
        ].map(subTab => (
          <button
            key={subTab.id}
            onClick={() => setActiveSubTab(subTab.id as any)}
            className={`pb-2 text-xs font-black uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
              activeSubTab === subTab.id 
                ? "text-blue-600 border-b-2 border-blue-600 font-black" 
                : "text-slate-400 hover:text-slate-600 font-semibold"
            }`}
          >
            {subTab.label}
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: APPLICATIONS */}
      {activeSubTab === "applications" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map(f => (
              <button
                key={f}
                onClick={() => setAppFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-2xs font-bold uppercase tracking-wider transition border cursor-pointer ${
                  appFilter === f 
                    ? "bg-slate-900 border-slate-900 text-white" 
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {filteredApps.length === 0 ? (
            <div className="bg-white p-8 text-center border border-slate-100 rounded-3xl text-xs text-slate-400 font-medium">
              No applications match the selected filter.
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Applicant</th>
                      <th className="py-4 px-6">Location</th>
                      <th className="py-4 px-6">Current Work</th>
                      <th className="py-4 px-6">Submitted Date</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.map(app => (
                      <tr key={app.id} className="border-b border-slate-100 text-xs hover:bg-slate-50/50 transition">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{app.full_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono font-medium">{app.mobile} | {app.email}</div>
                        </td>
                        <td className="py-4 px-6 text-slate-500 font-medium">
                          {app.city}, {app.district}, {app.state}
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-semibold">
                          {app.current_work_type}
                        </td>
                        <td className="py-4 px-6 text-slate-400 font-medium">
                          {new Date(app.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            app.status === 'approved' 
                              ? "bg-emerald-50 border border-emerald-100 text-emerald-700" 
                              : app.status === 'rejected'
                                ? "bg-rose-50 border border-rose-100 text-rose-700"
                                : "bg-amber-50 border border-amber-100 text-amber-700"
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="p-1.5 bg-slate-50 border border-slate-100 text-slate-600 hover:text-blue-600 rounded-lg transition hover:bg-blue-50/50 cursor-pointer"
                            title="View questionnaire"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: PARTNERS DIRECTORY */}
      {activeSubTab === "partners" && (
        <div className="space-y-4 animate-fade-in">
          {partners.length === 0 ? (
            <div className="bg-white p-8 text-center border border-slate-100 rounded-3xl text-xs text-slate-400 font-medium">
              No registered growth partners yet. Approve applications to add profiles here.
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Partner</th>
                      <th className="py-4 px-6">Location</th>
                      <th className="py-4 px-6">Shops (Total / Active)</th>
                      <th className="py-4 px-6">Earning Metrics</th>
                      <th className="py-4 px-6">Joined Date</th>
                      <th className="py-4 px-6 text-right">Shop Assignment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map(p => (
                      <tr key={p.id} className="border-b border-slate-100 text-xs hover:bg-slate-50/50 transition">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{p.full_name}</div>
                          <span className="font-mono text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{p.partner_code}</span>
                          <span className="text-[10px] text-slate-400 block font-medium mt-1">{p.mobile} | {p.email}</span>
                        </td>
                        <td className="py-4 px-6 text-slate-500 font-medium">
                          {p.city}, {p.district}, {p.state}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-black text-slate-800 text-sm">{p.total_shops_onboarded || 0}</div>
                          <span className="text-[10px] text-emerald-600 font-bold">{p.active_shops || 0} active slots</span>
                        </td>
                        <td className="py-4 px-6 font-mono text-[11px] space-y-1">
                          <div className="text-slate-950 font-bold">Lifetime: ₹{(p.lifetime_partner_earning || 0).toLocaleString()}</div>
                          <div className="text-amber-600">Pending: ₹{(p.pending_partner_earning || 0).toLocaleString()}</div>
                          <div className="text-slate-400">Paid: ₹{(p.paid_partner_earning || 0).toLocaleString()}</div>
                        </td>
                        <td className="py-4 px-6 text-slate-400 font-medium">
                          {new Date(p.joined_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => {
                              setAssignPartner(p);
                              setSelectedShopId("");
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white font-black text-2xs uppercase tracking-wider rounded-lg hover:bg-blue-700 transition cursor-pointer flex items-center gap-1 inline-flex"
                          >
                            <Plus className="w-3 h-3" /> Assign Shop
                          </button>
                          {p.pending_partner_earning > 0 && (
                            <button
                              onClick={() => {
                                setPayoutPartner(p);
                                setPayoutAmount(p.pending_partner_earning);
                                setPayoutRef("");
                              }}
                              className="px-3 py-1.5 bg-slate-950 text-white font-black text-2xs uppercase tracking-wider rounded-lg hover:bg-slate-900 transition cursor-pointer flex items-center gap-1 inline-flex"
                            >
                              <CreditCard className="w-3 h-3" /> Payout
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: LEADS */}
      {activeSubTab === "leads" && (
        <div className="space-y-4 animate-fade-in">
          {/* Filters Bar */}
          <div className="bg-white p-4 border border-slate-100 rounded-3xl flex flex-col sm:flex-row gap-3 items-center text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-bold text-slate-400 whitespace-nowrap">Filter Partner:</span>
              <select 
                value={leadPartnerFilter} onChange={(e) => setLeadPartnerFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 p-2 rounded-lg font-medium outline-none text-xs"
              >
                <option value="all">All Partners</option>
                {partners.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-bold text-slate-400 whitespace-nowrap">Status:</span>
              <select 
                value={leadStatusFilter} onChange={(e) => setLeadStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 p-2 rounded-lg font-medium outline-none text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="interested">Interested</option>
                <option value="demo_scheduled">Demo Scheduled</option>
                <option value="onboarding">Onboarding</option>
                <option value="converted">Converted</option>
                <option value="not_interested">Not Interested</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input 
                type="text" placeholder="Search District..." value={leadDistrictSearch} onChange={(e) => setLeadDistrictSearch(e.target.value)}
                className="bg-slate-50 border border-slate-200 p-2 rounded-lg outline-none text-xs w-full sm:w-48"
              />
            </div>
          </div>

          {filteredLeads.length === 0 ? (
            <div className="bg-white p-8 text-center border border-slate-100 rounded-3xl text-xs text-slate-400 font-medium">
              No leads match the filters.
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Lead Shop</th>
                      <th className="py-4 px-6">Growth Partner</th>
                      <th className="py-4 px-6">Location</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 font-mono text-[9px]">Est. Monthly Bookings</th>
                      <th className="py-4 px-6">Expected Live</th>
                      <th className="py-4 px-6 text-right">Shop Link Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(lead => (
                      <tr key={lead.id} className="border-b border-slate-100 text-xs hover:bg-slate-50/50 transition">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{lead.shop_name}</div>
                          <span className="text-[10px] text-slate-400 font-medium block">Owner: {lead.owner_name} | {lead.mobile}</span>
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-bold">
                          {getPartnerName(lead.partner_id)}
                        </td>
                        <td className="py-4 px-6 text-slate-500 font-medium">
                          {lead.area && `${lead.area}, `}{lead.city} ({lead.district})
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                            lead.status === 'converted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            lead.status === 'rejected' || lead.status === 'not_interested' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                            'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-slate-600">
                          {lead.estimated_monthly_bookings || "0"}
                        </td>
                        <td className="py-4 px-6 text-slate-400 font-medium">
                          {lead.expected_go_live_date ? new Date(lead.expected_go_live_date).toLocaleDateString() : "--"}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {lead.converted_shop_id ? (
                            <div className="text-2xs text-emerald-600 font-black flex items-center justify-end gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Linked Shop</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setLinkingLead(lead);
                                setLinkingShopId("");
                              }}
                              className="px-2 py-1 bg-amber-500 text-white font-bold text-[10px] rounded-lg shadow-sm hover:bg-amber-600 cursor-pointer"
                            >
                              Link Actual Shop
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: VISIT LOGS */}
      {activeSubTab === "visits" && (
        <div className="space-y-4 animate-fade-in">
          {visitLogs.length === 0 ? (
            <div className="bg-white p-8 text-center border border-slate-100 rounded-3xl text-xs text-slate-400 font-medium">
              No visits logged by partners yet.
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Growth Partner</th>
                      <th className="py-4 px-6">Lead Reference</th>
                      <th className="py-4 px-6">Visit Type</th>
                      <th className="py-4 px-6 text-slate-800">Outcome Log</th>
                      <th className="py-4 px-6">Next Action Plan</th>
                      <th className="py-4 px-6">GPS Location Coordinates</th>
                      <th className="py-4 px-6 text-right">Date/Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitLogs.map(log => {
                      const leadObj = leads.find(l => l.id === log.lead_id);
                      return (
                        <tr key={log.id} className="border-b border-slate-100 text-xs hover:bg-slate-50/50 transition">
                          <td className="py-4 px-6 font-black text-slate-900">
                            {getPartnerName(log.partner_id)}
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-800">{leadObj?.shop_name || "Unknown Lead"}</div>
                            <span className="text-[9px] text-slate-400 block font-medium">Owner: {leadObj?.owner_name}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 font-bold text-[9px] uppercase rounded">
                              {log.visit_type}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-600 font-medium max-w-xs leading-relaxed">
                            {log.outcome}
                          </td>
                          <td className="py-4 px-6 text-slate-500 font-semibold italic">
                            {log.next_action}
                          </td>
                          <td className="py-4 px-6 text-slate-400 font-mono text-[10px] font-medium">
                            {log.latitude && log.longitude ? (
                              <span className="flex items-center gap-1 text-slate-600">
                                <MapPin className="w-3.5 h-3.5 text-red-500" />
                                {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
                              </span>
                            ) : (
                              "Not Recorded"
                            )}
                          </td>
                          <td className="py-4 px-6 text-right text-slate-400 font-medium">
                            {new Date(log.visit_at).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 5: ONBOARDING TASKS */}
      {activeSubTab === "tasks" && (
        <div className="space-y-4 animate-fade-in">
          {onboardingTasks.length === 0 ? (
            <div className="bg-white p-8 text-center border border-slate-100 rounded-3xl text-xs text-slate-400 font-medium">
              No onboarding tasks generated yet.
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Lead / Onboarding Shop</th>
                      <th className="py-4 px-6">Growth Partner</th>
                      <th className="py-4 px-6">Task Key / Title</th>
                      <th className="py-4 px-6">Instruction Description</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {onboardingTasks.map(task => {
                      const leadObj = leads.find(l => l.id === task.lead_id);
                      return (
                        <tr key={task.id} className="border-b border-slate-100 text-xs hover:bg-slate-50/50 transition">
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900">{leadObj?.shop_name || "Unknown Lead"}</div>
                            <span className="text-[10px] text-slate-400 block font-medium">ID: {task.lead_id?.substring(0,8)}...</span>
                          </td>
                          <td className="py-4 px-6 text-slate-600 font-bold">
                            {getPartnerName(task.partner_id)}
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-800">{task.title}</div>
                            <span className="font-mono text-[8px] text-slate-400 block uppercase font-medium mt-0.5">{task.task_key}</span>
                          </td>
                          <td className="py-4 px-6 text-slate-500 font-medium max-w-sm leading-relaxed">
                            {task.description}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              task.status === "completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                              task.status === "in_progress" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                              task.status === "blocked" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                              "bg-slate-100 text-slate-400"
                            }`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right text-slate-400 font-medium">
                            {new Date(task.updated_at || task.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 6: SHOP ASSIGNMENTS */}
      {activeSubTab === "assignments" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Active Assignments Mapping</h3>
            {partners.length > 0 && (
              <button
                onClick={() => {
                  setAssignPartner(partners[0]);
                  setSelectedShopId("");
                }}
                className="px-4 py-2.5 bg-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-blue-700 transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Map New Shop
              </button>
            )}
          </div>

          {assignments.length === 0 ? (
            <div className="bg-white p-8 text-center border border-slate-100 rounded-3xl text-xs text-slate-400 font-medium">
              No active shop assignments mappings in system.
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Growth Partner</th>
                      <th className="py-4 px-6">Mapped Salon Shop</th>
                      <th className="py-4 px-6 text-slate-800">Start Date</th>
                      <th className="py-4 px-6">Commission Month Duration</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map(asg => {
                      const shopObj = allShops.find(s => s.id === asg.shop_id);
                      return (
                        <tr key={asg.id} className="border-b border-slate-100 text-xs hover:bg-slate-50/50 transition">
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900">{getPartnerName(asg.partner_id)}</div>
                            <span className="text-[10px] text-slate-400 font-medium">UID: {asg.partner_id?.substring(0,8)}...</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-800">{shopObj?.name || "Unknown Shop"}</div>
                            <span className="text-[9px] text-slate-400 block font-medium">{shopObj?.area}, {shopObj?.city}</span>
                          </td>
                          <td className="py-4 px-6 font-mono text-slate-600 font-medium">
                            {new Date(asg.commission_start_date).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 font-medium text-slate-500">
                            {asg.commission_end_date ? `Till ${new Date(asg.commission_end_date).toLocaleDateString()}` : "12-month default auto rollover"}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              asg.is_active 
                                ? "bg-emerald-50 border border-emerald-100 text-emerald-700" 
                                : "bg-slate-50 border border-slate-100 text-slate-400"
                            }`}>
                              {asg.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={async () => {
                                if(confirm("Are you sure you want to toggle assignment status?")) {
                                  const { error } = await supabase
                                    .from("partner_shop_assignments")
                                    .update({ is_active: !asg.is_active, updated_at: new Date().toISOString() })
                                    .eq("id", asg.id);
                                  if (!error) {
                                    showNotification("success", "Assignment status updated successfully!");
                                    await fetchData();
                                  } else {
                                    showNotification("error", "Error toggling assignment status");
                                  }
                                }
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[9px] uppercase rounded-lg transition"
                            >
                              Toggle Status
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 7: COMMISSION LEDGER */}
      {activeSubTab === "ledger" && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Commissions Ledger Rows</h3>
            <p className="text-[10px] text-slate-400 font-medium">Direct billing history linking transactions securely.</p>
          </div>

          {ledgerRows.length === 0 ? (
            <div className="bg-white p-8 text-center border border-slate-100 rounded-3xl text-xs text-slate-400 font-medium">
              No commission transactions recorded yet in the ledger.
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Booking Reference</th>
                      <th className="py-4 px-6">Partner Name</th>
                      <th className="py-4 px-6">Base Comm.</th>
                      <th className="py-4 px-6">Partner Rate</th>
                      <th className="py-4 px-6">Partner Earned</th>
                      <th className="py-4 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerRows.map(row => (
                      <tr key={row.id} className="border-b border-slate-100 text-2xs hover:bg-slate-50/50 transition">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">Booking: {row.booking_id?.substring(0, 8)}...</div>
                          <span className="text-[8px] text-slate-400 font-medium block">Row ID: {row.id?.substring(0, 8)}...</span>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-600">
                          {getPartnerName(row.partner_id)}
                        </td>
                        <td className="py-4 px-6 font-mono text-slate-500 font-medium">
                          ₹{(row.nexora_commission_amount || 0).toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-blue-600 font-bold font-mono">
                          {(row.partner_commission_rate * 100).toFixed(0)}%
                          <span className="text-[8px] text-slate-400 block font-medium">Month {row.commission_month_number}</span>
                        </td>
                        <td className="py-4 px-6 text-emerald-600 font-black font-mono text-xs">
                          ₹{(row.partner_commission_amount || 0).toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            row.status === 'paid' 
                              ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' 
                              : 'bg-amber-50 border border-amber-100 text-amber-700'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 8: PAYOUTS */}
      {activeSubTab === "payouts" && (
        <div className="space-y-6 animate-fade-in text-xs">
          {/* Top Control Panel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Automated Payout Center */}
            <div className="bg-white p-6 border border-slate-100 rounded-3xl space-y-4 shadow-3xs">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Automated Weekly Payout Center</h3>
                <p className="text-[10px] text-slate-400 font-medium">Batch process eligible commission ledger rows for specific weeks automatically.</p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Cycle Week Start</label>
                    <input 
                      type="date"
                      value={weekStart}
                      onChange={(e) => setWeekStart(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 focus:bg-white focus:border-blue-600 outline-none text-xs transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Cycle Week End</label>
                    <input 
                      type="date"
                      value={weekEnd}
                      onChange={(e) => setWeekEnd(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 focus:bg-white focus:border-blue-600 outline-none text-xs transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Target Growth Partner</label>
                  <select
                    value={targetPartnerId}
                    onChange={(e) => setTargetPartnerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 focus:bg-white focus:border-blue-600 outline-none text-xs transition"
                  >
                    <option value="all">-- All Active Partners --</option>
                    {partners.map(p => (
                      <option key={p.id} value={p.id}>{p.full_name} ({p.partner_code})</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleGeneratePayouts}
                  disabled={generatingPayouts}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {generatingPayouts ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                  Generate Automated Payouts Batch
                </button>
              </div>
            </div>

            {/* 2. Manual Record & Quick Logs */}
            <div className="bg-white p-6 border border-slate-100 rounded-3xl space-y-4 shadow-3xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Manual Ledger Release (Fallback)</h3>
                <p className="text-[10px] text-slate-400 font-medium">Record a manual offline bank cash transfer that bypasses automated scheduler cycles.</p>
                <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-2xl text-[10px] text-slate-600 leading-normal font-medium mt-4 space-y-1">
                  <p className="font-bold text-blue-800">Rule of Thumb:</p>
                  <p>1. Preferred approach is using Automated Payout Center.</p>
                  <p>2. Failure states roll back partner wallet ledger balances automatically.</p>
                  <p>3. Do not fake physical transaction status updates.</p>
                </div>
              </div>

              {partners.length > 0 && (
                <button
                  onClick={() => {
                    setPayoutPartner(partners[0]);
                    setPayoutRef("");
                    setPayoutAmount(0);
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Record Custom Manual Payout
                </button>
              )}
            </div>
          </div>

          {/* Processed Payouts Listing */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Processed Payout Registry</h3>
              <p className="text-[10px] text-slate-400 font-medium">Registry of all system draft, processing, paid, and failed payout batches.</p>
            </div>

            {payouts.length === 0 ? (
              <div className="bg-white p-12 text-center border border-slate-100 rounded-3xl text-slate-400 font-medium">
                No weekly payout records registered in system. Use automated center to generate.
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-6">Growth Partner</th>
                        <th className="py-4 px-6">Week Cycle</th>
                        <th className="py-4 px-6">Total Commission</th>
                        <th className="py-4 px-6">Net Payout</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6">Payout Reference / Failure Reason</th>
                        <th className="py-4 px-6">Processed Date</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map(pay => {
                        const partnerObj = partners.find(p => p.id === pay.partner_id);
                        return (
                          <tr key={pay.id} className="border-b border-slate-100 text-2xs hover:bg-slate-50/50 transition">
                            <td className="py-4 px-6">
                              <div className="font-bold text-slate-900">{partnerObj?.full_name || "Unknown Partner"}</div>
                              <span className="font-mono text-[9px] text-slate-400">{partnerObj?.partner_code || "No Code"}</span>
                            </td>
                            <td className="py-4 px-6 font-semibold text-slate-700 whitespace-nowrap">
                              {pay.week_start} to {pay.week_end}
                            </td>
                            <td className="py-4 px-6 font-mono font-medium text-slate-500">
                              ₹{(pay.total_commission_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-4 px-6 font-mono font-black text-emerald-600 text-xs">
                              ₹{(pay.payout_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                                pay.status === 'paid' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' :
                                pay.status === 'processing' ? 'bg-blue-50 border border-blue-100 text-blue-700' :
                                pay.status === 'failed' ? 'bg-rose-50 border border-rose-100 text-rose-700' :
                                'bg-amber-50 border border-amber-100 text-amber-700'
                              }`}>
                                {pay.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 max-w-xs truncate">
                              {pay.status === 'failed' ? (
                                <span className="text-rose-600 font-semibold text-[9px] font-mono block leading-normal">{pay.failure_reason || "Transaction failed."}</span>
                              ) : (
                                <span className="font-mono text-slate-600 font-medium">{pay.payout_reference || "--"}</span>
                              )}
                            </td>
                            <td className="py-4 px-6 font-mono text-slate-400 whitespace-nowrap">
                              {pay.processed_at ? new Date(pay.processed_at).toLocaleDateString() : "--"}
                            </td>
                            <td className="py-4 px-6 text-right whitespace-nowrap space-x-1">
                              {pay.status === 'draft' && (
                                <button
                                  onClick={() => handleMarkPayoutProcessing(pay.id)}
                                  disabled={actionLoading}
                                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] uppercase tracking-wider rounded transition cursor-pointer"
                                >
                                  Process
                                </button>
                              )}
                              {pay.status === 'processing' && (
                                <>
                                  <button
                                    onClick={() => {
                                      setPaidPayoutId(pay.id);
                                      setPaidReference("");
                                    }}
                                    disabled={actionLoading}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase tracking-wider rounded transition cursor-pointer"
                                  >
                                    Mark Paid
                                  </button>
                                  <button
                                    onClick={() => {
                                      setFailedPayoutId(pay.id);
                                      setFailureReasonStr("");
                                    }}
                                    disabled={actionLoading}
                                    className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-black text-[9px] uppercase tracking-wider rounded transition cursor-pointer"
                                  >
                                    Mark Failed
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleViewAdminPayoutBreakdown(pay)}
                                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white font-black text-[9px] uppercase tracking-wider rounded transition cursor-pointer"
                              >
                                Items
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 9: TRAINING */}
      {activeSubTab === "training" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* required modules list */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Required Academy Syllabus</h3>
            <div className="space-y-3">
              {trainingModules.map(module => (
                <div key={module.id} className="bg-white p-4 rounded-2xl border border-slate-100 space-y-1.5 text-xs shadow-3xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-black text-[9px] text-blue-600">Step {module.display_order}</span>
                    {module.is_required && (
                      <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 font-black text-[8px] uppercase tracking-wider rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-800">{module.title}</h4>
                  <p className="text-[10px] text-slate-400 leading-normal font-medium">{module.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Partners completion directories */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Partners Completion Directory</h3>
            {partners.length === 0 ? (
              <p className="text-2xs text-slate-400 py-6 text-center">No active partners directory.</p>
            ) : (
              <div className="space-y-3">
                {partners.map(part => {
                  const requiredCount = trainingModules.filter(m => m.is_required).length || 5;
                  const partProg = trainingProgress.filter(p => p.partner_id === part.id && p.status === "completed");
                  const percent = Math.round((partProg.length / requiredCount) * 100) || 0;
                  const isExpanded = expandedPartnerTrainingId === part.id;

                  return (
                    <div key={part.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-3xs space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <h4 className="font-black text-slate-800">{part.full_name}</h4>
                          <span className="text-[9px] font-mono text-slate-400 block mt-0.5">Partner Code: {part.partner_code}</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[10px]">
                            {percent}% Completed ({partProg.length}/{requiredCount})
                          </span>
                          <button
                            onClick={() => setExpandedPartnerTrainingId(isExpanded ? null : part.id)}
                            className="px-2.5 py-1 text-[9px] font-black uppercase rounded bg-slate-50 border border-slate-100 hover:bg-slate-100 cursor-pointer"
                          >
                            {isExpanded ? "Collapse" : "Verify Modules"}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-slate-100 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs">
                          {trainingModules.map(mod => {
                            const progObj = trainingProgress.find(p => p.partner_id === part.id && p.module_id === mod.id);
                            return (
                              <div key={mod.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                                <span className="font-semibold text-slate-700">{mod.title}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shrink-0 ${
                                  progObj?.status === "completed" ? "bg-emerald-50 text-emerald-700" :
                                  progObj?.status === "in_progress" ? "bg-blue-50 text-blue-700" :
                                  "bg-slate-100 text-slate-400"
                                }`}>
                                  {progObj?.status || "Not Started"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 10: MILESTONES */}
      {activeSubTab === "milestones" && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Milestone Rewards Verification</h3>
            <p className="text-[10px] text-slate-400 font-medium">Release verified milestones rewards, cash prizes or smartphones for partner milestones.</p>
          </div>

          {milestones.length === 0 ? (
            <div className="bg-white p-8 text-center border border-slate-100 rounded-3xl text-xs text-slate-400 font-medium">
              No milestone progress logged yet.
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Growth Partner</th>
                      <th className="py-4 px-6">Reward Title</th>
                      <th className="py-4 px-6">Required Shops Target</th>
                      <th className="py-4 px-6">Achieved Date</th>
                      <th className="py-4 px-6">Milestone Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {milestones.map(m => (
                      <tr key={m.id} className="border-b border-slate-100 text-xs hover:bg-slate-50/50 transition">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{getPartnerName(m.partner_id)}</div>
                          <span className="text-[9px] text-slate-400 font-medium">UID: {m.partner_id?.substring(0,8)}...</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">{m.reward_title}</div>
                          <span className="text-[9px] text-slate-400 block font-medium leading-normal mt-0.5">{m.reward_description}</span>
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-black font-mono">
                          {m.milestone_shops} Shops Onboarded
                        </td>
                        <td className="py-4 px-6 text-slate-400 font-medium">
                          {m.achieved_at ? new Date(m.achieved_at).toLocaleDateString() : "--"}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            m.status === "rewarded" ? "bg-emerald-50 border border-emerald-100 text-emerald-700" :
                            m.status === "achieved" ? "bg-blue-50 border border-blue-100 text-blue-700 animate-pulse" :
                            "bg-slate-50 border border-slate-100 text-slate-400"
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {m.status === "achieved" ? (
                            <button
                              onClick={() => handleRewardMilestone(m.id)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] uppercase tracking-wider rounded-lg shadow-sm cursor-pointer transition disabled:bg-blue-300"
                            >
                              Release Reward
                            </button>
                          ) : m.status === "rewarded" ? (
                            <span className="text-[10px] text-emerald-600 font-black">Rewarded Sent</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold font-sans">Locked</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: VIEW APPLICATION QUESTIONNAIRE */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto scrollbar-none flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">Partner Application Questionnaire</h3>
                <p className="text-[10px] text-slate-400 font-medium">Evaluate local networks and smartphone assets carefully.</p>
              </div>
              <button 
                onClick={() => {
                  setSelectedApp(null);
                  setShowRejectForm(false);
                  setRejectionReason("");
                }} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg bg-slate-50 border border-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Profile Details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Full Name</span>
                  <span className="font-bold text-slate-800">{selectedApp.full_name}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">WhatsApp Contact</span>
                  <span className="font-bold text-slate-800">{selectedApp.mobile}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Email Address</span>
                  <span className="font-bold text-slate-800">{selectedApp.email}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Location Address</span>
                  <span className="font-bold text-slate-800">{selectedApp.city}, {selectedApp.district}, {selectedApp.state}</span>
                </div>
              </div>

              {/* Work Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Current Work Profile</span>
                    <span className="font-bold text-slate-800">{selectedApp.current_work_type}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Estimated Network Scale</span>
                    <span className="font-bold text-slate-800">{selectedApp.expected_shop_network} shops target</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Beauty & Cosmetics Industry Connections</span>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 font-medium leading-relaxed">
                    {selectedApp.beauty_industry_experience}
                  </p>
                </div>
              </div>

              {/* Tech & Logistics Flags */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                <div className="text-center space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Smartphone Assets</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider inline-block ${
                    selectedApp.has_smartphone ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                  }`}>
                    {selectedApp.has_smartphone ? "Verified" : "Missing"}
                  </span>
                </div>
                <div className="text-center space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Travel Capabilities</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider inline-block ${
                    selectedApp.has_travel_access ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                  }`}>
                    {selectedApp.has_travel_access ? "Verified" : "No vehicle"}
                  </span>
                </div>
                <div className="text-center space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Age Requirement</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider inline-block">
                    {selectedApp.age_confirmed ? "18+ Confirmed" : "Pending"}
                  </span>
                </div>
              </div>

              {/* Status information if already processed */}
              {selectedApp.status !== "pending" && (
                <div className="p-4 rounded-2xl border bg-slate-50 border-slate-100/80 space-y-1 font-medium text-slate-500">
                  <p className="font-bold text-slate-800">Application status: <span className="uppercase text-blue-600">{selectedApp.status}</span></p>
                  {selectedApp.rejection_reason && <p className="text-rose-600 font-bold">Rejection Reason: {selectedApp.rejection_reason}</p>}
                  {selectedApp.admin_note && <p className="text-[10px] text-slate-400 font-mono">Note: {selectedApp.admin_note}</p>}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              {selectedApp.status === "pending" ? (
                showRejectForm ? (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-wider text-rose-600">Rejection Reason Description</label>
                    <textarea
                      rows={2}
                      required
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="E.g., Beauty experience does not meet standards."
                      className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-100 focus:border-rose-600 outline-none text-xs transition"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setShowRejectForm(false)}
                        className="px-4 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 text-xs hover:bg-slate-50 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRejectApp(selectedApp.id)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition cursor-pointer disabled:bg-rose-300"
                      >
                        {actionLoading ? "Processing..." : "Confirm Reject"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="px-6 py-3 bg-white text-rose-600 font-black text-2xs uppercase tracking-wider rounded-xl border border-slate-200 hover:bg-rose-50 transition cursor-pointer"
                    >
                      Reject Application
                    </button>
                    <button
                      onClick={() => handleApproveApp(selectedApp.id)}
                      disabled={actionLoading}
                      className="px-6 py-3 bg-blue-600 text-white font-black text-2xs uppercase tracking-wider rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-500/10 cursor-pointer disabled:bg-blue-300"
                    >
                      {actionLoading ? "Processing..." : "Approve & Create Profile"}
                    </button>
                  </div>
                )
              ) : (
                <div className="text-right">
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="px-6 py-3 bg-slate-900 text-white font-black text-2xs uppercase tracking-wider rounded-xl hover:bg-slate-800 transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN SHOP TO PARTNER */}
      {assignPartner && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">Assign Salon Shop</h3>
                <p className="text-[10px] text-slate-400 font-medium font-bold">Select a salon to map under {assignPartner.full_name}'s code.</p>
              </div>
              <button 
                onClick={() => setAssignPartner(null)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg bg-slate-50 border border-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignShop}>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Available Registered Shops</label>
                  <select
                    required
                    value={selectedShopId}
                    onChange={(e) => setSelectedShopId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition font-semibold"
                  >
                    <option value="">-- Choose Salon Shop --</option>
                    {allShops.map(shop => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name} ({shop.area || ""}, {shop.city || ""})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-2xs font-medium text-slate-600 leading-relaxed">
                  <p>
                    <span className="font-bold block text-blue-700">Commission Period</span>
                    Onboarding generates commission records for 12 months. The system will auto-calculate month-wise rates (10% Month 1-6, 5% Month 7-12) based on transaction dates.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setAssignPartner(null)}
                  className="px-4 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !selectedShopId}
                  className="px-6 py-2 bg-blue-600 text-white font-black text-2xs uppercase tracking-wider rounded-xl hover:bg-blue-700 transition cursor-pointer disabled:bg-blue-300"
                >
                  {actionLoading ? "Assigning..." : "Assign Shop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PROCESS MANUAL PAYOUT */}
      {payoutPartner && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">Record Manual Payout</h3>
                <p className="text-[10px] text-slate-400 font-medium font-bold">Deduct wallet balances and save payment references.</p>
              </div>
              <button 
                onClick={() => setPayoutPartner(null)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg bg-slate-50 border border-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProcessManualPayout}>
              <div className="p-6 space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Partner Name:</span>
                    <span className="font-bold text-slate-900">{payoutPartner.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Partner Code:</span>
                    <span className="font-mono text-slate-700 font-bold">{payoutPartner.partner_code}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/50 pt-2 mt-1">
                    <span className="text-slate-500 font-bold">Pending balance to payout:</span>
                    <span className="font-black text-emerald-600 font-mono text-sm">₹{payoutPartner.pending_partner_earning.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Manual Transaction / Payout Reference ID</label>
                  <input
                    type="text"
                    required
                    value={payoutRef}
                    onChange={(e) => setPayoutRef(e.target.value)}
                    placeholder="E.g., IMPS / UPI Txn Ref ID"
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                  />
                  <p className="text-[9px] text-slate-400 font-medium leading-tight">
                    UPI, Bank transfer ya cash receipt ka reference number jisse aapne ye transaction physically complete kiya hai.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setPayoutPartner(null)}
                  className="px-4 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !payoutRef}
                  className="px-6 py-2 bg-slate-950 text-white font-black text-2xs uppercase tracking-wider rounded-xl hover:bg-slate-900 transition cursor-pointer disabled:bg-blue-300"
                >
                  {actionLoading ? "Processing..." : "Release & Mark Paid"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: LINK CONVERTED LEAD TO SHOP */}
      {linkingLead && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden flex flex-col font-sans">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">Link Lead to Active Shop</h3>
                <p className="text-[10px] text-slate-400 font-medium">Verify actual registered shop profile for {linkingLead.shop_name}.</p>
              </div>
              <button 
                onClick={() => setLinkingLead(null)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg bg-slate-50 border border-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLinkLeadToShop}>
              <div className="p-6 space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Onboarding Lead:</span>
                    <span className="font-bold text-slate-800">{linkingLead.shop_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Lead Owner Name:</span>
                    <span className="font-bold text-slate-800">{linkingLead.owner_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold font-semibold">Growth Partner Assigned:</span>
                    <span className="font-bold text-blue-600">{getPartnerName(linkingLead.partner_id)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Select Registered Salon Shop</label>
                  <select
                    required
                    value={linkingShopId}
                    onChange={(e) => setLinkingShopId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition font-semibold"
                  >
                    <option value="">-- Choose Registered Shop --</option>
                    {allShops.map(shop => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name} ({shop.area || ""}, {shop.city || ""})
                      </option>
                    ))}
                  </select>
                  <p className="text-[9px] text-slate-400 font-medium leading-tight">
                    Is lead pipeline ko map karke real registered system shop se bind karein taaki transactions automate ho sakein.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setLinkingLead(null)}
                  className="px-4 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !linkingShopId}
                  className="px-6 py-2 bg-blue-600 text-white font-black text-2xs uppercase tracking-wider rounded-xl hover:bg-blue-700 transition cursor-pointer disabled:bg-blue-300"
                >
                  {actionLoading ? "Linking..." : "Link Shop & Create Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9C MODAL: MARK PAYOUT PAID */}
      {paidPayoutId && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden flex flex-col font-sans">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Finalize Payout (Mark Paid)</h3>
                <p className="text-[10px] text-slate-400 font-medium">Record the transaction ID/reference after transferring bank funds.</p>
              </div>
              <button 
                onClick={() => setPaidPayoutId(null)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg bg-slate-50 border border-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMarkPayoutPaidSubmit}>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Transaction Reference / UTR Number</label>
                  <input
                    required
                    type="text"
                    value={paidReference}
                    onChange={(e) => setPaidReference(e.target.value)}
                    placeholder="e.g. UTR1234567890, IMPS/987654"
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:border-blue-600 outline-none text-xs transition font-semibold"
                  />
                  <p className="text-[9px] text-slate-400 font-medium leading-tight">
                    Confirm bank transfer receipt reference. This action will mark status as PAID and lock the ledger items securely.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setPaidPayoutId(null)}
                  className="px-4 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !paidReference.trim()}
                  className="px-6 py-2 bg-emerald-600 text-white font-black text-2xs uppercase tracking-wider rounded-xl hover:bg-emerald-700 transition cursor-pointer disabled:bg-emerald-300"
                >
                  {actionLoading ? "Processing..." : "Confirm Bank Transfer Paid"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9C MODAL: MARK PAYOUT FAILED */}
      {failedPayoutId && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden flex flex-col font-sans">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight font-bold">Payout Rejected/Failed</h3>
                <p className="text-[10px] text-slate-400 font-medium">Record the rejection reason. Funds will roll back automatically.</p>
              </div>
              <button 
                onClick={() => setFailedPayoutId(null)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg bg-slate-50 border border-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMarkPayoutFailedSubmit}>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Failure or Rejection Reason</label>
                  <textarea
                    required
                    rows={3}
                    value={failureReasonStr}
                    onChange={(e) => setFailureReasonStr(e.target.value)}
                    placeholder="e.g. Invalid partner bank account details / IFSC mismatch."
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:border-rose-600 outline-none text-xs transition font-semibold resize-none"
                  />
                  <p className="text-[9px] text-slate-400 font-medium leading-tight">
                    This action returns all compiled ledger rows back to the eligible pool and releases the wallet ledger lock.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setFailedPayoutId(null)}
                  className="px-4 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !failureReasonStr.trim()}
                  className="px-6 py-2 bg-rose-600 text-white font-black text-2xs uppercase tracking-wider rounded-xl hover:bg-rose-700 transition cursor-pointer disabled:bg-rose-300"
                >
                  {actionLoading ? "Processing..." : "Confirm Rollback & Fail"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9C MODAL: VIEW PAYOUT BREAKDOWN ITEMS */}
      {adminSelectedPayout && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto scrollbar-none flex flex-col font-sans">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Payout Compilation Items Breakdown</h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  Cycle: {adminSelectedPayout.week_start} to {adminSelectedPayout.week_end} • Net: ₹{(adminSelectedPayout.payout_amount || 0).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setAdminSelectedPayout(null)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg bg-slate-50 border border-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              {loadingAdminPayoutItems ? (
                <div className="py-12 flex flex-col justify-center items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading compiled items...</p>
                </div>
              ) : adminPayoutItems.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  No individual ledger rows bound to this payout reference.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center text-2xs">
                    <span className="text-slate-400 font-black uppercase">Consolidated Items</span>
                    <span className="font-mono font-black text-slate-900">{adminPayoutItems.length} Ledger Rows bound</span>
                  </div>

                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-2xs">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                          <th className="py-2.5 px-4">Booking ID</th>
                          <th className="py-2.5 px-4">Base Commission</th>
                          <th className="py-2.5 px-4">Rate</th>
                          <th className="py-2.5 px-4 text-right">Earned Portion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminPayoutItems.map(item => (
                          <tr key={item.id} className="border-b border-slate-50 text-slate-700 hover:bg-slate-50/40 transition">
                            <td className="py-3 px-4 font-mono font-semibold">
                              {item.ledger?.booking_id ? `Booking: ${item.ledger.booking_id.substring(0,8)}...` : "--"}
                              <span className="block text-[8px] text-slate-400 font-medium">Date: {item.ledger?.created_at ? new Date(item.ledger.created_at).toLocaleDateString() : "--"}</span>
                            </td>
                            <td className="py-3 px-4 font-mono">
                              ₹{(item.ledger?.nexora_commission_amount || 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-4 font-mono text-blue-600 font-bold">
                              {item.ledger?.partner_commission_rate ? `${(item.ledger.partner_commission_rate * 100).toFixed(0)}%` : "--"}
                            </td>
                            <td className="py-3 px-4 font-mono font-black text-emerald-600 text-right text-xs">
                              ₹{(item.amount || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setAdminSelectedPayout(null)}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-2xs uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
