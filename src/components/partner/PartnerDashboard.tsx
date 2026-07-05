import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Award, 
  CheckCircle, 
  X, 
  AlertCircle, 
  Globe, 
  ShieldCheck, 
  FileText,
  MapPin,
  Calendar,
  Lock,
  Plus,
  Loader2,
  Wallet,
  Building,
  CreditCard,
  QrCode,
  ClipboardList,
  BookOpen,
  Search,
  Clock,
  ArrowRight
} from "lucide-react";
import AppOnboardingChecklist from "../apps/AppOnboardingChecklist";

interface PartnerDashboardProps {
  navigateTo: (path: string) => void;
}

export default function PartnerDashboard({ navigateTo }: PartnerDashboardProps) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "leads" | "visits" | "tasks" | "shops" | "ledger" | "payouts" | "payout_account" | "milestones" | "training"
  >("overview");

  // 9C New State
  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Data States
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignedShops, setAssignedShops] = useState<Record<string, any>>({});
  const [ledger, setLedger] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
  const [payoutAccount, setPayoutAccount] = useState<any>(null);

  // 9B New Data States
  const [leads, setLeads] = useState<any[]>([]);
  const [visitLogs, setVisitLogs] = useState<any[]>([]);
  const [onboardingTasks, setOnboardingTasks] = useState<any[]>([]);
  const [trainingModules, setTrainingModules] = useState<any[]>([]);
  const [trainingProgress, setTrainingProgress] = useState<any[]>([]);

  // 9B Modals and Forms States
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [leadDetailOpen, setLeadDetailOpen] = useState(false);

  // New Lead Form State
  const [leadShopName, setLeadShopName] = useState("");
  const [leadOwnerName, setLeadOwnerName] = useState("");
  const [leadMobile, setLeadMobile] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadCategory, setLeadCategory] = useState("Salon");
  const [leadCity, setLeadCity] = useState("");
  const [leadDistrict, setLeadDistrict] = useState("");
  const [leadArea, setLeadArea] = useState("");
  const [leadFullAddress, setLeadFullAddress] = useState("");
  const [leadNotes, setLeadNotes] = useState("");
  const [leadSaving, setLeadSaving] = useState(false);

  // New Visit Form State
  const [visitLeadId, setVisitLeadId] = useState("");
  const [visitType, setVisitType] = useState("call");
  const [visitOutcome, setVisitOutcome] = useState("");
  const [visitNextAction, setVisitNextAction] = useState("");
  const [visitNextFollowUpAt, setVisitNextFollowUpAt] = useState("");
  const [visitSaving, setVisitSaving] = useState(false);

  // Lead Editing State (inside drawer)
  const [editingLeadStatus, setEditingLeadStatus] = useState("");
  const [editingLeadNotes, setEditingLeadNotes] = useState("");
  const [editingLeadFollowUp, setEditingLeadFollowUp] = useState("");
  const [editingLeadLiveDate, setEditingLeadLiveDate] = useState("");
  const [editingLeadBookings, setEditingLeadBookings] = useState<number | "">("");
  const [leadUpdating, setLeadUpdating] = useState(false);

  // Filters
  const [leadFilter, setLeadFilter] = useState<string>("all");
  const [visitFilter, setVisitFilter] = useState<"all" | "upcoming" | "overdue">("all");

  // Payout Form States
  const [destinationType, setDestinationType] = useState<"bank" | "upi">("bank");
  const [holderName, setHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upiId, setUpiId] = useState("");
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountMessage, setAccountMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Feedback notifications
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // 9C New Payout Details State & Handler
  const [selectedPayout, setSelectedPayout] = useState<any | null>(null);
  const [payoutItems, setPayoutItems] = useState<any[]>([]);
  const [loadingPayoutItems, setLoadingPayoutItems] = useState(false);

  const handleViewPayoutDetails = async (payout: any) => {
    setSelectedPayout(payout);
    setPayoutItems([]);
    setLoadingPayoutItems(true);
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
      
      // Fetch related commission ledger details if there are items
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
            setPayoutItems(enriched);
            return;
          }
        }
      }
      setPayoutItems(data || []);
    } catch (err) {
      console.error("Error loading payout details:", err);
      showNotification("error", "Failed to load payout breakdown details.");
    } finally {
      setLoadingPayoutItems(false);
    }
  };

  // Verification & loading
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchPartnerData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchPartnerData(session.user.id);
      } else {
        setPartnerProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPartnerData = async (userId: string) => {
    try {
      setLoading(true);
      // 1. Fetch partner profile
      const { data: profile, error: profileErr } = await supabase
        .from("partner_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileErr) throw profileErr;

      if (!profile) {
        // If no profile, check if there's a pending application
        const { data: apps } = await supabase
          .from("partner_applications")
          .select("status")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (apps && apps.length > 0) {
          setApplicationStatus(apps[0].status);
        } else {
          setApplicationStatus(null);
        }
        setPartnerProfile(null);
        setLoading(false);
        return;
      }

      setPartnerProfile(profile);

      // Fetch Dashboard Summary RPC
      try {
        setLoadingSummary(true);
        setSummaryError(null);
        const { data: summaryData, error: summaryErr } = await supabase.rpc("get_partner_dashboard_summary");
        if (summaryErr) {
          throw summaryErr;
        }
        setDashboardSummary(summaryData);
      } catch (err: any) {
        console.error("Error fetching get_partner_dashboard_summary:", err);
        setSummaryError(err.message || "Failed to load dashboard summary metrics.");
      } finally {
        setLoadingSummary(false);
      }

      // 2. Fetch Shop Assignments
      const { data: assignData } = await supabase
        .from("partner_shop_assignments")
        .select("*")
        .eq("partner_id", profile.id)
        .order("created_at", { ascending: false });

      const assignmentList = assignData || [];
      setAssignments(assignmentList);

      // Fetch shops linked to assignments securely
      if (assignmentList.length > 0) {
        const shopIds = assignmentList.map(a => a.shop_id);
        const { data: shopsData } = await supabase
          .from("shops")
          .select("id, name, city, area")
          .in("id", shopIds);

        if (shopsData) {
          const shopMap: Record<string, any> = {};
          shopsData.forEach(s => {
            shopMap[s.id] = s;
          });
          setAssignedShops(shopMap);
        }
      }

      // 3. Fetch Ledger Rows
      const { data: ledgerData } = await supabase
        .from("partner_commission_ledger")
        .select("*")
        .eq("partner_id", profile.id)
        .order("created_at", { ascending: false });

      setLedger(ledgerData || []);

      // 4. Fetch Milestones
      const { data: milestonesData } = await supabase
        .from("partner_milestone_rewards")
        .select("*")
        .eq("partner_id", profile.id)
        .order("milestone_shops", { ascending: true });

      setMilestones(milestonesData || []);

      // 5. Fetch Payout accounts
      const { data: accountData } = await supabase
        .from("partner_payout_accounts")
        .select("*")
        .eq("partner_id", profile.id)
        .maybeSingle();

      if (accountData) {
        setPayoutAccount(accountData);
        setDestinationType(accountData.destination_type || "bank");
        setHolderName(accountData.account_holder_name || "");
        setAccountNumber(accountData.bank_account_number || "");
        setIfsc(accountData.bank_ifsc || "");
        setUpiId(accountData.upi_id || "");
      }

      // 6. Fetch Payout History
      const { data: payoutHistoryData } = await supabase
        .from("partner_weekly_payouts")
        .select("*")
        .eq("partner_id", profile.id)
        .order("week_start", { ascending: false });

      setPayoutHistory(payoutHistoryData || []);

      // 7. Fetch Leads securely
      const { data: leadsData } = await supabase
        .from("partner_leads")
        .select("*")
        .eq("partner_id", profile.id)
        .order("created_at", { ascending: false });
      setLeads(leadsData || []);

      // 8. Fetch Visit Logs
      const { data: visitLogsData } = await supabase
        .from("partner_visit_logs")
        .select("*")
        .eq("partner_id", profile.id)
        .order("visit_at", { ascending: false });
      setVisitLogs(visitLogsData || []);

      // 9. Fetch Onboarding Tasks
      const { data: tasksData } = await supabase
        .from("partner_onboarding_tasks")
        .select("*")
        .eq("partner_id", profile.id)
        .order("created_at", { ascending: false });
      setOnboardingTasks(tasksData || []);

      // 10. Call RPC to ensure training progress rows exist
      try {
        await supabase.rpc("ensure_partner_training_progress", { p_partner_id: profile.id });
      } catch (err) {
        console.warn("ensure_partner_training_progress RPC check:", err);
      }

      // 11. Fetch Training Modules
      const { data: modulesData } = await supabase
        .from("partner_training_modules")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      setTrainingModules(modulesData || []);

      // 12. Fetch Training Progress
      const { data: progressData } = await supabase
        .from("partner_training_progress")
        .select("*")
        .eq("partner_id", profile.id);
      setTrainingProgress(progressData || []);

    } catch (err) {
      console.error("Error fetching partner dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayoutAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerProfile) return;

    if (!holderName || (destinationType === "bank" && (!accountNumber || !ifsc)) || (destinationType === "upi" && !upiId)) {
      setAccountMessage({ type: "error", text: "Kripya sabhi fields sahi tarike se bharein." });
      return;
    }

    setAccountSaving(true);
    setAccountMessage(null);

    try {
      const payload = {
        partner_id: partnerProfile.id,
        partner_user_id: partnerProfile.user_id,
        destination_type: destinationType,
        account_holder_name: holderName,
        bank_account_number: destinationType === "bank" ? accountNumber : null,
        bank_ifsc: destinationType === "bank" ? ifsc : null,
        upi_id: destinationType === "upi" ? upiId : null,
        is_active: true,
        is_verified: false
      };

      let query;
      if (payoutAccount) {
        query = supabase
          .from("partner_payout_accounts")
          .update(payload)
          .eq("id", payoutAccount.id);
      } else {
        query = supabase
          .from("partner_payout_accounts")
          .insert(payload);
      }

      const { error } = await query;
      if (error) throw error;

      setAccountMessage({ type: "success", text: "Payout details safaltapurvak save ho gayi hain!" });
      
      const { data: accountData } = await supabase
        .from("partner_payout_accounts")
        .select("*")
        .eq("partner_id", partnerProfile.id)
        .maybeSingle();
      if (accountData) {
        setPayoutAccount(accountData);
      }
    } catch (err: any) {
      console.error("Error saving payout account:", err);
      setAccountMessage({ type: "error", text: err.message || "Failed to save details. Please try again." });
    } finally {
      setAccountSaving(false);
    }
  };

  // 9B Lead Creation Handler
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerProfile) return;

    setLeadSaving(true);
    try {
      // 1. Call RPC partner_create_lead
      const { data: leadResult, error: leadErr } = await supabase.rpc("partner_create_lead", {
        p_shop_name: leadShopName,
        p_owner_name: leadOwnerName,
        p_mobile: leadMobile,
        p_email: leadEmail,
        p_category: leadCategory,
        p_city: leadCity,
        p_district: leadDistrict,
        p_area: leadArea,
        p_full_address: leadFullAddress,
        p_notes: leadNotes
      });

      if (leadErr) throw leadErr;

      // Determine the created lead ID from various potential response schemas
      let createdLeadId = "";
      if (leadResult) {
        if (typeof leadResult === "string") {
          createdLeadId = leadResult;
        } else if (leadResult.id) {
          createdLeadId = leadResult.id;
        } else if (Array.isArray(leadResult) && leadResult[0]?.id) {
          createdLeadId = leadResult[0].id;
        }
      }

      // Fallback query if ID not directly parsed from return value
      if (!createdLeadId) {
        const { data: lastLeads } = await supabase
          .from("partner_leads")
          .select("id")
          .eq("partner_id", partnerProfile.id)
          .eq("shop_name", leadShopName)
          .order("created_at", { ascending: false })
          .limit(1);
        if (lastLeads && lastLeads.length > 0) {
          createdLeadId = lastLeads[0].id;
        }
      }

      // 2. Call RPC create_partner_onboarding_tasks_for_lead
      if (createdLeadId) {
        try {
          await supabase.rpc("create_partner_onboarding_tasks_for_lead", {
            p_lead_id: createdLeadId
          });
        } catch (taskErr) {
          console.error("Error setting default tasks:", taskErr);
        }
      }

      showNotification("success", "Naya lead pipeline me jod diya gaya hai!");
      setIsLeadModalOpen(false);

      // Clear fields
      setLeadShopName("");
      setLeadOwnerName("");
      setLeadMobile("");
      setLeadEmail("");
      setLeadCity("");
      setLeadDistrict("");
      setLeadArea("");
      setLeadFullAddress("");
      setLeadNotes("");

      // Refresh data
      await fetchPartnerData(partnerProfile.user_id);

    } catch (err: any) {
      console.error("Lead creation error:", err);
      showNotification("error", err.message || "Lead save karne me asafalta hui.");
    } finally {
      setLeadSaving(false);
    }
  };

  // 9B Lead Update Handler
  const handleUpdateLead = async (leadId: string) => {
    setLeadUpdating(true);
    try {
      const { error } = await supabase
        .from("partner_leads")
        .update({
          status: editingLeadStatus,
          notes: editingLeadNotes,
          next_follow_up_at: editingLeadFollowUp ? new Date(editingLeadFollowUp).toISOString() : null,
          expected_go_live_date: editingLeadLiveDate || null,
          estimated_monthly_bookings: editingLeadBookings === "" ? null : Number(editingLeadBookings),
          updated_at: new Date().toISOString()
        })
        .eq("id", leadId);

      if (error) throw error;

      showNotification("success", "Lead status aur updates safaltapurvak save ho gaye!");
      setLeadDetailOpen(false);
      await fetchPartnerData(partnerProfile.user_id);
    } catch (err: any) {
      console.error("Error updating lead:", err);
      showNotification("error", err.message || "Lead update karne me asafalta hui.");
    } finally {
      setLeadUpdating(false);
    }
  };

  // 9B Visit Logging Handler
  const handleLogVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerProfile || !visitLeadId) return;

    setVisitSaving(true);
    try {
      // Fetch geolocation coordinates optionally
      let lat: number | null = null;
      let lng: number | null = null;

      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => {
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch (geoErr) {
          console.log("Location not permitted or timed out, logging visit without coordinates.");
        }
      }

      // Call RPC partner_log_visit
      const { error } = await supabase.rpc("partner_log_visit", {
        p_lead_id: visitLeadId,
        p_visit_type: visitType,
        p_outcome: visitOutcome,
        p_next_action: visitNextAction,
        p_next_follow_up_at: visitNextFollowUpAt ? new Date(visitNextFollowUpAt).toISOString() : null,
        p_latitude: lat,
        p_longitude: lng
      });

      if (error) throw error;

      // Update next follow-up in lead table too for syncing
      if (visitNextFollowUpAt) {
        await supabase
          .from("partner_leads")
          .update({
            next_follow_up_at: new Date(visitNextFollowUpAt).toISOString(),
            status: "follow_up"
          })
          .eq("id", visitLeadId);
      }

      showNotification("success", "Visit/Follow-up log safaltapurvak record ho gaya!");
      setIsVisitModalOpen(false);
      setVisitOutcome("");
      setVisitNextAction("");
      setVisitNextFollowUpAt("");

      await fetchPartnerData(partnerProfile.user_id);
    } catch (err: any) {
      console.error("Visit log error:", err);
      showNotification("error", err.message || "Visit/Follow-up log record karne me asafalta hui.");
    } finally {
      setVisitSaving(false);
    }
  };

  // Onboarding Tasks Completion toggler
  const handleToggleTaskStatus = async (taskId: string, currentStatus: string, nextStatus: string) => {
    try {
      const { error } = await supabase
        .from("partner_onboarding_tasks")
        .update({
          status: nextStatus,
          completed_at: nextStatus === "completed" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq("id", taskId);

      if (error) throw error;
      showNotification("success", `Task marked as ${nextStatus.replace('_', ' ')}!`);
      await fetchPartnerData(partnerProfile.user_id);
    } catch (err: any) {
      console.error("Task update error:", err);
      showNotification("error", err.message || "Task status update fail.");
    }
  };

  // Initialize Tasks for Lead (if not exists)
  const handleInitTasks = async (leadId: string) => {
    try {
      const { error } = await supabase.rpc("create_partner_onboarding_tasks_for_lead", {
        p_lead_id: leadId
      });
      if (error) throw error;
      showNotification("success", "Default tasks successfully initialized!");
      await fetchPartnerData(partnerProfile.user_id);
    } catch (err: any) {
      showNotification("error", err.message || "Failed to initialize tasks");
    }
  };

  // Training progress handler
  const handleUpdateTraining = async (moduleId: string, currentStatus: string | null) => {
    try {
      let newStatus = "in_progress";
      if (currentStatus === "in_progress") {
        newStatus = "completed";
      }

      const existingProg = trainingProgress.find(p => p.module_id === moduleId);

      let error;
      if (existingProg) {
        const { error: err } = await supabase
          .from("partner_training_progress")
          .update({
            status: newStatus,
            completed_at: newStatus === "completed" ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingProg.id);
        error = err;
      } else {
        const { error: err } = await supabase
          .from("partner_training_progress")
          .insert({
            partner_id: partnerProfile.id,
            partner_user_id: partnerProfile.user_id,
            module_id: moduleId,
            status: newStatus,
            started_at: new Date().toISOString(),
            completed_at: newStatus === "completed" ? new Date().toISOString() : null
          });
        error = err;
      }

      if (error) throw error;

      showNotification("success", `Training updated to ${newStatus}!`);
      await fetchPartnerData(partnerProfile.user_id);
    } catch (err: any) {
      console.error("Training progress update error:", err);
      showNotification("error", err.message || "Failed to update training progress.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-4" />
        <p className="text-xs text-slate-500 font-bold">Verifying Partner Profile...</p>
      </div>
    );
  }

  if (!session) {
    navigateTo("/login");
    return null;
  }

  // Not verified screen
  if (!partnerProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
            <Award className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight font-sans">Growth Partner Access Required</h1>
          
          {applicationStatus === "pending" ? (
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Aapka application review mein hai. Jaise hi admin ise approve karega, aapka dashboard activate ho jayega.
            </p>
          ) : applicationStatus === "rejected" ? (
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Aapka application reject ho gaya hai. Aap standard program requirements review karke landing page par phirse details verify kar sakte hain.
            </p>
          ) : (
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Aap abhi registered Nexora Growth Partner nahi hain. Apply kijiye, humare network builders ko join kijiye aur regular revenue share kamayein.
            </p>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <button 
              onClick={() => navigateTo("/growth-partner")}
              className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-wider text-2xs rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition cursor-pointer"
            >
              Go to Partner Landing Page
            </button>
            <button 
              onClick={() => navigateTo("/")}
              className="w-full py-4 bg-slate-100 text-slate-700 font-black uppercase tracking-wider text-2xs rounded-2xl hover:bg-slate-200 transition cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 9B Calculate Training progress percent
  const requiredModulesCount = trainingModules.filter(m => m.is_required).length || 5;
  const completedRequiredModulesCount = trainingModules
    .filter(m => m.is_required)
    .filter(m => {
      const prog = trainingProgress.find(p => p.module_id === m.id);
      return prog && prog.status === "completed";
    }).length;
  const trainingPercent = Math.round((completedRequiredModulesCount / requiredModulesCount) * 100) || 0;

  // 9B Sort Upcoming Follow-ups (leads with future follow-up dates)
  const upcomingLeads = leads
    .filter(l => l.next_follow_up_at && new Date(l.next_follow_up_at) > new Date())
    .sort((a, b) => new Date(a.next_follow_up_at).getTime() - new Date(b.next_follow_up_at).getTime());

  // Overdue followups
  const overdueLeads = leads
    .filter(l => l.next_follow_up_at && new Date(l.next_follow_up_at) < new Date() && l.status !== 'converted' && l.status !== 'rejected')
    .sort((a, b) => new Date(a.next_follow_up_at).getTime() - new Date(b.next_follow_up_at).getTime());

  return (
    <div id="partner_dashboard_view" className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-16">
      {/* Secure Notification Banner */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl border shadow-xl flex items-center gap-2 text-xs font-bold animate-fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
            : 'bg-rose-50 text-rose-800 border-rose-100'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 bg-white border-b border-slate-100 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo("/")}>
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm">N</div>
            <span className="text-sm font-black tracking-tight">Nexora <span className="text-blue-600">Partner</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block font-bold">Logged In As</span>
              <span className="text-2xs font-bold text-slate-700">{partnerProfile.full_name} ({partnerProfile.partner_code})</span>
            </div>
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                navigateTo("/");
              }}
              className="px-3 py-1.5 text-[10px] font-black text-rose-600 hover:bg-rose-50 border border-rose-100/50 rounded-lg transition cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 mt-8 space-y-8">
        
        <AppOnboardingChecklist appKey="partner_app" />

        {/* Banner */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 text-[9px] font-black tracking-wider uppercase rounded-full">
                {partnerProfile.partner_level || "Partner"}
              </span>
              <span className="text-xs text-slate-400 font-medium">Joined {new Date(partnerProfile.joined_at).toLocaleDateString()}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{partnerProfile.full_name}</h1>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {partnerProfile.city}, {partnerProfile.district}, {partnerProfile.state}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 w-full md:w-auto text-left md:text-right">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Unique Partner Code</span>
            <span className="text-sm font-mono font-black text-slate-800">{partnerProfile.partner_code}</span>
            <span className="text-[9px] text-slate-400 block font-medium">Refer partner code for onboarding salon clients</span>
          </div>
        </div>

        {/* Global Dashboard Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Leads</span>
            <h3 className="text-2xl font-black text-slate-900">{leads.length}</h3>
            <p className="text-[9px] text-slate-400 font-medium">registered in pipeline</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-2">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">Active Assignments</span>
            <h3 className="text-2xl font-black text-blue-600">{partnerProfile.active_shops || 0}</h3>
            <p className="text-[9px] text-slate-400 font-medium font-bold">generating live commission</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-2">
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider block">Lifetime Earnings</span>
            <h3 className="text-2xl font-black text-emerald-600">₹{(partnerProfile.lifetime_partner_earning || 0).toLocaleString()}</h3>
            <p className="text-[9px] text-slate-400 font-medium">total earned commissions</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-2">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider block">Pending / Wallet</span>
            <h3 className="text-2xl font-black text-amber-600">₹{(partnerProfile.pending_partner_earning || 0).toLocaleString()}</h3>
            <p className="text-[9px] text-slate-400 font-medium">awaiting weekly release</p>
          </div>
        </div>

        {/* Updated Tabs Bar with 10 Tabs */}
        <div className="flex border-b border-slate-200 gap-6 overflow-x-auto scrollbar-none pb-1">
          {[
            { id: "overview", label: "Overview", icon: TrendingUp },
            { id: "leads", label: `Lead Pipeline (${leads.length})`, icon: Users },
            { id: "visits", label: "Follow-ups / Visit Logs", icon: Calendar },
            { id: "tasks", label: "Onboarding Tasks", icon: ClipboardList },
            { id: "shops", label: `My Shops (${assignments.length})`, icon: Building },
            { id: "ledger", label: "Commission Ledger", icon: Wallet },
            { id: "payouts", label: "Weekly Payouts", icon: DollarSign },
            { id: "payout_account", label: "Payout Account", icon: CreditCard },
            { id: "milestones", label: "Milestones", icon: Award },
            { id: "training", label: `Training (${trainingPercent}%)`, icon: BookOpen }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-xs font-black uppercase tracking-wider transition relative cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? "text-blue-600 border-b-2 border-blue-600 font-black" 
                    : "text-slate-400 hover:text-slate-600 font-semibold"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            {/* Header / Actions bar */}
            <div className="flex justify-between items-center bg-white p-5 border border-slate-100 rounded-3xl shadow-3xs">
              <div>
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">Growth Partner Performance Summary</h2>
                <p className="text-[10px] text-slate-400 font-medium">Real-time status tracking via database RPC metrics.</p>
              </div>
              <button 
                onClick={() => fetchPartnerData(partnerProfile.user_id)}
                disabled={loadingSummary}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {loadingSummary ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5" />}
                Refresh Summary
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
                  onClick={() => fetchPartnerData(partnerProfile.user_id)}
                  className="px-3 py-1 bg-white border border-rose-200 text-rose-700 text-[10px] font-black uppercase rounded-lg hover:bg-rose-50 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* 15 KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* 1. Partner Code */}
              <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Partner Code</span>
                <p className="text-sm font-mono font-black text-slate-800">{dashboardSummary?.partner_code ?? partnerProfile.partner_code}</p>
                <p className="text-[8px] text-slate-400 font-medium">Unique referral code</p>
              </div>

              {/* 2. Partner Level */}
              <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider block">Partner Level</span>
                <p className="text-sm font-black text-blue-700 uppercase">{dashboardSummary?.partner_level ?? partnerProfile.partner_level ?? "Partner"}</p>
                <p className="text-[8px] text-slate-400 font-medium">Active rank level</p>
              </div>

              {/* 3. Total Shops Onboarded */}
              <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Total Shops</span>
                <p className="text-lg font-black text-slate-900">{dashboardSummary?.total_shops_onboarded ?? assignments.length}</p>
                <p className="text-[8px] text-slate-400 font-medium">Mapped salon stores</p>
              </div>

              {/* 4. Active Shops */}
              <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wider block">Active Shops</span>
                <p className="text-lg font-black text-emerald-600">{dashboardSummary?.active_shops ?? partnerProfile.active_shops ?? 0}</p>
                <p className="text-[8px] text-slate-400 font-medium">Generating sales commissions</p>
              </div>

              {/* 5. Total Leads */}
              <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Total Leads</span>
                <p className="text-lg font-black text-slate-900">{dashboardSummary?.total_leads ?? leads.length}</p>
                <p className="text-[8px] text-slate-400 font-medium font-sans">Leads in pipeline</p>
              </div>

              {/* 6. Converted Leads */}
              <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-wider block">Converted Leads</span>
                <p className="text-lg font-black text-indigo-600">{dashboardSummary?.converted_leads ?? leads.filter(l => l.status === 'converted').length}</p>
                <p className="text-[8px] text-slate-400 font-medium">Successfully onboarded</p>
              </div>

              {/* 7. Lifetime Nexora Commission */}
              <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Total Nexora Sales</span>
                <p className="text-sm font-mono font-black text-slate-800">₹{Math.round(dashboardSummary?.lifetime_nexora_commission ?? 0).toLocaleString()}</p>
                <p className="text-[8px] text-slate-400 font-medium">Base Nexora fee share</p>
              </div>

              {/* 8. Lifetime Partner Earning */}
              <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wider block">Lifetime Earnings</span>
                <p className="text-sm font-mono font-black text-emerald-600">₹{Math.round(dashboardSummary?.lifetime_partner_earning ?? partnerProfile.lifetime_partner_earning ?? 0).toLocaleString()}</p>
                <p className="text-[8px] text-slate-400 font-medium">Total earned payouts</p>
              </div>

              {/* 9. Pending Partner Earning */}
              <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider block">Wallet Balance</span>
                <p className="text-sm font-mono font-black text-amber-600">₹{Math.round(dashboardSummary?.pending_partner_earning ?? partnerProfile.pending_partner_earning ?? 0).toLocaleString()}</p>
                <p className="text-[8px] text-slate-400 font-medium">Pending weekly payout</p>
              </div>

              {/* 10. Paid Partner Earning */}
              <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Paid Out Earning</span>
                <p className="text-sm font-mono font-black text-slate-700">₹{Math.round(dashboardSummary?.paid_partner_earning ?? (partnerProfile.lifetime_partner_earning - partnerProfile.pending_partner_earning) ?? 0).toLocaleString()}</p>
                <p className="text-[8px] text-slate-400 font-medium">Released to bank</p>
              </div>

              {/* 11. This Week Eligible Earning */}
              <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
                <span className="text-[9px] font-black text-teal-500 uppercase tracking-wider block font-bold text-teal-600">This Week Eligible</span>
                <p className="text-sm font-mono font-black text-teal-600">₹{Math.round(dashboardSummary?.this_week_eligible_earning ?? 0).toLocaleString()}</p>
                <p className="text-[8px] text-slate-400 font-medium font-sans">Pending cycle release</p>
              </div>

              {/* 12. Upcoming Follow-ups */}
              <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Upcoming Visits</span>
                <p className="text-lg font-black text-slate-900">{dashboardSummary?.upcoming_followups ?? upcomingLeads.length}</p>
                <p className="text-[8px] text-slate-400 font-medium">Scheduled visit logs</p>
              </div>

              {/* 13. Overdue Follow-ups */}
              <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider block font-bold">Overdue Visits</span>
                <p className="text-lg font-black text-rose-600">{dashboardSummary?.overdue_followups ?? overdueLeads.length}</p>
                <p className="text-[8px] text-slate-400 font-medium">Missed followup dates</p>
              </div>

              {/* 14. Training Progress % */}
              <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
                <span className="text-[9px] font-black text-violet-500 uppercase tracking-wider block font-bold">Training Progress</span>
                <p className="text-lg font-black text-violet-600">{dashboardSummary?.training_percent ?? trainingPercent}%</p>
                <p className="text-[8px] text-slate-400 font-medium">Required lessons status</p>
              </div>

              {/* 15. Achieved Milestones */}
              <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Milestones</span>
                <p className="text-lg font-black text-slate-900">{dashboardSummary?.achieved_milestones ?? milestones.filter(m => m.status === 'achieved' || m.status === 'rewarded').length}</p>
                <p className="text-[8px] text-slate-400 font-medium">Targets achieved</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="bg-white p-6 border border-slate-100 rounded-3xl space-y-4 shadow-3xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Quick Growth Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button 
                    onClick={() => { setActiveTab("leads"); setIsLeadModalOpen(true); }}
                    className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex flex-col justify-between h-24 text-left transition cursor-pointer"
                  >
                    <Plus className="w-5 h-5 mb-auto" />
                    <span>Add New Lead</span>
                  </button>
                  <button 
                    onClick={() => { setActiveTab("visits"); setIsVisitModalOpen(true); }}
                    className="p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs flex flex-col justify-between h-24 text-left transition cursor-pointer"
                  >
                    <Calendar className="w-5 h-5 mb-auto" />
                    <span>Log Follow-up / Visit</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab("training")}
                    className="p-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs flex flex-col justify-between h-24 text-left transition cursor-pointer border border-slate-200/50"
                  >
                    <BookOpen className="w-5 h-5 text-blue-600 mb-auto" />
                    <span>Go to Training</span>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-6 border border-slate-100 rounded-3xl space-y-4 shadow-3xs">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Recent Visit Logs</h3>
                  <button onClick={() => setActiveTab("visits")} className="text-[10px] font-black uppercase text-blue-600 hover:underline">View All</button>
                </div>

                {visitLogs.length === 0 ? (
                  <p className="text-2xs text-slate-400 text-center py-6">Abhi tak koi visit log record nahi hai.</p>
                ) : (
                  <div className="space-y-3">
                    {visitLogs.slice(0, 3).map(log => {
                      const leadObj = leads.find(l => l.id === log.lead_id);
                      return (
                        <div key={log.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900">{leadObj?.shop_name || "Lead Shop"}</span>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-black text-[8px] uppercase rounded">
                              {log.visit_type}
                            </span>
                          </div>
                          <p className="text-slate-600 font-medium">Outcome: {log.outcome}</p>
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Next Action: {log.next_action}</span>
                            <span>{new Date(log.visit_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Overview Panels */}
            <div className="space-y-6">
              {/* Upcoming Followups */}
              <div className="bg-white p-6 border border-slate-100 rounded-3xl space-y-4 shadow-3xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Upcoming Follow-ups</h3>
                {upcomingLeads.length === 0 ? (
                  <p className="text-2xs text-slate-400 text-center py-4">Koi upcoming follow-up schedule nahi hai.</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingLeads.slice(0, 3).map(lead => (
                      <div key={lead.id} className="p-3 bg-slate-50 border border-amber-100 rounded-xl text-xs space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900">{lead.shop_name}</h4>
                            <p className="text-[10px] text-slate-500 font-semibold">{lead.owner_name} ({lead.mobile})</p>
                          </div>
                          <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 font-bold text-[8px] uppercase rounded border border-amber-100">
                            Follow-up
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-amber-800 font-black bg-amber-50/50 p-1.5 rounded">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{new Date(lead.next_follow_up_at).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Training progress snapshot */}
              <div className="bg-white p-6 border border-slate-100 rounded-3xl space-y-4 shadow-3xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Training Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-2xs font-bold text-slate-600">
                    <span>Required Modules</span>
                    <span>{completedRequiredModulesCount} / {requiredModulesCount} Completed</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${trainingPercent}%` }}></div>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab("training")}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold uppercase tracking-wider text-[10px] rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Continue Training</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Tab 2: Lead Pipeline */}
        {activeTab === "leads" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900">Lead Pipeline</h2>
                <p className="text-2xs text-slate-400 font-medium">Naye leads ko add karein, unke follow-ups monitor karein aur onboarding progress track karein.</p>
              </div>
              <button 
                onClick={() => setIsLeadModalOpen(true)}
                className="px-4 py-2.5 bg-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:bg-blue-700 transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add New Lead
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {["all", "new", "contacted", "interested", "demo_scheduled", "onboarding", "converted", "not_interested", "rejected"].map(filter => (
                <button
                  key={filter}
                  onClick={() => setLeadFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-2xs font-bold uppercase tracking-wider transition border cursor-pointer whitespace-nowrap ${
                    leadFilter === filter 
                      ? "bg-slate-900 border-slate-900 text-white" 
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {filter.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Leads list */}
            {leads.length === 0 ? (
              <div className="bg-white border border-slate-100 p-12 text-center rounded-3xl space-y-4">
                <Users className="w-12 h-12 text-slate-400 mx-auto" />
                <div className="space-y-1 max-w-sm mx-auto">
                  <h4 className="text-xs font-black text-slate-700">Koi Leads Pipeline Me Nahi Hain</h4>
                  <p className="text-2xs text-slate-400 leading-relaxed font-medium">
                    Apne local network me salon owner se milein aur pehla lead pipeline me jodkar digital onboarding process ko shuru karein.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leads
                  .filter(l => leadFilter === "all" || l.status === leadFilter)
                  .map(lead => {
                    // count onboarding tasks status
                    const leadTasks = onboardingTasks.filter(t => t.lead_id === lead.id);
                    const completedTasks = leadTasks.filter(t => t.status === "completed").length;

                    return (
                      <div key={lead.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs flex flex-col justify-between hover:border-blue-200 transition">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 font-bold text-[8px] uppercase tracking-wider rounded">
                              {lead.category || "Salon"}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                              lead.status === 'converted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              lead.status === 'rejected' || lead.status === 'not_interested' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                              'bg-blue-50 text-blue-700 border border-blue-100'
                            }`}>
                              {lead.status.replace('_', ' ')}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-black text-sm text-slate-900 tracking-tight">{lead.shop_name}</h3>
                            <p className="text-2xs text-slate-500 font-semibold mt-0.5">Owner: {lead.owner_name}</p>
                            <p className="text-2xs text-slate-400 font-medium flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {lead.area}, {lead.city}
                            </p>
                          </div>

                          {/* Onboarding progress meter */}
                          <div className="space-y-1 border-t border-slate-100 pt-3">
                            <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                              <span>Onboarding Tasks:</span>
                              <span>{completedTasks} / {leadTasks.length || 6} Completed</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-blue-600 h-full rounded-full transition-all duration-300" 
                                style={{ width: `${Math.round((completedTasks / (leadTasks.length || 6)) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                          <div className="text-[10px] text-slate-400 font-medium">
                            {lead.next_follow_up_at ? (
                              <span className="flex items-center gap-1 text-amber-700 font-bold">
                                <Clock className="w-3.5 h-3.5" />
                                Follow-up: {new Date(lead.next_follow_up_at).toLocaleDateString()}
                              </span>
                            ) : (
                              <span>No follow-up set</span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setEditingLeadStatus(lead.status);
                              setEditingLeadNotes(lead.notes || "");
                              setEditingLeadFollowUp(lead.next_follow_up_at ? lead.next_follow_up_at.substring(0, 16) : "");
                              setEditingLeadLiveDate(lead.expected_go_live_date || "");
                              setEditingLeadBookings(lead.estimated_monthly_bookings || "");
                              setLeadDetailOpen(true);
                            }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                          >
                            Manage Details <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Follow-ups / Visit Logs */}
        {activeTab === "visits" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900">Follow-ups & Visit Logs</h2>
                <p className="text-2xs text-slate-400 font-medium">Aapke sabhi field actions ka visual tracker aur call summaries.</p>
              </div>
              <button 
                onClick={() => {
                  if (leads.length === 0) {
                    showNotification("error", "Kripya visit log karne se pehle kam se kam ek Lead create kijiye.");
                    return;
                  }
                  setVisitLeadId(leads[0]?.id || "");
                  setIsVisitModalOpen(true);
                }}
                className="px-4 py-2.5 bg-slate-950 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:bg-slate-900 transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Log New Visit
              </button>
            </div>

            {/* Visit filter */}
            <div className="flex gap-2">
              {(["all", "upcoming", "overdue"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setVisitFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-2xs font-bold uppercase tracking-wider transition border cursor-pointer ${
                    visitFilter === f 
                      ? "bg-slate-900 border-slate-900 text-white" 
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {visitFilter === "upcoming" && upcomingLeads.length === 0 ? (
              <p className="text-2xs text-slate-400 text-center py-6">Koi upcoming follow-up schedules nahi hain.</p>
            ) : visitFilter === "overdue" && overdueLeads.length === 0 ? (
              <p className="text-2xs text-slate-400 text-center py-6 text-emerald-600 font-bold font-sans">Sunder! Koi bhi follow-up delay me nahi hai.</p>
            ) : visitFilter === "all" && visitLogs.length === 0 ? (
              <p className="text-2xs text-slate-400 text-center py-6">Abhi tak koi visit record nahi kiya gaya hai.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left col: Logs Feed */}
                {visitFilter === "all" && (
                  <div className="space-y-3 md:col-span-2">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Historical Logs</h3>
                    {visitLogs.map(log => {
                      const leadObj = leads.find(l => l.id === log.lead_id);
                      return (
                        <div key={log.id} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-3xs flex flex-col justify-between">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="font-bold text-slate-900 text-xs">{leadObj?.shop_name || "Lead Shop"}</h4>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Contact: {leadObj?.owner_name} ({leadObj?.mobile})</p>
                            </div>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[9px] font-black uppercase">
                              {log.visit_type}
                            </span>
                          </div>
                          
                          <p className="text-2xs text-slate-600 font-medium mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100/50 leading-relaxed">
                            <span className="font-bold text-slate-800">Outcome:</span> {log.outcome}
                          </p>

                          <div className="flex flex-col sm:flex-row justify-between text-[10px] text-slate-400 pt-3 border-t border-slate-100/50 mt-3 font-semibold">
                            <span>Next Action Target: {log.next_action}</span>
                            <span>Visit At: {new Date(log.visit_at).toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Upcoming list */}
                {visitFilter === "upcoming" && (
                  <div className="space-y-3 md:col-span-2">
                    {upcomingLeads.map(lead => (
                      <div key={lead.id} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-3xs flex justify-between items-center">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900 text-xs">{lead.shop_name}</h4>
                          <p className="text-2xs text-slate-400 font-semibold">Owner: {lead.owner_name} | {lead.mobile}</p>
                          <p className="text-[10px] text-slate-500 font-medium">Notes: {lead.notes || "No notes available."}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[9px] font-black text-amber-600 block uppercase mb-1">Scheduled Follow-up</span>
                          <span className="px-2 py-1 bg-amber-50 text-amber-800 font-mono text-[10px] font-black rounded border border-amber-100 block">
                            {new Date(lead.next_follow_up_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Overdue list */}
                {visitFilter === "overdue" && (
                  <div className="space-y-3 md:col-span-2">
                    {overdueLeads.map(lead => (
                      <div key={lead.id} className="bg-white border border-rose-200 p-4 rounded-2xl shadow-3xs flex justify-between items-center">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900 text-xs">{lead.shop_name}</h4>
                          <p className="text-2xs text-slate-400 font-semibold">Owner: {lead.owner_name} | {lead.mobile}</p>
                          <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Delay overdue follow-up target
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[9px] font-black text-rose-600 block uppercase mb-1">Missed Date</span>
                          <span className="px-2 py-1 bg-rose-50 text-rose-800 font-mono text-[10px] font-black rounded border border-rose-100 block">
                            {new Date(lead.next_follow_up_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Onboarding Tasks */}
        {activeTab === "tasks" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">Lead Onboarding Checklist</h2>
              <p className="text-2xs text-slate-400 font-medium">Salon launch karne ke digital onboarding check list steps.</p>
            </div>

            {leads.length === 0 ? (
              <p className="text-2xs text-slate-400 text-center py-6">Onboarding tasks generate karne ke liye pehle leads pipeline me create karein.</p>
            ) : (
              <div className="space-y-6">
                {leads.map(lead => {
                  const tasksForLead = onboardingTasks.filter(t => t.lead_id === lead.id);
                  const completedCount = tasksForLead.filter(t => t.status === "completed").length;

                  return (
                    <div key={lead.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="font-black text-sm text-slate-900">{lead.shop_name}</h3>
                          <p className="text-2xs text-slate-400 font-semibold mt-0.5">Owner: {lead.owner_name} | Category: {lead.category}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-[10px] font-bold text-slate-600">
                            {completedCount} / {tasksForLead.length || 6} Tasks Completed
                          </span>
                          {tasksForLead.length === 0 && (
                            <button
                              onClick={() => handleInitTasks(lead.id)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] uppercase rounded-lg transition"
                            >
                              Initialize Tasks
                            </button>
                          )}
                        </div>
                      </div>

                      {tasksForLead.length === 0 ? (
                        <p className="text-2xs text-slate-400 py-2">Tasks list is not initialized yet. Press Initialize Tasks button to default.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {tasksForLead.map(task => (
                            <div key={task.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-3">
                              <div className="space-y-1">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                  task.status === "completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                  task.status === "in_progress" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                                  task.status === "blocked" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                                  "bg-slate-100 text-slate-400"
                                }`}>
                                  {task.status.replace('_', ' ')}
                                </span>
                                <h4 className="font-bold text-xs text-slate-800">{task.title}</h4>
                                <p className="text-[10px] text-slate-400 leading-normal font-medium">{task.description}</p>
                              </div>

                              {/* Task Action Selector */}
                              <div className="flex gap-1.5 justify-end">
                                {["pending", "in_progress", "completed", "blocked"].map(st => (
                                  <button
                                    key={st}
                                    onClick={() => handleToggleTaskStatus(task.id, task.status, st)}
                                    disabled={task.status === st}
                                    className={`px-1.5 py-1 text-[8px] font-bold uppercase rounded border transition cursor-pointer ${
                                      task.status === st 
                                        ? "bg-slate-800 text-white border-slate-800" 
                                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100"
                                    }`}
                                  >
                                    {st === "in_progress" ? "Progress" : st}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: My Shops */}
        {activeTab === "shops" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900">My Shop Assignments</h2>
                <p className="text-2xs text-slate-400 font-medium">Aapke dwara onboard kiye gaye salon shops jahan se aapko commissions milti hain.</p>
              </div>
            </div>

            {assignments.length === 0 ? (
              <div className="bg-white border border-slate-100 p-12 text-center rounded-3xl space-y-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                  <Building className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h4 className="text-xs font-black text-slate-700">Koi Shops Assigned Nahi Hain</h4>
                  <p className="text-2xs text-slate-400 leading-relaxed font-medium">
                    Aapne abhi tak koi salon onboard nahi kiya hai. Naye shops ko onboard karne me help karein aur unhe apna partner code reference dilwayein. Admin ke assign karte hi yahan dikhega!
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-6">Salon Shop</th>
                        <th className="py-4 px-6">Location</th>
                        <th className="py-4 px-6">Onboarding Date</th>
                        <th className="py-4 px-6">Commission Valid Till</th>
                        <th className="py-4 px-6 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((asg) => {
                        const shopObj = assignedShops[asg.shop_id];
                        return (
                          <tr key={asg.id} className="border-b border-slate-100 text-xs hover:bg-slate-50/50 transition">
                            <td className="py-4 px-6">
                              <div className="font-bold text-slate-900">{shopObj?.name || "Loading..."}</div>
                              <span className="text-[10px] text-slate-400 font-mono block">ID: {asg.shop_id}</span>
                            </td>
                            <td className="py-4 px-6 text-slate-500 font-medium">
                              {shopObj ? `${shopObj.area || ""}, ${shopObj.city || ""}` : "Loading..."}
                            </td>
                            <td className="py-4 px-6 text-slate-600 font-medium font-mono">
                              {new Date(asg.commission_start_date).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-6 text-slate-600 font-medium font-mono">
                              {asg.commission_end_date ? new Date(asg.commission_end_date).toLocaleDateString() : "Unlimited"}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                asg.is_active 
                                  ? "bg-emerald-50 border border-emerald-100 text-emerald-700" 
                                  : "bg-slate-50 border border-slate-100 text-slate-400"
                              }`}>
                                {asg.is_active ? "Active" : "Inactive"}
                              </span>
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

        {/* Tab 6: Commission Ledger */}
        {activeTab === "ledger" && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">Commission Earnings Ledger</h2>
              <p className="text-2xs text-slate-400 font-medium">Har transaction / booking se hui aapki direct commission ki history.</p>
            </div>

            {ledger.length === 0 ? (
              <div className="bg-white border border-slate-100 p-12 text-center rounded-3xl space-y-4">
                <Wallet className="w-12 h-12 text-slate-400 mx-auto" />
                <div className="space-y-1 max-w-sm mx-auto">
                  <h4 className="text-xs font-black text-slate-700">Koi Commissions Record Nahi Hain</h4>
                  <p className="text-2xs text-slate-400 leading-relaxed font-medium">
                    Onboarded shops me real client booking hone par yahan credit rows create hongi.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-6">Booking Reference</th>
                        <th className="py-4 px-6">Nexora Commission</th>
                        <th className="py-4 px-6">Partner Rate</th>
                        <th className="py-4 px-6">Earned Share</th>
                        <th className="py-4 px-6">Commission Date</th>
                        <th className="py-4 px-6 text-right">Payment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.map((row) => (
                        <tr key={row.id} className="border-b border-slate-100 text-xs hover:bg-slate-50/50 transition">
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900">Booking: {row.booking_id?.substring(0, 8)}...</div>
                            <span className="text-[9px] text-slate-400 block font-medium">Payment ID: {row.razorpay_payment_row_id?.substring(0, 8)}...</span>
                          </td>
                          <td className="py-4 px-6 text-slate-500 font-medium font-mono">
                            ₹{(row.nexora_commission_amount || 0).toFixed(2)}
                          </td>
                          <td className="py-4 px-6 text-blue-600 font-bold font-mono">
                            {(row.partner_commission_rate * 100).toFixed(0)}%
                            <span className="text-[8px] text-slate-400 font-medium block font-sans">Month {row.commission_month_number}</span>
                          </td>
                          <td className="py-4 px-6 text-emerald-600 font-black font-mono text-sm">
                            ₹{(row.partner_commission_amount || 0).toFixed(2)}
                          </td>
                          <td className="py-4 px-6 text-slate-600 font-medium font-mono">
                            {new Date(row.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              row.status === 'paid' 
                                ? "bg-emerald-50 border border-emerald-100 text-emerald-700" 
                                : "bg-amber-50 border border-amber-100 text-amber-700"
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

        {/* Tab 7: Weekly Payouts */}
        {activeTab === "payouts" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900">Weekly Payouts History</h2>
                <p className="text-2xs text-slate-400 font-medium">Nexora team dwara aapke target bank accounts me kiye gaye payouts ki report.</p>
              </div>
            </div>

            {payoutHistory.length === 0 ? (
              <div className="bg-white border border-slate-100 p-12 text-center rounded-3xl space-y-4">
                <CreditCard className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-400 font-medium font-sans">Abhi tak koi weekly payout register nahi hai.</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-6">Week Cycle</th>
                        <th className="py-4 px-6">Total Commission</th>
                        <th className="py-4 px-6">Payout Amount</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6">Payout Reference</th>
                        <th className="py-4 px-6">Processed Date</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payoutHistory.map((payout) => (
                        <tr key={payout.id} className="border-b border-slate-100 text-xs hover:bg-slate-50/50 transition">
                          <td className="py-4 px-6 font-semibold text-slate-900 whitespace-nowrap">
                            {payout.week_start} to {payout.week_end}
                          </td>
                          <td className="py-4 px-6 font-mono font-medium text-slate-500">
                            ₹{(payout.total_commission_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-6 font-mono font-black text-emerald-600 text-sm">
                            ₹{(payout.payout_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                              payout.status === 'paid' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' :
                              payout.status === 'processing' ? 'bg-blue-50 border border-blue-100 text-blue-700' :
                              payout.status === 'failed' ? 'bg-rose-50 border border-rose-100 text-rose-700' :
                              'bg-amber-50 border border-amber-100 text-amber-700'
                            }`}>
                              {payout.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-mono text-slate-600 font-medium whitespace-nowrap">
                            {payout.payout_reference || "--"}
                          </td>
                          <td className="py-4 px-6 font-mono text-slate-400 font-medium">
                            {payout.processed_at ? new Date(payout.processed_at).toLocaleDateString() : "--"}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleViewPayoutDetails(payout)}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer"
                            >
                              View Breakdown
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payout Details Breakdown Modal */}
            {selectedPayout && (
              <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fade-in">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto scrollbar-none flex flex-col font-sans">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-black text-slate-900 tracking-tight">Payout Breakdown Details</h3>
                      <p className="text-[10px] text-slate-400 font-medium font-bold">Week Cycle: {selectedPayout.week_start} to {selectedPayout.week_end}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedPayout(null)} 
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg bg-slate-50 border border-slate-100 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4 flex-1 text-xs">
                    {/* Summary card */}
                    <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Total Commission</span>
                        <span className="font-bold text-slate-800 text-sm font-mono">₹{(selectedPayout.total_commission_amount || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wider block">Net Payout Amount</span>
                        <span className="font-black text-emerald-600 text-sm font-mono">₹{(selectedPayout.payout_amount || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Current Status</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider inline-block mt-1 ${
                          selectedPayout.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                          selectedPayout.status === 'processing' ? 'bg-blue-50 text-blue-700' :
                          selectedPayout.status === 'failed' ? 'bg-rose-50 text-rose-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {selectedPayout.status}
                        </span>
                      </div>
                    </div>

                    {/* Breakdown items list */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Included Commissions Breakdown</h4>
                      
                      {loadingPayoutItems ? (
                        <div className="py-12 text-center flex flex-col items-center justify-center">
                          <Loader2 className="animate-spin h-6 w-6 text-blue-600 mb-2" />
                          <p className="text-2xs text-slate-400 font-semibold">Loading breakdown details...</p>
                        </div>
                      ) : payoutItems.length === 0 ? (
                        <p className="text-2xs text-slate-400 py-6 text-center">No individual commission items mapped to this payout period.</p>
                      ) : (
                        <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                          <table className="w-full text-left text-2xs">
                            <thead>
                              <tr className="border-b border-slate-100 bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                <th className="py-2 px-4">Booking Ref</th>
                                <th className="py-2 px-4">Nexora Fee</th>
                                <th className="py-2 px-4 text-center">Partner Rate</th>
                                <th className="py-2 px-4 text-right">Partner Earned</th>
                              </tr>
                            </thead>
                            <tbody>
                              {payoutItems.map((item) => (
                                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                                  <td className="py-2.5 px-4">
                                    {item.ledger?.booking_id ? (
                                      <div>
                                        <p className="font-bold text-slate-800">Ref: {item.ledger.booking_id.substring(0, 8)}...</p>
                                        <p className="text-[8px] text-slate-400">{new Date(item.ledger.created_at).toLocaleDateString()}</p>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400">Ledger ID: {item.commission_ledger_id?.substring(0, 8)}...</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-4 font-mono font-medium text-slate-500">
                                    ₹{item.ledger?.nexora_commission_amount ? item.ledger.nexora_commission_amount.toFixed(2) : "0.00"}
                                  </td>
                                  <td className="py-2.5 px-4 text-center text-blue-600 font-bold font-mono">
                                    {item.ledger?.partner_commission_rate ? `${(item.ledger.partner_commission_rate * 100).toFixed(0)}%` : "--"}
                                  </td>
                                  <td className="py-2.5 px-4 text-right text-emerald-600 font-black font-mono">
                                    ₹{item.amount ? item.amount.toFixed(2) : "0.00"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {selectedPayout.status === 'failed' && selectedPayout.failure_reason && (
                      <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl">
                        <span className="text-[9px] font-black uppercase tracking-wider text-rose-600 block mb-0.5">Failure Reason</span>
                        <p className="font-medium font-mono text-2xs">{selectedPayout.failure_reason}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-6 border-t border-slate-100 bg-slate-50/50 text-right">
                    <button
                      onClick={() => setSelectedPayout(null)}
                      className="px-6 py-2.5 bg-slate-900 text-white font-black text-2xs uppercase tracking-wider rounded-xl hover:bg-slate-800 transition cursor-pointer"
                    >
                      Close Breakdown
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 8: Payout Account */}
        {activeTab === "payout_account" && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xs max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900">Payout Account Configuration</h3>
              <p className="text-2xs text-slate-400 font-medium">Aapka kamaya hua share kis account me release kiya jaye, kripya sahi detail bharein.</p>
            </div>

            <form onSubmit={handleSavePayoutAccount} className="space-y-4">
              {accountMessage && (
                <div className={`p-4 rounded-xl text-2xs font-bold flex items-center gap-2 ${
                  accountMessage.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                    : 'bg-rose-50 text-rose-800 border border-rose-100'
                }`}>
                  <AlertCircle className="w-4 h-4" />
                  <span>{accountMessage.text}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Destination Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input 
                      type="radio" 
                      name="destination_type" 
                      value="bank"
                      checked={destinationType === "bank"}
                      onChange={() => setDestinationType("bank")}
                    />
                    <span>Bank Transfer</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input 
                      type="radio" 
                      name="destination_type" 
                      value="upi"
                      checked={destinationType === "upi"}
                      onChange={() => setDestinationType("upi")}
                    />
                    <span>UPI ID Transfer</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Account Holder Name</label>
                <input 
                  type="text"
                  required
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  placeholder="E.g., Rajesh Kumar"
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                />
              </div>

              {destinationType === "bank" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Bank Account Number</label>
                    <input 
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="E.g., 123456789012"
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Bank IFSC Code</label>
                    <input 
                      type="text"
                      required
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                      placeholder="E.g., SBIN0001234"
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">UPI ID</label>
                  <input 
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="E.g., rajesh@okaxis"
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                  />
                </div>
              )}

              <button 
                type="submit"
                disabled={accountSaving}
                className="px-6 py-3 bg-blue-600 text-white font-black text-2xs uppercase tracking-wider rounded-xl shadow-md shadow-blue-500/10 hover:bg-blue-700 transition flex items-center gap-2 cursor-pointer disabled:bg-blue-300"
              >
                {accountSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Account Details</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 9: Milestones */}
        {activeTab === "milestones" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-5 border border-slate-100 rounded-3xl shadow-3xs">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Milestones & Rewards</h2>
                <p className="text-[10px] text-slate-400 font-medium">Salons onboard karke levels unlock karein aur Nexora exclusive prizes jitein!</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const { error } = await supabase.rpc("refresh_partner_milestones", { p_partner_id: partnerProfile.id });
                    if (error) throw error;
                    showNotification("success", "Milestones synced successfully!");
                    await fetchPartnerData(partnerProfile.user_id);
                  } catch (err: any) {
                    console.error("Error refreshing milestones:", err);
                    showNotification("error", err.message || "Failed to sync milestones.");
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                Sync Milestones
              </button>
            </div>

            {/* Progress bar */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-2xs space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Total shops onboarded: <span className="text-blue-600 font-black">{partnerProfile.total_shops_onboarded || 0}</span></span>
                <span className="text-slate-400 font-medium">Next major rank target: 100 Shops</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((partnerProfile.total_shops_onboarded || 0) / 100) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Milestones cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {milestones.map((m) => (
                <div 
                  key={m.id} 
                  className={`p-6 rounded-3xl border shadow-2xs relative overflow-hidden flex justify-between items-start gap-4 transition ${
                    m.status === 'achieved' || m.status === 'rewarded'
                      ? 'bg-gradient-to-br from-blue-50/20 to-indigo-50/10 border-blue-100 text-slate-900' 
                      : 'bg-white border-slate-100 text-slate-500'
                  }`}
                >
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        m.status === 'achieved' || m.status === 'rewarded'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'bg-slate-50 text-slate-400 border border-slate-100'
                      }`}>
                        Target: {m.milestone_shops} Shops
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-wider ${
                        m.status === 'rewarded' 
                          ? 'text-emerald-600' 
                          : m.status === 'achieved' 
                            ? 'text-blue-600' 
                            : 'text-slate-400'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <h4 className="font-black text-sm tracking-tight text-slate-900">{m.reward_title}</h4>
                    <p className="text-2xs text-slate-400 leading-relaxed font-medium">{m.reward_description}</p>
                    
                    {m.achieved_at && (
                      <p className="text-[10px] text-slate-400 font-medium font-sans">Achieved: {new Date(m.achieved_at).toLocaleDateString()}</p>
                    )}
                  </div>

                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 bg-white shadow-sm border-slate-100">
                    <Award className={`w-5 h-5 ${m.status === 'achieved' || m.status === 'rewarded' ? 'text-blue-600' : 'text-slate-300'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 10: Training */}
        {activeTab === "training" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 border border-slate-100 rounded-3xl shadow-3xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h2 className="text-lg font-black tracking-tight text-slate-900">Training Academy</h2>
                <p className="text-2xs text-slate-400 font-medium">Learn field ethics, product rules, payment architectures, and build trust in salon owners.</p>
              </div>
              <div className="bg-slate-50 p-4 border border-slate-200/50 rounded-2xl shrink-0 text-center sm:text-right space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academy Progress</span>
                <span className="text-base font-black text-emerald-600 block">{completedRequiredModulesCount} / {requiredModulesCount} Completed ({trainingPercent}%)</span>
              </div>
            </div>

            {trainingModules.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 text-slate-400">
                <p className="text-xs">No training modules loaded. Try refreshing or contact admin.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trainingModules.map((module) => {
                  const progress = trainingProgress.find(p => p.module_id === module.id);
                  const isCompleted = progress && progress.status === "completed";
                  const isInProgress = progress && progress.status === "in_progress";

                  return (
                    <div key={module.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-3xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-blue-600">Step {module.display_order}</span>
                          {module.is_required && (
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100/50 font-black text-[8px] uppercase tracking-wider rounded">
                              Required
                            </span>
                          )}
                          {isCompleted ? (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 font-black text-[8px] uppercase tracking-wider rounded">
                              Completed
                            </span>
                          ) : isInProgress ? (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 font-black text-[8px] uppercase tracking-wider rounded">
                              In Progress
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-400 font-black text-[8px] uppercase tracking-wider rounded">
                              Not Started
                            </span>
                          )}
                        </div>

                        <h3 className="font-black text-sm text-slate-900 tracking-tight">{module.title}</h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">{module.description}</p>
                        
                        {/* Display Pitch rules or notes strictly based on rules */}
                        {module.module_key === 'payment_rules' && (
                          <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl text-[10px] text-slate-600 font-medium leading-relaxed max-w-2xl">
                            <span className="font-bold text-blue-700 block mb-0.5">Strict Payment Trust Architecture:</span>
                            Razorpay payment Gateway with 10% Nexora standard commission and 90% direct owner earning payout. No custom owner QR setup permitted on site.
                          </div>
                        )}
                        {module.module_key === 'field_ethics' && (
                          <div className="bg-rose-50/50 border border-rose-100 p-3 rounded-xl text-[10px] text-slate-600 font-medium leading-relaxed max-w-2xl">
                            <span className="font-bold text-rose-700 block mb-0.5">Brand Anti-MLM Guideline:</span>
                            Do NOT use any MLM, pyramid scheme, or franchise multiplier wordings in pitches. Direct professional B2B software presentation only.
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
                        {isCompleted ? (
                          <span className="px-4 py-2 text-center text-xs text-emerald-600 font-black bg-emerald-50 border border-emerald-100 rounded-xl">
                            Verified Completed
                          </span>
                        ) : (
                          <button
                            onClick={() => handleUpdateTraining(module.id, progress?.status || null)}
                            className={`px-4 py-2.5 text-center text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer border ${
                              isInProgress 
                                ? "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700" 
                                : "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            {isInProgress ? "Mark Completed" : "Start Module"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: ADD LEAD */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto scrollbar-none flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight font-sans">Naya Salon Lead Pipeline Me Jodein</h3>
                <p className="text-2xs text-slate-400 font-medium">Kripya owner details aur exact location correct tarike se submit karein.</p>
              </div>
              <button 
                onClick={() => setIsLeadModalOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg bg-slate-50 border border-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-6 space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Shop Name</label>
                  <input 
                    type="text" required value={leadShopName} onChange={(e) => setLeadShopName(e.target.value)}
                    placeholder="E.g., Star Hair Salon"
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Owner Full Name</label>
                  <input 
                    type="text" required value={leadOwnerName} onChange={(e) => setLeadOwnerName(e.target.value)}
                    placeholder="E.g., Manoj Tiwari"
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Owner Mobile</label>
                  <input 
                    type="tel" required value={leadMobile} onChange={(e) => setLeadMobile(e.target.value)}
                    placeholder="E.g., +91 9876543210"
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Owner Email</label>
                  <input 
                    type="email" required value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="E.g., owner@example.com"
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Category</label>
                  <select 
                    value={leadCategory} onChange={(e) => setLeadCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                  >
                    <option value="Salon">Salon</option>
                    <option value="Spa">Spa</option>
                    <option value="Hair Studio">Hair Studio</option>
                    <option value="Beauty Parlour">Beauty Parlour</option>
                    <option value="Unisex Salon">Unisex Salon</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">City</label>
                  <input 
                    type="text" required value={leadCity} onChange={(e) => setLeadCity(e.target.value)}
                    placeholder="E.g., Patna"
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">District</label>
                  <input 
                    type="text" required value={leadDistrict} onChange={(e) => setLeadDistrict(e.target.value)}
                    placeholder="E.g., Patna"
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Area</label>
                  <input 
                    type="text" required value={leadArea} onChange={(e) => setLeadArea(e.target.value)}
                    placeholder="E.g., Boring Road"
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Full Address</label>
                <textarea 
                  required rows={2} value={leadFullAddress} onChange={(e) => setLeadFullAddress(e.target.value)}
                  placeholder="E.g., Plot 24, Near SBI Bank, Boring Road, Patna, 800001"
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Initial Notes (Optional)</label>
                <textarea 
                  rows={2} value={leadNotes} onChange={(e) => setLeadNotes(e.target.value)}
                  placeholder="E.g., Owner wants booking demo next Friday."
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50 p-4 rounded-b-3xl">
                <button
                  type="button" onClick={() => setIsLeadModalOpen(false)}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={leadSaving}
                  className="px-6 py-2.5 bg-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-blue-700 transition cursor-pointer flex items-center gap-1"
                >
                  {leadSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Lead</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG VISIT / FOLLOW-UP */}
      {isVisitModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight font-sans">Log Follow-up / Visit</h3>
                <p className="text-2xs text-slate-400 font-medium font-bold">Track physical interactions, outcomes, and schedule reminders.</p>
              </div>
              <button 
                onClick={() => setIsVisitModalOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg bg-slate-50 border border-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogVisit}>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Select Target Lead</label>
                  <select
                    required value={visitLeadId} onChange={(e) => setVisitLeadId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                  >
                    <option value="">-- Choose Lead --</option>
                    {leads.map(lead => (
                      <option key={lead.id} value={lead.id}>
                        {lead.shop_name} ({lead.owner_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Visit / Interaction Type</label>
                  <select
                    required value={visitType} onChange={(e) => setVisitType(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                  >
                    <option value="call">Voice Call</option>
                    <option value="whatsapp">WhatsApp Conversation</option>
                    <option value="field_visit">Direct Field Visit</option>
                    <option value="demo">Product Booking Demo</option>
                    <option value="training">Owner OS Training</option>
                    <option value="follow_up">General Follow-up</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Outcome Description</label>
                  <textarea
                    required rows={3} value={visitOutcome} onChange={(e) => setVisitOutcome(e.target.value)}
                    placeholder="E.g., Owner showed interest in the free website setup but needs to verify service charges with team."
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Next Action Goal</label>
                  <input
                    type="text" required value={visitNextAction} onChange={(e) => setVisitNextAction(e.target.value)}
                    placeholder="E.g., Call on Monday to finalize services."
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Next Follow-up Reminder Time</label>
                  <input
                    type="datetime-local" value={visitNextFollowUpAt} onChange={(e) => setVisitNextFollowUpAt(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
                <button
                  type="button" onClick={() => setIsVisitModalOpen(false)}
                  className="px-4 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={visitSaving || !visitLeadId}
                  className="px-6 py-2 bg-slate-950 text-white font-black text-2xs uppercase tracking-wider rounded-xl hover:bg-slate-900 transition cursor-pointer flex items-center gap-1"
                >
                  {visitSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Log</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER: LEAD DETAILS */}
      {leadDetailOpen && selectedLead && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-end z-50 animate-fade-in">
          <div className="bg-white max-w-lg w-full h-full border-l border-slate-100 shadow-2xl p-6 overflow-y-auto scrollbar-none flex flex-col space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider font-mono">Lead ID: {selectedLead.id.substring(0, 8)}</span>
                <h3 className="font-black text-base text-slate-900">{selectedLead.shop_name}</h3>
              </div>
              <button 
                onClick={() => setLeadDetailOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Form Section */}
            <div className="space-y-4 flex-1 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100/50">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Owner Name:</span>
                  <span className="font-bold text-slate-800">{selectedLead.owner_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Contact Number:</span>
                  <span className="font-mono text-slate-800 font-bold">{selectedLead.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Email Address:</span>
                  <span className="text-slate-800 font-bold">{selectedLead.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Full Address:</span>
                  <span className="text-slate-800 font-bold text-right max-w-xs">{selectedLead.full_address}</span>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Update Lead Parameters</h4>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Lead Status</label>
                  <select
                    value={editingLeadStatus} onChange={(e) => setEditingLeadStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition font-semibold"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="interested">Interested</option>
                    <option value="demo_scheduled">Demo Scheduled</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="converted">Converted</option>
                    <option value="not_interested">Not Interested</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Next Follow-up Date/Time</label>
                  <input
                    type="datetime-local" value={editingLeadFollowUp} onChange={(e) => setEditingLeadFollowUp(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Expected Go-Live Date</label>
                  <input
                    type="date" value={editingLeadLiveDate} onChange={(e) => setEditingLeadLiveDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Estimated Monthly Bookings</label>
                  <input
                    type="number" value={editingLeadBookings} onChange={(e) => setEditingLeadBookings(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="E.g., 250"
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Notes / Log History</label>
                  <textarea
                    rows={3} value={editingLeadNotes} onChange={(e) => setEditingLeadNotes(e.target.value)}
                    placeholder="E.g., Owner showed serious interest, demo set for Friday."
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-xs transition"
                  />
                </div>
              </div>

              {/* Tasks for this lead list */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Onboarding Checklist</h4>
                  <button 
                    onClick={() => setActiveTab("tasks")}
                    className="text-[9px] font-black uppercase text-blue-600 hover:underline"
                  >
                    Manage Tasks
                  </button>
                </div>
                
                <div className="space-y-2">
                  {onboardingTasks.filter(t => t.lead_id === selectedLead.id).length === 0 ? (
                    <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-[10px] text-slate-400 font-semibold mb-2">Checklist tasks not initialized yet</p>
                      <button
                        onClick={() => handleInitTasks(selectedLead.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] uppercase rounded"
                      >
                        Initialize Checklist
                      </button>
                    </div>
                  ) : (
                    onboardingTasks
                      .filter(t => t.lead_id === selectedLead.id)
                      .map(task => (
                        <div key={task.id} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-2xs">
                          <div>
                            <span className="font-bold text-slate-800 block">{task.title}</span>
                            <span className="text-[9px] text-slate-400 font-medium">{task.description}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded font-black text-[8px] uppercase shrink-0 ${
                            task.status === "completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                            task.status === "in_progress" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                            "bg-slate-100 text-slate-400"
                          }`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex gap-2 justify-end">
              <button
                onClick={() => setLeadDetailOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => handleUpdateLead(selectedLead.id)}
                disabled={leadUpdating}
                className="px-6 py-2 bg-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-blue-700 transition cursor-pointer disabled:bg-blue-300"
              >
                {leadUpdating ? "Saving..." : "Save Parameters"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
