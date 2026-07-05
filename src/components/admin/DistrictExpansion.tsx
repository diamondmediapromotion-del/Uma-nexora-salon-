import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  MapPin,
  Globe,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  FileText,
  Users,
  Briefcase,
  ShieldCheck,
  Smartphone,
  Info,
  Loader2,
  Sparkles,
  Plus,
  Edit2,
  Check,
  X,
  ChevronRight,
  Play,
  TrendingUp,
  BarChart2,
  ShieldAlert,
  ChevronDown,
  Clock,
  ThumbsUp,
  Sliders,
  AlertOctagon
} from "lucide-react";

export default function DistrictExpansion() {
  // Sub-tabs: overview | district_launches | areas | shop_readiness | partner_assignments | daily_reports | incidents | exit_review
  const [subTab, setSubTab] = useState<
    "overview" | "launches" | "areas" | "readiness" | "assignments" | "reports" | "incidents" | "review"
  >("overview");

  // Global State
  const [launches, setLaunches] = useState<any[]>([]);
  const [selectedLaunchId, setSelectedLaunchId] = useState<string>("");
  const [areas, setAreas] = useState<any[]>([]);
  const [readinessRecords, setReadinessRecords] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [dailyReports, setDailyReports] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);

  // Loading States
  const [loading, setLoading] = useState(false);
  const [rpcSummary, setRpcSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Form states
  const [newLaunch, setNewLaunch] = useState({
    district_name: "Ajmer",
    state_name: "Rajasthan",
    target_pilot_shops: 25,
    target_pilot_partners: 3,
    target_pilot_customers: 100
  });
  const [launchCreationResult, setLaunchCreationResult] = useState<any>(null);

  const [newArea, setNewArea] = useState({
    area_name: "",
    display_order: 1,
    target_shops: 5
  });

  const [newReadiness, setNewReadiness] = useState({
    area_id: "",
    shop_id: "",
    partner_id: "",
    shop_name: "",
    owner_name: "",
    owner_mobile: "",
    category: "Hair Salon",
    address: ""
  });

  const [editingReadiness, setEditingReadiness] = useState<any>(null);

  const [newAssignment, setNewAssignment] = useState({
    partner_id: "",
    assigned_areas: [] as string[],
    target_leads: 50,
    target_ready_shops: 10,
    notes: ""
  });

  const [newReport, setNewReport] = useState({
    report_day: 1,
    report_date: new Date().toISOString().split("T")[0],
    status: "go" as "go" | "hold" | "critical_hold",
    active_areas: 0,
    ready_shops: 0,
    incomplete_shops: 0,
    new_customers: 0,
    bookings_created: 0,
    bookings_completed: 0,
    payments_attempted: 0,
    payments_captured: 0,
    payment_failures: 0,
    refunds_count: 0,
    support_tickets_opened: 0,
    support_tickets_resolved: 0,
    p0_issues: 0,
    p1_issues: 0,
    fixed_today: "",
    open_bugs: "",
    owner_feedback: "",
    customer_feedback: "",
    next_day_actions: ""
  });

  const [newIncident, setNewIncident] = useState({
    severity: "p3" as "p0" | "p1" | "p2" | "p3",
    status: "open" as "open" | "in_progress" | "fixed" | "verified" | "closed",
    module_name: "Booking",
    title: "",
    description: "",
    affected_shop_id: "",
    affected_user_id: "",
    root_cause: "",
    fix_summary: "",
    verification_note: "",
    assigned_to: ""
  });

  // Custom scores for Exit Review (max limits defined by requirements)
  const [reviewScores, setReviewScores] = useState({
    payment_reliability: 20, // max 20
    security_rls: 20,       // max 20
    booking_reliability: 15, // max 15
    shop_owner_readiness: 10,// max 10
    customer_ux: 10,        // max 10
    support_ops: 10,        // max 10
    partner_ops: 5,         // max 5
    pwa_stability: 5,       // max 5
    admin_monitoring: 5     // max 5
  });

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch initial data
  useEffect(() => {
    fetchLaunches();
    fetchPartners();
    fetchShops();
  }, []);

  // Sync subsequent tables when selectedLaunchId changes
  useEffect(() => {
    if (selectedLaunchId) {
      fetchLaunchDetails(selectedLaunchId);
    } else {
      setAreas([]);
      setReadinessRecords([]);
      setAssignments([]);
      setDailyReports([]);
      setIncidents([]);
      setRpcSummary(null);
    }
  }, [selectedLaunchId]);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  const fetchLaunches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("district_launches")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setLaunches(data || []);
      if (data && data.length > 0 && !selectedLaunchId) {
        setSelectedLaunchId(data[0].id);
      }
    } catch (err: any) {
      showFeedback("error", "Failed to fetch launches: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase.from("partner_profiles").select("id, full_name, partner_code");
      if (!error && data) {
        setPartners(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchShops = async () => {
    try {
      const { data, error } = await supabase.from("shops").select("id, shop_name, owner_name, mobile_number, category, city, area, address");
      if (!error && data) {
        setShops(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLaunchDetails = async (launchId: string) => {
    setLoadingSummary(true);
    try {
      // 1. RPC Summary
      const { data: summaryData, error: summaryErr } = await supabase.rpc("admin_get_district_launch_summary", {
        p_launch_id: launchId
      });
      if (!summaryErr && summaryData) {
        setRpcSummary(summaryData);
      } else {
        setRpcSummary(null);
      }

      // 2. Areas
      const { data: areasData } = await supabase
        .from("district_launch_areas")
        .select("*")
        .eq("launch_id", launchId)
        .order("display_order", { ascending: true });
      setAreas(areasData || []);

      // 3. Shop Readiness
      const { data: readinessData } = await supabase
        .from("district_shop_readiness")
        .select("*")
        .eq("launch_id", launchId)
        .order("created_at", { ascending: false });
      setReadinessRecords(readinessData || []);

      // 4. Partner Assignments
      const { data: assignData } = await supabase
        .from("district_partner_assignments")
        .select("*")
        .eq("launch_id", launchId)
        .order("created_at", { ascending: false });
      setAssignments(assignData || []);

      // 5. Daily Reports
      const { data: reportsData } = await supabase
        .from("district_daily_reports")
        .select("*")
        .eq("launch_id", launchId)
        .order("report_day", { ascending: true });
      setDailyReports(reportsData || []);

      // 6. Incidents
      const { data: incidentsData } = await supabase
        .from("district_launch_incidents")
        .select("*")
        .eq("launch_id", launchId)
        .order("created_at", { ascending: false });
      setIncidents(incidentsData || []);

    } catch (err: any) {
      console.error("Error fetching launch details:", err);
    } finally {
      setLoadingSummary(false);
    }
  };

  // 2. Create District Launch
  const handleCreateLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.rpc("admin_create_district_launch", {
        p_district_name: newLaunch.district_name.trim(),
        p_state_name: newLaunch.state_name.trim(),
        p_target_pilot_shops: Number(newLaunch.target_pilot_shops),
        p_target_pilot_partners: Number(newLaunch.target_pilot_partners),
        p_target_pilot_customers: Number(newLaunch.target_pilot_customers)
      });

      if (error) throw error;

      showFeedback("success", `District pilot for ${newLaunch.district_name} created successfully.`);
      
      // Select the newly created launch
      if (data && data.id) {
        setLaunchCreationResult(data);
        setSelectedLaunchId(data.id);
      } else {
        // Fallback fetch if data didn't return complete object
        await fetchLaunches();
      }
      
      // Reset form
      setNewLaunch({
        district_name: "Ajmer",
        state_name: "Rajasthan",
        target_pilot_shops: 25,
        target_pilot_partners: 3,
        target_pilot_customers: 100
      });
      fetchLaunches();
    } catch (err: any) {
      showFeedback("error", "Creation failed: " + err.message);
    }
  };

  // 3. Suggest & Add Default Areas for Ajmer
  const handleSuggestAjmerAreas = async () => {
    if (!selectedLaunchId) return;
    const currentLaunch = launches.find(l => l.id === selectedLaunchId);
    if (!currentLaunch || currentLaunch.district_name.toLowerCase() !== "ajmer") {
      showFeedback("error", "Default areas are only suggested for Ajmer launches.");
      return;
    }

    const ajmerAreas = [
      { name: "Civil Lines", order: 1 },
      { name: "Vaishali Nagar Ajmer", order: 2 },
      { name: "Panchsheel Nagar", order: 3 },
      { name: "Kesar Ganj", order: 4 },
      { name: "Adarsh Nagar", order: 5 },
      { name: "Ramganj", order: 6 },
      { name: "Pushkar Road", order: 7 },
      { name: "Beawar Road", order: 8 },
      { name: "Naka Madar", order: 9 },
      { name: "Dargah Bazar", order: 10 }
    ];

    try {
      setLoading(true);
      for (const area of ajmerAreas) {
        const { error } = await supabase.rpc("admin_add_district_launch_area", {
          p_launch_id: selectedLaunchId,
          p_area_name: area.name,
          p_display_order: area.order,
          p_target_shops: 5
        });
        if (error) console.error("Error inserting default area:", area.name, error.message);
      }
      showFeedback("success", "Ajmer default areas setup completed successfully.");
      fetchLaunchDetails(selectedLaunchId);
    } catch (err: any) {
      showFeedback("error", "Error setting up default areas: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add Custom Area Manually
  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLaunchId || !newArea.area_name) return;
    try {
      const { error } = await supabase.rpc("admin_add_district_launch_area", {
        p_launch_id: selectedLaunchId,
        p_area_name: newArea.area_name.trim(),
        p_display_order: Number(newArea.display_order),
        p_target_shops: Number(newArea.target_shops)
      });
      if (error) throw error;
      showFeedback("success", `Area "${newArea.area_name}" added successfully.`);
      setNewArea({ area_name: "", display_order: areas.length + 2, target_shops: 5 });
      fetchLaunchDetails(selectedLaunchId);
    } catch (err: any) {
      showFeedback("error", "Failed to add area: " + err.message);
    }
  };

  // Update Area Status directly in table
  const handleUpdateAreaStatus = async (areaId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("district_launch_areas")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", areaId);
      if (error) throw error;
      showFeedback("success", "Area status updated.");
      fetchLaunchDetails(selectedLaunchId);
    } catch (err: any) {
      showFeedback("error", "Update failed: " + err.message);
    }
  };

  // 4. Shop Readiness Tracking
  const handleAddShopReadiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLaunchId) return;

    let selectedShopData = null;
    if (newReadiness.shop_id) {
      selectedShopData = shops.find(s => s.id === newReadiness.shop_id);
    }

    const shopName = selectedShopData ? selectedShopData.shop_name : newReadiness.shop_name;
    const ownerName = selectedShopData ? selectedShopData.owner_name : newReadiness.owner_name;
    const ownerMobile = selectedShopData ? selectedShopData.mobile_number : newReadiness.owner_mobile;
    const category = selectedShopData ? selectedShopData.category : newReadiness.category;
    const address = selectedShopData ? selectedShopData.address : newReadiness.address;

    const selectedArea = areas.find(a => a.id === newReadiness.area_id);
    const areaName = selectedArea ? selectedArea.area_name : "Other";

    if (!shopName || !ownerName || !ownerMobile) {
      showFeedback("error", "Shop Name, Owner Name, and Mobile are required.");
      return;
    }

    try {
      const { error } = await supabase
        .from("district_shop_readiness")
        .insert({
          launch_id: selectedLaunchId,
          area_id: newReadiness.area_id || null,
          shop_id: newReadiness.shop_id || null,
          partner_id: newReadiness.partner_id || null,
          shop_name: shopName,
          owner_name: ownerName,
          owner_mobile: ownerMobile,
          category,
          area_name: areaName,
          address,
          status: "lead",
          owner_login_ok: false,
          shop_profile_complete: false,
          services_prices_complete: false,
          photos_gallery_complete: false,
          booking_test_passed: false,
          owner_booking_visible: false,
          wallet_visible: false,
          website_template_ok: false,
          no_owner_qr_confirmed: false,
          support_education_done: false,
          readiness_percent: 0
        });

      if (error) throw error;
      showFeedback("success", `Shop "${shopName}" added to readiness tracking.`);
      setNewReadiness({
        area_id: "",
        shop_id: "",
        partner_id: "",
        shop_name: "",
        owner_name: "",
        owner_mobile: "",
        category: "Hair Salon",
        address: ""
      });
      fetchLaunchDetails(selectedLaunchId);
    } catch (err: any) {
      showFeedback("error", "Failed to add shop: " + err.message);
    }
  };

  const handleUpdateReadinessChecklist = async (record: any) => {
    // Calculate checklist items & status
    const checklist = [
      record.owner_login_ok,
      record.shop_profile_complete,
      record.services_prices_complete,
      record.photos_gallery_complete,
      record.booking_test_passed,
      record.owner_booking_visible,
      record.wallet_visible,
      record.website_template_ok,
      record.no_owner_qr_confirmed,
      record.support_education_done
    ];
    const completedCount = checklist.filter(Boolean).length;
    const readiness_percent = completedCount * 10;

    // Critical check logic for 'ready' status
    const criticalPassed =
      record.owner_login_ok &&
      record.shop_profile_complete &&
      record.services_prices_complete &&
      record.booking_test_passed &&
      record.owner_booking_visible &&
      record.no_owner_qr_confirmed &&
      record.support_education_done;

    let targetStatus = record.status;
    if (criticalPassed && record.status === "onboarding") {
      targetStatus = "ready";
    }

    try {
      const { error } = await supabase.rpc("admin_update_district_shop_readiness", {
        p_readiness_id: record.id,
        p_status: targetStatus,
        p_owner_login_ok: record.owner_login_ok,
        p_shop_profile_complete: record.shop_profile_complete,
        p_services_prices_complete: record.services_prices_complete,
        p_photos_gallery_complete: record.photos_gallery_complete,
        p_booking_test_passed: record.booking_test_passed,
        p_owner_booking_visible: record.owner_booking_visible,
        p_wallet_visible: record.wallet_visible,
        p_website_template_ok: record.website_template_ok,
        p_no_owner_qr_confirmed: record.no_owner_qr_confirmed,
        p_support_education_done: record.support_education_done,
        p_admin_note: record.admin_note || "",
        p_owner_feedback: record.owner_feedback || "",
        p_technical_issue: record.technical_issue || ""
      });

      if (error) throw error;
      showFeedback("success", "Shop readiness updated.");
      setEditingReadiness(null);
      fetchLaunchDetails(selectedLaunchId);
    } catch (err: any) {
      showFeedback("error", "Update failed: " + err.message);
    }
  };

  // 5. Partner Assignments
  const handleAssignPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLaunchId || !newAssignment.partner_id) return;

    try {
      const { error } = await supabase
        .from("district_partner_assignments")
        .insert({
          launch_id: selectedLaunchId,
          partner_id: newAssignment.partner_id,
          assigned_area_names: newAssignment.assigned_areas,
          target_leads: Number(newAssignment.target_leads),
          target_ready_shops: Number(newAssignment.target_ready_shops),
          notes: newAssignment.notes,
          is_active: true
        });

      if (error) throw error;
      showFeedback("success", "Partner assigned successfully.");
      setNewAssignment({
        partner_id: "",
        assigned_areas: [],
        target_leads: 50,
        target_ready_shops: 10,
        notes: ""
      });
      fetchLaunchDetails(selectedLaunchId);
    } catch (err: any) {
      showFeedback("error", "Assignment failed: " + err.message);
    }
  };

  // 6. Daily District Pilot Reports
  const handleAddDailyReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLaunchId) return;

    try {
      const { error } = await supabase.rpc("admin_upsert_district_daily_report", {
        p_launch_id: selectedLaunchId,
        p_report_day: Number(newReport.report_day),
        p_report_date: newReport.report_date,
        p_status: newReport.status,
        p_active_areas: Number(newReport.active_areas),
        p_ready_shops: Number(newReport.ready_shops),
        p_incomplete_shops: Number(newReport.incomplete_shops),
        p_new_customers: Number(newReport.new_customers),
        p_bookings_created: Number(newReport.bookings_created),
        p_bookings_completed: Number(newReport.bookings_completed),
        p_payments_attempted: Number(newReport.payments_attempted),
        p_payments_captured: Number(newReport.payments_captured),
        p_payment_failures: Number(newReport.payment_failures),
        p_refunds_count: Number(newReport.refunds_count),
        p_support_tickets_opened: Number(newReport.support_tickets_opened),
        p_support_tickets_resolved: Number(newReport.support_tickets_resolved),
        p_p0_issues: Number(newReport.p0_issues),
        p_p1_issues: Number(newReport.p1_issues),
        p_fixed_today: newReport.fixed_today || "not available",
        p_open_bugs: newReport.open_bugs || "not available",
        p_owner_feedback: newReport.owner_feedback || "not available",
        p_customer_feedback: newReport.customer_feedback || "not available",
        p_next_day_actions: newReport.next_day_actions || "not available"
      });

      if (error) throw error;
      showFeedback("success", `Day ${newReport.report_day} pilot report logged.`);
      setNewReport({
        report_day: dailyReports.length + 2,
        report_date: new Date().toISOString().split("T")[0],
        status: "go",
        active_areas: 0,
        ready_shops: 0,
        incomplete_shops: 0,
        new_customers: 0,
        bookings_created: 0,
        bookings_completed: 0,
        payments_attempted: 0,
        payments_captured: 0,
        payment_failures: 0,
        refunds_count: 0,
        support_tickets_opened: 0,
        support_tickets_resolved: 0,
        p0_issues: 0,
        p1_issues: 0,
        fixed_today: "",
        open_bugs: "",
        owner_feedback: "",
        customer_feedback: "",
        next_day_actions: ""
      });
      fetchLaunchDetails(selectedLaunchId);
    } catch (err: any) {
      showFeedback("error", "Failed to save daily report: " + err.message);
    }
  };

  // 7. District Incident Tracking
  const handleAddIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLaunchId || !newIncident.title) return;

    try {
      const { error } = await supabase
        .from("district_launch_incidents")
        .insert({
          launch_id: selectedLaunchId,
          severity: newIncident.severity,
          status: newIncident.status,
          module_name: newIncident.module_name,
          title: newIncident.title.trim(),
          description: newIncident.description.trim(),
          affected_shop_id: newIncident.affected_shop_id || null,
          affected_user_id: newIncident.affected_user_id || null,
          root_cause: newIncident.root_cause || "investigating",
          fix_summary: newIncident.fix_summary || "",
          verification_note: newIncident.verification_note || ""
        });

      if (error) throw error;
      showFeedback("success", `Incident "${newIncident.title}" registered.`);
      setNewIncident({
        severity: "p3",
        status: "open",
        module_name: "Booking",
        title: "",
        description: "",
        affected_shop_id: "",
        affected_user_id: "",
        root_cause: "",
        fix_summary: "",
        verification_note: "",
        assigned_to: ""
      });
      fetchLaunchDetails(selectedLaunchId);
    } catch (err: any) {
      showFeedback("error", "Failed to add incident: " + err.message);
    }
  };

  const handleUpdateIncidentStatus = async (id: string, status: string, fix?: string) => {
    try {
      const { error } = await supabase
        .from("district_launch_incidents")
        .update({
          status,
          fix_summary: fix || "Updated via dashboard",
          updated_at: new Date().toISOString(),
          ...(status === "fixed" && { fixed_at: new Date().toISOString() }),
          ...(status === "closed" && { closed_at: new Date().toISOString() })
        })
        .eq("id", id);
      if (error) throw error;
      showFeedback("success", "Incident updated successfully.");
      fetchLaunchDetails(selectedLaunchId);
    } catch (err: any) {
      showFeedback("error", "Update failed: " + err.message);
    }
  };

  // Update active launch status dropdown in Overview/Review
  const handleUpdateLaunchStatus = async (status: string) => {
    if (!selectedLaunchId) return;
    try {
      const { error } = await supabase
        .from("district_launches")
        .update({ launch_status: status, updated_at: new Date().toISOString() })
        .eq("id", selectedLaunchId);
      if (error) throw error;
      showFeedback("success", `Launch status updated to ${status}.`);
      fetchLaunches();
      fetchLaunchDetails(selectedLaunchId);
    } catch (err: any) {
      showFeedback("error", "Failed to update launch status: " + err.message);
    }
  };

  // Compute local fallbacks if rpcSummary lacks details
  const activeLaunch = launches.find(l => l.id === selectedLaunchId);
  const openP0Count = incidents.filter(i => i.severity === "p0" && i.status !== "closed" && i.status !== "fixed").length;
  const openP1Count = incidents.filter(i => i.severity === "p1" && i.status !== "closed" && i.status !== "fixed").length;

  const totalShopsCount = readinessRecords.length;
  const readyShopsCount = readinessRecords.filter(r => r.status === "ready" || r.status === "active").length;
  const holdShopsCount = readinessRecords.filter(r => r.status === "hold").length;
  const avgReadiness = totalShopsCount > 0 
    ? Math.round(readinessRecords.reduce((acc, curr) => acc + (Number(curr.readiness_percent) || 0), 0) / totalShopsCount)
    : 0;

  // Payments logic
  const totalPaymentsCaptured = dailyReports.reduce((acc, curr) => acc + (Number(curr.payments_captured) || 0), 0);
  const totalPaymentFailures = dailyReports.reduce((acc, curr) => acc + (Number(curr.payment_failures) || 0), 0);

  // 9. Exit Review Score & Recommendation Decision
  const totalExitScore = 
    reviewScores.payment_reliability +
    reviewScores.security_rls +
    reviewScores.booking_reliability +
    reviewScores.shop_owner_readiness +
    reviewScores.customer_ux +
    reviewScores.support_ops +
    reviewScores.partner_ops +
    reviewScores.pwa_stability +
    reviewScores.admin_monitoring;

  // Blocker conditions for auto-fail
  const hasPaymentWalletMismatch = false; // Could be flagged if noted in report notes
  const hasOwnerQRVisible = readinessRecords.some(r => r.no_owner_qr_confirmed === false);
  const isSupportBroken = false;

  const hasAutoFailBlocker = openP0Count > 0 || hasOwnerQRVisible || hasPaymentWalletMismatch || isSupportBroken;
  
  let scaleRecommendation = "hold_and_fix";
  if (hasAutoFailBlocker) {
    scaleRecommendation = "critical_hold_fail";
  } else if (totalExitScore >= 90) {
    scaleRecommendation = "scale_ready";
  } else if (totalExitScore >= 75) {
    scaleRecommendation = "extend_pilot";
  } else if (totalExitScore >= 60) {
    scaleRecommendation = "hold_and_fix";
  } else {
    scaleRecommendation = "rollback_maintenance";
  }

  return (
    <div className="space-y-6">
      {/* feedback toast */}
      {feedback && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-fade-in ${
          feedback.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-rose-50 text-rose-800 border-rose-100"
        }`}>
          <AlertCircle className="w-4 h-4" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Selector and Main Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            District Expansion Control Room
          </h2>
          <p className="text-xs text-slate-400 font-medium">Configure, monitor, and scale repeatable district pilots seamlessly.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Select Target Pilot:</label>
          <select
            value={selectedLaunchId}
            onChange={(e) => setSelectedLaunchId(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800 outline-none transition-all cursor-pointer w-full md:w-56"
          >
            <option value="">-- Choose Launch District --</option>
            {launches.map((l) => (
              <option key={l.id} value={l.id}>
                {l.district_name} ({l.launch_status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-tabs menu */}
      <div className="flex border-b border-slate-200 gap-4 overflow-x-auto scrollbar-none pb-0.5">
        {[
          { id: "overview", label: "Overview", icon: BarChart2 },
          { id: "launches", label: "District Launches", icon: Globe },
          { id: "areas", label: "Launch Areas", icon: MapPin },
          { id: "readiness", label: "Shop Readiness", icon: CheckCircle },
          { id: "assignments", label: "Partners", icon: Users },
          { id: "reports", label: "Daily Reports", icon: FileText },
          { id: "incidents", label: `Incidents (${incidents.filter(i => i.status !== 'closed').length})`, icon: ShieldAlert },
          { id: "review", label: "Exit Review", icon: Sliders }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition relative cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                subTab === tab.id
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

      {/* Active Area: Overview tab */}
      {subTab === "overview" && (
        <div className="space-y-6">
          {/* Warning/Notification banners */}
          <div className="space-y-3">
            {openP0Count > 0 && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-xs font-bold flex items-center gap-2 animate-pulse">
                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                <span>CRITICAL BLOCKER: {openP0Count} Open P0 incident(s) detected. Scaled rollouts are locked. Immediate hotfix required.</span>
              </div>
            )}
            {openP1Count > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>WARNING: {openP1Count} Open P1 incident(s) unresolved. Resolve these prior to requesting pilot exit review.</span>
              </div>
            )}
            {avgReadiness < 80 && totalShopsCount > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 text-xs font-bold flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>CAUTION: Average shop readiness score is {avgReadiness}%, which is below the 80% minimum threshold.</span>
              </div>
            )}
            {totalPaymentFailures > 0 && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                <span>CRITICAL PAYMENT AUDIT: {totalPaymentFailures} payment failures recorded. Verify Razorpay hook logs.</span>
              </div>
            )}
            {dailyReports.length < 7 && selectedLaunchId && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-800 text-xs font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>7-DAY MONITORING: Currently {dailyReports.length}/7 daily reports logged. Complete 7 full days of tracking before district scaling.</span>
              </div>
            )}
            {!selectedLaunchId && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Please select or create a district launch above to begin monitoring.</span>
              </div>
            )}
          </div>

          {activeLaunch && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Summary Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 text-[9px] font-black tracking-wider uppercase rounded-full">
                      {activeLaunch.launch_status.toUpperCase()}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{activeLaunch.district_name}</h3>
                    <p className="text-xs text-slate-400 font-medium">{activeLaunch.state_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">LAUNCH CODE</span>
                    <span className="text-xs font-mono font-bold text-slate-700">{activeLaunch.launch_code}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Timeline Dates</span>
                    <span className="font-bold text-slate-700">
                      {activeLaunch.pilot_start_date || "Planning"} - {activeLaunch.pilot_end_date || "Planning"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Target Shops</span>
                    <span className="font-bold text-slate-700">{activeLaunch.target_pilot_shops} salons</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Target Partners</span>
                    <span className="font-bold text-slate-700">{activeLaunch.target_pilot_partners} agents</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Target Customers</span>
                    <span className="font-bold text-slate-700">{activeLaunch.target_pilot_customers} users</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">UPDATE STATE STATUS</span>
                  <div className="flex gap-2">
                    <select
                      value={activeLaunch.launch_status}
                      onChange={(e) => handleUpdateLaunchStatus(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-100 focus:border-blue-500 rounded-lg text-xs font-semibold text-slate-800 outline-none transition-all cursor-pointer w-full"
                    >
                      <option value="planning">Planning</option>
                      <option value="pilot_ready">Pilot Ready</option>
                      <option value="pilot_active">Pilot Active</option>
                      <option value="pilot_hold">Pilot Hold</option>
                      <option value="pilot_completed">Pilot Completed</option>
                      <option value="scale_ready">Scale Ready</option>
                      <option value="scale_active">Scale Active</option>
                      <option value="paused">Paused</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Metrics Grid */}
              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Areas count</span>
                  <h3 className="text-xl font-black text-slate-900">{areas.length}</h3>
                  <span className="text-[9px] text-emerald-600 font-bold">
                    {areas.filter(a => a.status === "ready").length} ready / {areas.filter(a => a.status === "active").length} active
                  </span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Shops tracked</span>
                  <h3 className="text-xl font-black text-slate-900">{totalShopsCount}</h3>
                  <span className="text-[9px] text-slate-500 font-medium">
                    {readyShopsCount} ready ({holdShopsCount} on hold)
                  </span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Avg Readiness</span>
                  <h3 className={`text-xl font-black ${avgReadiness >= 80 ? 'text-emerald-600' : 'text-amber-500'}`}>{avgReadiness}%</h3>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="bg-blue-600 h-full" style={{ width: `${avgReadiness}%` }}></div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Partners Assigned</span>
                  <h3 className="text-xl font-black text-slate-900">{assignments.length}</h3>
                  <span className="text-[9px] text-slate-400 font-medium">growth pilot leads</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Pilot Bookings</span>
                  <h3 className="text-xl font-black text-slate-900">
                    {dailyReports.reduce((acc, curr) => acc + (Number(curr.bookings_created) || 0), 0)}
                  </h3>
                  <span className="text-[9px] text-slate-400 font-medium">
                    {dailyReports.reduce((acc, curr) => acc + (Number(curr.bookings_completed) || 0), 0)} completed
                  </span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Captured Payments</span>
                  <h3 className="text-xl font-black text-emerald-600">₹{totalPaymentsCaptured}</h3>
                  <span className="text-[9px] text-rose-500 font-bold">
                    {totalPaymentFailures} failures
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 2: District Launches */}
      {subTab === "launches" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Launch Form */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4 h-fit">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Initialize District Pilot</h3>
              
              <form onSubmit={handleCreateLaunch} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">District Name</label>
                  <input
                    type="text"
                    value={newLaunch.district_name}
                    onChange={(e) => setNewLaunch({ ...newLaunch, district_name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800"
                    placeholder="e.g. Ajmer"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">State Name</label>
                  <input
                    type="text"
                    value={newLaunch.state_name}
                    onChange={(e) => setNewLaunch({ ...newLaunch, state_name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800"
                    placeholder="e.g. Rajasthan"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Shops Goal</label>
                    <input
                      type="number"
                      value={newLaunch.target_pilot_shops}
                      onChange={(e) => setNewLaunch({ ...newLaunch, target_pilot_shops: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Agents Goal</label>
                    <input
                      type="number"
                      value={newLaunch.target_pilot_partners}
                      onChange={(e) => setNewLaunch({ ...newLaunch, target_pilot_partners: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Users Goal</label>
                    <input
                      type="number"
                      value={newLaunch.target_pilot_customers}
                      onChange={(e) => setNewLaunch({ ...newLaunch, target_pilot_customers: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Initialize Pilot
                </button>
              </form>

              {/* Created Confirmation */}
              {launchCreationResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-900 text-xs font-medium space-y-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>District pilot created successfully.</span>
                  </div>
                  <div>
                    <span className="block font-semibold">District: {launchCreationResult.district_name}</span>
                    <span className="block font-semibold">Launch Code: {launchCreationResult.launch_code}</span>
                    <span className="block font-semibold">Status: Planning</span>
                  </div>
                </div>
              )}
            </div>

            {/* Launches Table */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">All Launched Districts</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold">
                      <th className="pb-3">District</th>
                      <th className="pb-3">Code</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Targets (S/P/C)</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {launches.map((l) => (
                      <tr key={l.id} className="text-slate-700">
                        <td className="py-3.5 font-bold">
                          {l.district_name}
                          <span className="block text-[10px] text-slate-400 font-medium">{l.state_name}</span>
                        </td>
                        <td className="py-3.5 font-mono text-[10px] font-bold">{l.launch_code}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            l.launch_status === "pilot_active" || l.launch_status === "scale_active"
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                              : l.launch_status === "planning"
                              ? "bg-blue-50 border-blue-100 text-blue-700"
                              : "bg-amber-50 border-amber-100 text-amber-700"
                          }`}>
                            {l.launch_status}
                          </span>
                        </td>
                        <td className="py-3.5 font-medium">
                          {l.target_pilot_shops} / {l.target_pilot_partners} / {l.target_pilot_customers}
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => setSelectedLaunchId(l.id)}
                            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-700 cursor-pointer"
                          >
                            Monitor
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Areas */}
      {subTab === "areas" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Area Form */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4 h-fit">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Define Launch Area</h3>
              <form onSubmit={handleAddArea} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Area Name</label>
                  <input
                    type="text"
                    value={newArea.area_name}
                    onChange={(e) => setNewArea({ ...newArea, area_name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800"
                    placeholder="e.g. Vaishali Nagar"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Display Order</label>
                  <input
                    type="number"
                    value={newArea.display_order}
                    onChange={(e) => setNewArea({ ...newArea, display_order: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Target Shops</label>
                  <input
                    type="number"
                    value={newArea.target_shops}
                    onChange={(e) => setNewArea({ ...newArea, target_shops: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Area
                </button>
              </form>

              {activeLaunch?.district_name.toLowerCase() === "ajmer" && areas.length === 0 && (
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">QUICK TEMPLATE</span>
                  <button
                    onClick={handleSuggestAjmerAreas}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-slate-900/10"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" /> Suggest 10 Ajmer Areas
                  </button>
                </div>
              )}
            </div>

            {/* Areas Table */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Defined Launch Areas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold">
                      <th className="pb-3">Order</th>
                      <th className="pb-3">Area Name</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Target Shops</th>
                      <th className="pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {areas.map((a) => (
                      <tr key={a.id} className="text-slate-700">
                        <td className="py-3.5 font-mono font-bold">{a.display_order}</td>
                        <td className="py-3.5 font-black">{a.area_name}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            a.status === "active" || a.status === "ready"
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                              : a.status === "hold"
                              ? "bg-rose-50 border-rose-100 text-rose-700 animate-pulse"
                              : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3.5 font-medium">{a.target_shops} shops</td>
                        <td className="py-3.5">
                          <select
                            value={a.status}
                            onChange={(e) => handleUpdateAreaStatus(a.id, e.target.value)}
                            className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-800 outline-none cursor-pointer"
                          >
                            <option value="planned">Planned</option>
                            <option value="survey_started">Survey Started</option>
                            <option value="shops_onboarding">Onboarding</option>
                            <option value="ready">Ready</option>
                            <option value="active">Active</option>
                            <option value="hold">Hold</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {areas.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">No areas added yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 4: Shop Readiness */}
      {subTab === "readiness" && (
        <div className="space-y-6">
          {/* Shop creation form & active tracker */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4 h-fit">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Register Salon for Readiness</h3>
              
              <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100/50 space-y-1">
                <p className="text-[10px] text-blue-800 font-semibold leading-relaxed">
                  Onboard target district salons under partner assignments. Tracking readiness ensures standardized pilot quality.
                </p>
              </div>

              <form onSubmit={handleAddShopReadiness} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Auto-fill from existing Shops</label>
                  <select
                    value={newReadiness.shop_id}
                    onChange={(e) => {
                      const shopId = e.target.value;
                      const s = shops.find(sh => sh.id === shopId);
                      if (s) {
                        setNewReadiness({
                          ...newReadiness,
                          shop_id: shopId,
                          shop_name: s.shop_name,
                          owner_name: s.owner_name,
                          owner_mobile: s.mobile_number,
                          category: s.category || "Hair Salon",
                          address: s.address || ""
                        });
                      } else {
                        setNewReadiness({ ...newReadiness, shop_id: "" });
                      }
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="">-- Manual Entry --</option>
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>{s.shop_name} ({s.owner_name})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Shop Name</label>
                  <input
                    type="text"
                    value={newReadiness.shop_name}
                    onChange={(e) => setNewReadiness({ ...newReadiness, shop_name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800"
                    placeholder="e.g. Royal Barber Salon"
                    required={!newReadiness.shop_id}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Owner Name</label>
                    <input
                      type="text"
                      value={newReadiness.owner_name}
                      onChange={(e) => setNewReadiness({ ...newReadiness, owner_name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800"
                      placeholder="John Doe"
                      required={!newReadiness.shop_id}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Owner Mobile</label>
                    <input
                      type="text"
                      value={newReadiness.owner_mobile}
                      onChange={(e) => setNewReadiness({ ...newReadiness, owner_mobile: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800"
                      placeholder="9876543210"
                      required={!newReadiness.shop_id}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Select Launch Area</label>
                  <select
                    value={newReadiness.area_id}
                    onChange={(e) => setNewReadiness({ ...newReadiness, area_id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800"
                    required
                  >
                    <option value="">-- Choose Area --</option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>{a.area_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Assign Partner Agent</label>
                  <select
                    value={newReadiness.partner_id}
                    onChange={(e) => setNewReadiness({ ...newReadiness, partner_id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="">-- Choose Partner --</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>{p.full_name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Onboard Salon
                </button>
              </form>
            </div>

            {/* List */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Salon Readiness Checklists</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold">
                      <th className="pb-3">Shop / Owner</th>
                      <th className="pb-3">Area</th>
                      <th className="pb-3">Readiness</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {readinessRecords.map((r) => {
                      const isBlocker = r.no_owner_qr_confirmed === false;
                      return (
                        <tr key={r.id} className="text-slate-700">
                          <td className="py-3.5">
                            <span className="font-bold text-slate-900 block">{r.shop_name}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{r.owner_name} ({r.owner_mobile})</span>
                          </td>
                          <td className="py-3.5 font-semibold text-slate-500">{r.area_name}</td>
                          <td className="py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-900">{r.readiness_percent}%</span>
                              <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full" style={{ width: `${r.readiness_percent}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5">
                            <div className="flex flex-col gap-1 items-start">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                r.status === "ready" || r.status === "active"
                                  ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                  : "bg-slate-50 border-slate-100 text-slate-600"
                              }`}>
                                {r.status}
                              </span>
                              {isBlocker && (
                                <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[8px] font-black rounded uppercase tracking-wider">
                                  BLOCKER (Owner QR)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => setEditingReadiness(r)}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer"
                            >
                              Verify
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {readinessRecords.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">No salons tracked yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Edit Drawer Modal */}
          {editingReadiness && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Readiness Check: {editingReadiness.shop_name}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">Verify essential metrics before marking shop ready.</p>
                  </div>
                  <button onClick={() => setEditingReadiness(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Onboarding Status</label>
                    <select
                      value={editingReadiness.status}
                      onChange={(e) => setEditingReadiness({ ...editingReadiness, status: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
                    >
                      <option value="lead">Lead</option>
                      <option value="contacted">Contacted</option>
                      <option value="interested">Interested</option>
                      <option value="onboarding">Onboarding</option>
                      <option value="ready">Ready (if all critical fields pass)</option>
                      <option value="active">Active</option>
                      <option value="needs_training">Needs Training</option>
                      <option value="technical_issue">Technical Issue</option>
                      <option value="hold">Hold</option>
                      <option value="removed">Removed</option>
                    </select>
                  </div>

                  <div className="space-y-2 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-2">Technical Checklist (10% per item)</span>
                    
                    {[
                      { key: "owner_login_ok", label: "Owner login verified ok (Critical)" },
                      { key: "shop_profile_complete", label: "Shop Profile and descriptions done (Critical)" },
                      { key: "services_prices_complete", label: "All services & prices loaded (Critical)" },
                      { key: "photos_gallery_complete", label: "Gallery photos uploaded" },
                      { key: "booking_test_passed", label: "Booking end-to-end test passed (Critical)" },
                      { key: "owner_booking_visible", label: "Owner is getting live booking alerts (Critical)" },
                      { key: "wallet_visible", label: "Wallet & billing screen accessible" },
                      { key: "website_template_ok", label: "Nexora custom PWA template verified" },
                      { key: "no_owner_qr_confirmed", label: "Verified: NO personal Owner QR is displayed (Critical)" },
                      { key: "support_education_done", label: "Education & support protocols completed (Critical)" }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingReadiness[item.key] || false}
                          onChange={(e) => setEditingReadiness({ ...editingReadiness, [item.key]: e.target.checked })}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Admin/Verification Note</label>
                    <textarea
                      value={editingReadiness.admin_note || ""}
                      onChange={(e) => setEditingReadiness({ ...editingReadiness, admin_note: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-800"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Technical Issue Note (If any)</label>
                    <textarea
                      value={editingReadiness.technical_issue || ""}
                      onChange={(e) => setEditingReadiness({ ...editingReadiness, technical_issue: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-800"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateReadinessChecklist(editingReadiness)}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                    >
                      Save Verification
                    </button>
                    <button
                      onClick={() => setEditingReadiness(null)}
                      className="px-4 py-3 bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 5: Partner Assignments */}
      {subTab === "assignments" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4 h-fit">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Assign Partner to Pilot</h3>
              <form onSubmit={handleAssignPartner} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Select Growth Partner</label>
                  <select
                    value={newAssignment.partner_id}
                    onChange={(e) => setNewAssignment({ ...newAssignment, partner_id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800"
                    required
                  >
                    <option value="">-- Choose Partner --</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>{p.full_name} ({p.partner_code})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 block">Select Assigned Areas</label>
                  <div className="space-y-1 max-h-32 overflow-y-auto p-2 border border-slate-100 bg-slate-50 rounded-xl">
                    {areas.map((a) => {
                      const isChecked = newAssignment.assigned_areas.includes(a.area_name);
                      return (
                        <label key={a.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewAssignment({
                                  ...newAssignment,
                                  assigned_areas: [...newAssignment.assigned_areas, a.area_name]
                                });
                              } else {
                                setNewAssignment({
                                  ...newAssignment,
                                  assigned_areas: newAssignment.assigned_areas.filter(name => name !== a.area_name)
                                });
                              }
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                          />
                          {a.area_name}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Leads Target</label>
                    <input
                      type="number"
                      value={newAssignment.target_leads}
                      onChange={(e) => setNewAssignment({ ...newAssignment, target_leads: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Ready Shops Target</label>
                    <input
                      type="number"
                      value={newAssignment.target_ready_shops}
                      onChange={(e) => setNewAssignment({ ...newAssignment, target_ready_shops: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Notes / Instructions</label>
                  <textarea
                    value={newAssignment.notes}
                    onChange={(e) => setNewAssignment({ ...newAssignment, notes: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-800"
                    rows={2}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Create Assignment
                </button>
              </form>
            </div>

            {/* List */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Active Partner Assignments</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold">
                      <th className="pb-3">Partner</th>
                      <th className="pb-3">Assigned Areas</th>
                      <th className="pb-3">Leads Goal</th>
                      <th className="pb-3">Shops Goal</th>
                      <th className="pb-3">Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assignments.map((asg) => {
                      const partObj = partners.find(p => p.id === asg.partner_id);
                      return (
                        <tr key={asg.id} className="text-slate-700">
                          <td className="py-3.5">
                            <span className="font-bold text-slate-900 block">{partObj?.full_name || "Agent"}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{partObj?.partner_code || "N/A"}</span>
                          </td>
                          <td className="py-3.5 text-slate-500 font-semibold">
                            {asg.assigned_area_names?.join(", ") || "All Areas"}
                          </td>
                          <td className="py-3.5 font-bold text-slate-900">{asg.target_leads} leads</td>
                          <td className="py-3.5 font-bold text-slate-900">{asg.target_ready_shops} ready</td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              asg.is_active ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-slate-50 border-slate-100 text-slate-600"
                            }`}>
                              {asg.is_active ? "active" : "inactive"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {assignments.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">No partners assigned to this district.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 6: Daily Reports */}
      {subTab === "reports" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4 h-fit">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-bold">Log Daily Pilot Metrics</h3>
              <form onSubmit={handleAddDailyReport} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Report Day (1-7)</label>
                    <input
                      type="number"
                      min={1}
                      max={7}
                      value={newReport.report_day}
                      onChange={(e) => setNewReport({ ...newReport, report_day: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-800"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Date</label>
                    <input
                      type="date"
                      value={newReport.report_date}
                      onChange={(e) => setNewReport({ ...newReport, report_date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-800"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Daily Status</label>
                  <select
                    value={newReport.status}
                    onChange={(e) => setNewReport({ ...newReport, status: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    <option value="go">GO - Operations Normal</option>
                    <option value="hold">HOLD - Minor Issues</option>
                    <option value="critical_hold">CRITICAL HOLD - Operations Halted</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Active Areas</label>
                    <input
                      type="number"
                      value={newReport.active_areas}
                      onChange={(e) => setNewReport({ ...newReport, active_areas: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Ready Shops</label>
                    <input
                      type="number"
                      value={newReport.ready_shops}
                      onChange={(e) => setNewReport({ ...newReport, ready_shops: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-100 py-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Bookings</label>
                    <input
                      type="number"
                      value={newReport.bookings_created}
                      onChange={(e) => setNewReport({ ...newReport, bookings_created: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Completed</label>
                    <input
                      type="number"
                      value={newReport.bookings_completed}
                      onChange={(e) => setNewReport({ ...newReport, bookings_completed: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Captured</label>
                    <input
                      type="number"
                      value={newReport.payments_captured}
                      onChange={(e) => setNewReport({ ...newReport, payments_captured: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Payment Failures</label>
                    <input
                      type="number"
                      value={newReport.payment_failures}
                      onChange={(e) => setNewReport({ ...newReport, payment_failures: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">P0 / P1 issues</label>
                    <input
                      type="number"
                      value={newReport.p0_issues}
                      onChange={(e) => setNewReport({ ...newReport, p0_issues: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs text-rose-600 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Owner Feedback Summary</label>
                  <input
                    type="text"
                    value={newReport.owner_feedback}
                    onChange={(e) => setNewReport({ ...newReport, owner_feedback: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs"
                    placeholder='Describe owner experience or "not available"'
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Save Daily Report
                </button>
              </form>
            </div>

            {/* List */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">7-Day Pilot Tracker Timeline</h3>
              <div className="grid grid-cols-7 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                  const rep = dailyReports.find(r => r.report_day === day);
                  return (
                    <div
                      key={day}
                      className={`p-3.5 rounded-2xl border text-center space-y-2 ${
                        rep
                          ? rep.status === "go"
                            ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                            : rep.status === "critical_hold"
                            ? "bg-rose-50 border-rose-100 text-rose-800 animate-pulse"
                            : "bg-amber-50 border-amber-100 text-amber-800"
                          : "bg-slate-50 border-slate-100 text-slate-400"
                      }`}
                    >
                      <span className="text-[10px] font-black block">DAY {day}</span>
                      {rep ? (
                        <>
                          <CheckCircle className="w-4 h-4 mx-auto text-emerald-600" />
                          <span className="text-[9px] font-black uppercase block">{rep.status}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 mx-auto text-slate-300" />
                          <span className="text-[8px] font-bold uppercase block">pending</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="overflow-x-auto border-t border-slate-100 pt-4">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold">
                      <th className="pb-3">Day</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Bookings</th>
                      <th className="pb-3">Payments</th>
                      <th className="pb-3">Incidents</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dailyReports.map((r) => (
                      <tr key={r.id} className="text-slate-700">
                        <td className="py-3 font-bold text-slate-950">Day {r.report_day}</td>
                        <td className="py-3 font-medium">{r.report_date}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                            r.status === "go" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-amber-50 border-amber-100 text-amber-700"
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 font-medium">{r.bookings_created} ({r.bookings_completed} done)</td>
                        <td className="py-3 font-medium text-emerald-600">₹{r.payments_captured}</td>
                        <td className="py-3 font-bold text-rose-600">{r.p0_issues} P0 / {r.p1_issues} P1</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 7: Incidents */}
      {subTab === "incidents" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4 h-fit">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Register Pilot Incident</h3>
              <form onSubmit={handleAddIncident} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Incident Severity</label>
                  <select
                    value={newIncident.severity}
                    onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer text-rose-600 font-bold"
                  >
                    <option value="p0">P0 - Block Scaling (Critical Security/RLS/Fake Payment)</option>
                    <option value="p1">P1 - Highly Severe (Module Down/Failure)</option>
                    <option value="p2">P2 - Moderate (Functional bugs)</option>
                    <option value="p3">P3 - Low (UI polish/Typo)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Status</label>
                  <select
                    value={newIncident.status}
                    onChange={(e) => setNewIncident({ ...newIncident, status: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Module / Feature affected</label>
                  <input
                    type="text"
                    value={newIncident.module_name}
                    onChange={(e) => setNewIncident({ ...newIncident, module_name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold"
                    placeholder="e.g. Wallet, Razorpay hook, Auth"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Incident Title</label>
                  <input
                    type="text"
                    value={newIncident.title}
                    onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold"
                    placeholder="e.g. Owner QR visible on template page"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Detailed Description</label>
                  <textarea
                    value={newIncident.description}
                    onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-800"
                    rows={3}
                    placeholder="Explain trigger, behavior, and impact."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Log Incident
                </button>
              </form>
            </div>

            {/* List */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Unresolved & Resolved Incidents</h3>
              
              <div className="space-y-4">
                {incidents.map((inc) => {
                  const isP0 = inc.severity === "p0";
                  return (
                    <div
                      key={inc.id}
                      className={`p-5 rounded-3xl border transition-all ${
                        isP0 && inc.status !== "closed"
                          ? "bg-rose-50 border-rose-100 text-rose-900"
                          : "bg-slate-50 border-slate-100 text-slate-800"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${
                              isP0 ? "bg-rose-600 text-white border-rose-700" : "bg-amber-100 text-amber-800 border-amber-200"
                            }`}>
                              {inc.severity}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">{inc.module_name}</span>
                          </div>
                          <h4 className="font-bold text-sm tracking-tight text-slate-900">{inc.title}</h4>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">{inc.description}</p>
                        </div>

                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border block mb-2 ${
                            inc.status === "open"
                              ? "bg-rose-100 text-rose-800 border-rose-200 animate-pulse"
                              : inc.status === "fixed"
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : "bg-emerald-100 text-emerald-800 border-emerald-200"
                          }`}>
                            {inc.status}
                          </span>
                        </div>
                      </div>

                      {inc.fix_summary && (
                        <div className="mt-3 p-3 bg-white/70 border border-slate-100/50 rounded-2xl text-[11px] font-semibold">
                          <span className="text-slate-400 block text-[9px] font-black uppercase tracking-wider mb-0.5">Hotfix Summary</span>
                          {inc.fix_summary}
                        </div>
                      )}

                      <div className="mt-4 flex gap-2 justify-end">
                        {inc.status === "open" && (
                          <button
                            onClick={() => {
                              const fix = prompt("Provide hotfix summary:");
                              if (fix) handleUpdateIncidentStatus(inc.id, "fixed", fix);
                            }}
                            className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase cursor-pointer"
                          >
                            Mark Fixed
                          </button>
                        )}
                        {inc.status === "fixed" && (
                          <button
                            onClick={() => handleUpdateIncidentStatus(inc.id, "closed")}
                            className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase cursor-pointer"
                          >
                            Verify & Close
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {incidents.length === 0 && (
                  <p className="py-8 text-center text-slate-400 font-medium">No incidents reported on this pilot district launch.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 8: Exit Review */}
      {subTab === "review" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Evaluation Sliders */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Evaluation Scorecard</h3>
              <p className="text-xs text-slate-400 font-medium">Adjust metrics based on actual pilot tracking observations.</p>

              <div className="space-y-4 border-t border-slate-100 pt-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Payment & Wallet (Max 20)</span>
                    <span>{reviewScores.payment_reliability}/20</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={reviewScores.payment_reliability}
                    onChange={(e) => setReviewScores({ ...reviewScores, payment_reliability: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Security & RLS (Max 20)</span>
                    <span>{reviewScores.security_rls}/20</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={reviewScores.security_rls}
                    onChange={(e) => setReviewScores({ ...reviewScores, security_rls: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Booking System (Max 15)</span>
                    <span>{reviewScores.booking_reliability}/15</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={15}
                    value={reviewScores.booking_reliability}
                    onChange={(e) => setReviewScores({ ...reviewScores, booking_reliability: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Salon Onboarding (Max 10)</span>
                    <span>{reviewScores.shop_owner_readiness}/10</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={reviewScores.shop_owner_readiness}
                    onChange={(e) => setReviewScores({ ...reviewScores, shop_owner_readiness: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Customer UX & Interface (Max 10)</span>
                    <span>{reviewScores.customer_ux}/10</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={reviewScores.customer_ux}
                    onChange={(e) => setReviewScores({ ...reviewScores, customer_ux: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Support Desk (Max 10)</span>
                    <span>{reviewScores.support_ops}/10</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={reviewScores.support_ops}
                    onChange={(e) => setReviewScores({ ...reviewScores, support_ops: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Right Summary Result */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Evaluation Result</h3>
                
                {hasAutoFailBlocker && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-xs font-bold flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>AUTOMATIC PILOT FAIL: Active P0 incident, visible Owner QR, or payment leak detected. Rollout scaling blocked.</span>
                  </div>
                )}

                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">FINAL SCORE</span>
                    <h2 className={`text-4xl font-black ${hasAutoFailBlocker ? 'text-rose-600' : 'text-blue-600'}`}>
                      {hasAutoFailBlocker ? 0 : totalExitScore}/100
                    </h2>
                  </div>

                  <div className="space-y-1 flex-1">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">LAUNCH RECOMMENDATION</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border inline-block ${
                      scaleRecommendation === "scale_ready"
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : scaleRecommendation === "extend_pilot"
                        ? "bg-blue-50 border-blue-100 text-blue-700"
                        : "bg-rose-50 border-rose-100 text-rose-700 animate-pulse"
                    }`}>
                      {scaleRecommendation.replace(/_/g, " ")}
                    </span>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      {scaleRecommendation === "scale_ready"
                        ? "Ecosystem is stable. Ready to trigger scaled production rollout in Ajmer."
                        : scaleRecommendation === "extend_pilot"
                        ? "Extend pilot by 7 days. Address minor functional/support gaps."
                        : "Blocked. Immediately execute rollbacks, secure DB state, or solve blocker incidents."}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-2">Requirement Checklist</span>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">7 Daily Reports logged</span>
                      <span className="font-bold">{dailyReports.length >= 7 ? "PASSED" : `${dailyReports.length}/7 logged`}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">No open P0 Incidents</span>
                      <span className="font-bold">{openP0Count === 0 ? "PASSED" : `${openP0Count} Open P0`}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">No personal Owner QRs visible</span>
                      <span className="font-bold">{!hasOwnerQRVisible ? "PASSED" : "FAILED (Blocker)"}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Average shop readiness &gt;= 80%</span>
                      <span className="font-bold">{avgReadiness >= 80 ? "PASSED" : "FAILED"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirm decision */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">MANUALLY CONFIRM DECISION</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={activeLaunch?.launch_status}
                    onChange={(e) => handleUpdateLaunchStatus(e.target.value)}
                    className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer flex-1"
                  >
                    <option value="planning">Keep Planning</option>
                    <option value="pilot_hold">Place Pilot on Hold</option>
                    <option value="pilot_completed">Complete Pilot</option>
                    <option value="scale_ready" disabled={hasAutoFailBlocker}>Approve Scale Ready</option>
                    <option value="scale_active" disabled={hasAutoFailBlocker}>Launch District Active (Scale)</option>
                    <option value="closed">Close/Terminate Pilot</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
