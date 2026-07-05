import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

type FinanceTabKey =
  | "overview"
  | "razorpay_orders"
  | "razorpay_payments"
  | "owner_wallets"
  | "daily_settlements"
  | "customer_rewards"
  | "reward_redemptions"
  | "referral_rewards"
  | "membership_discounts"
  | "audit_logs"
  | "refund_disputes"
  | "finance_exports";

type LoadState = "idle" | "loading" | "success" | "error";
type FinanceSummary = Record<string, any>;

const financeTabs: { key: FinanceTabKey; label: string; description: string }[] = [
  { key: "overview", label: "Overview", description: "Complete finance summary and key platform numbers." },
  { key: "razorpay_orders", label: "Razorpay Orders", description: "All Razorpay order records with booking/payment status." },
  { key: "razorpay_payments", label: "Razorpay Payments", description: "Captured payments, Nexora commission and owner earnings." },
  { key: "owner_wallets", label: "Owner Wallets", description: "Owner wallet balances, pending earnings and paid-out totals." },
  { key: "daily_settlements", label: "Daily Settlements", description: "Daily 10:00 PM owner payout settlement records." },
  { key: "customer_rewards", label: "Customer Rewards", description: "Customer reward wallets and platform reward liability." },
  { key: "reward_redemptions", label: "Reward Redemptions", description: "Reward balance used by customers against bookings." },
  { key: "referral_rewards", label: "Referral Rewards", description: "Referral events, qualification and reward status." },
  { key: "membership_discounts", label: "Membership Discounts", description: "Silver, Gold, Platinum plans and discount usage." },
  { key: "refund_disputes", label: "Refunds & Disputes", description: "Refund requests and dispute management." },
  { key: "finance_exports", label: "Finance Exports", description: "Manage and download finance CSV exports." },
  { key: "audit_logs", label: "Audit Logs", description: "Append-only finance audit activity." },
];

const tableMap: Record<Exclude<FinanceTabKey, "overview" | "finance_exports">, string> = {
  razorpay_orders: "razorpay_orders",
  razorpay_payments: "razorpay_payments",
  owner_wallets: "owner_wallets",
  daily_settlements: "owner_daily_settlements",
  customer_rewards: "customer_reward_wallets",
  reward_redemptions: "customer_reward_redemptions",
  referral_rewards: "customer_referral_events",
  membership_discounts: "customer_membership_usage",
  refund_disputes: "payment_refund_requests",
  audit_logs: "finance_audit_logs",
};

const tableColumns: Record<FinanceTabKey, string[]> = {
  overview: [],
  razorpay_orders: [
    "created_at",
    "razorpay_order_id",
    "booking_id",
    "shop_id",
    "customer_id",
    "amount",
    "status",
    "reward_redeemed_amount",
    "membership_discount_amount",
    "final_payable_amount",
  ],
  razorpay_payments: [
    "created_at",
    "razorpay_payment_id",
    "booking_id",
    "shop_id",
    "customer_id",
    "gross_amount",
    "nexora_commission_amount",
    "owner_earning_amount",
    "method",
    "status",
  ],
  owner_wallets: [
    "shop_id",
    "owner_id",
    "total_earned",
    "pending_balance",
    "available_balance",
    "total_paid_out",
    "refund_debt_balance",
    "platform_commission_rate",
    "owner_share_rate",
    "is_active",
  ],
  daily_settlements: [
    "settlement_date",
    "shop_id",
    "owner_id",
    "payout_amount",
    "status",
    "destination_type",
    "razorpay_payout_id",
    "razorpay_utr",
    "failure_reason",
    "processed_at",
  ],
  customer_rewards: [
    "customer_id",
    "available_balance",
    "total_earned",
    "total_redeemed",
    "available_points",
    "lifetime_points",
    "is_active",
    "updated_at",
  ],
  reward_redemptions: [
    "created_at",
    "customer_id",
    "shop_id",
    "booking_id",
    "redemption_amount",
    "status",
    "applied_at",
    "reversed_at",
  ],
  referral_rewards: [
    "created_at",
    "referrer_customer_id",
    "referred_customer_id",
    "referral_code",
    "minimum_payment_amount",
    "referrer_reward_amount",
    "status",
    "rewarded_at",
  ],
  membership_discounts: [
    "created_at",
    "customer_id",
    "shop_id",
    "booking_id",
    "gross_amount",
    "discount_percent",
    "discount_amount",
    "final_amount",
  ],
  refund_disputes: [
    "created_at",
    "booking_id",
    "reason",
    "requested_amount",
    "approved_amount",
    "status",
    "customer_note",
    "actions",
  ],
  finance_exports: [],
  audit_logs: [
    "created_at",
    "event_type",
    "amount",
    "shop_id",
    "owner_id",
    "customer_id",
    "booking_id",
    "related_table",
    "note",
  ],
};

import { DataTable, StatusBadge, formatMoney, formatValue } from "./FinanceDataTable";
import { FinanceExportsTab } from "./FinanceExportsTab";
import { RefundsDisputesPanel } from "./RefundsDisputesPanel";

function KpiCard({ label, value, helper }: { label: string; value: React.ReactNode; helper?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-2 text-2xl font-bold text-slate-950">{value}</div>
      {helper ? <p className="mt-2 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

function OverviewPanel({ summary }: { summary: FinanceSummary | null }) {
  const payments = summary?.payments || {};
  const ownerWallets = summary?.owner_wallets || {};
  const settlements = summary?.settlements || {};
  const rewards = summary?.rewards || {};
  const redemptions = summary?.redemptions || {};
  const membership = summary?.membership || {};
  const referrals = summary?.referrals || {};

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Gross Collection" value={formatMoney(payments.gross_collection)} helper="Captured Razorpay payments" />
        <KpiCard label="Nexora Commission" value={formatMoney(payments.nexora_commission)} helper="10% platform commission" />
        <KpiCard label="Owner Earnings" value={formatMoney(payments.owner_earning)} helper="90% owner earning" />
        <KpiCard label="Captured Payments" value={payments.captured_payment_count || 0} helper="Successful payment count" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Failed Payments" value={payments.failed_payment_count || 0} helper="Needs review" />
        <KpiCard label="Pending Owner Balance" value={formatMoney(ownerWallets.total_pending_balance)} helper="Owner wallet pending payout" />
        <KpiCard label="Total Paid Out" value={formatMoney(ownerWallets.total_paid_out)} helper="Owner payouts completed" />
        <KpiCard label="Eligible Settlement" value={formatMoney(settlements.eligible_amount)} helper="Ready for payout check" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Reward Liability" value={formatMoney(rewards.reward_liability_available)} helper="Available customer rewards" />
        <KpiCard label="Reward Redeemed" value={formatMoney(redemptions.applied_redemption_amount)} helper="Rewards used in bookings" />
        <KpiCard label="Membership Discount" value={formatMoney(membership.membership_discount_amount)} helper="Discount given to members" />
        <KpiCard label="Referral Rewards" value={formatMoney(referrals.referrer_reward_amount)} helper="Rewarded referral amount" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-950">Finance Rules</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Payment Source</p>
            <p className="mt-1 text-sm text-slate-600">Razorpay captured payment only.</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Split</p>
            <p className="mt-1 text-sm text-slate-600">10% Nexora commission, 90% owner earning.</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Payout</p>
            <p className="mt-1 text-sm text-slate-600">Daily owner payout foundation at 10:00 PM.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FinanceControlCenter() {
  const [activeTab, setActiveTab] = useState<FinanceTabKey>("overview");
  const [dataState, setDataState] = useState<LoadState>("idle");
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [processingRefunds, setProcessingRefunds] = useState<Record<string, boolean>>({});

  const handleProcessRefund = async (refundId: string) => {
      setProcessingRefunds(prev => ({ ...prev, [refundId]: true }));
      try {
          const { data: { session } } = await supabase.auth.getSession();
          const response = await fetch('/api/razorpay/process-refund', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session?.access_token}`
              },
              body: JSON.stringify({ refund_request_id: refundId })
          });
          if (!response.ok) throw new Error('Failed to process refund');
          window.location.reload(); 
      } catch (err) {
          alert('Failed to process refund');
      } finally {
          setProcessingRefunds(prev => ({ ...prev, [refundId]: false }));
      }
  };

  const activeTabInfo = useMemo(
    () => financeTabs.find((tab) => tab.key === activeTab) || financeTabs[0],
    [activeTab],
  );

  useEffect(() => {
    let mounted = true;

    async function loadTabData() {
      setDataState("loading");
      setMessage("");

      if (activeTab === "overview") {
        const { data, error } = await supabase.rpc("admin_get_finance_summary", {
          p_start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          p_end_date: new Date().toISOString().slice(0, 10),
        });

        if (!mounted) return;

        if (error) {
          setDataState("error");
          setMessage(error.message);
          return;
        }

        setSummary((data || {}) as FinanceSummary);
        setRows([]);
        setDataState("success");
        return;
      }

      if (activeTab === "finance_exports") {
        setDataState("success");
        return;
      }

      const tableName = tableMap[activeTab as Exclude<FinanceTabKey, "overview" | "finance_exports">];
      const orderColumn =
        activeTab === "daily_settlements"
          ? "created_at"
          : activeTab === "owner_wallets"
            ? "updated_at"
            : "created_at";

      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .order(orderColumn, { ascending: false })
        .limit(50);

      if (!mounted) return;

      if (error) {
        setRows([]);
        setDataState("error");
        setMessage(error.message);
        return;
      }

      setRows((data || []) as Record<string, any>[]);
      setDataState("success");
    }

    loadTabData();

    return () => {
      mounted = false;
    };
  }, [activeTab]);

  const columns = tableColumns[activeTab];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                Finance Control Center
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Monitor Razorpay payments, owner wallets, daily settlements, rewards,
                referrals, membership discounts and append-only finance audit logs.
            </p>
        </div>

        <div className="mb-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex min-w-max gap-2">
            {financeTabs.map((tab) => {
              const active = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-950">{activeTabInfo.label}</h2>
            <p className="mt-1 text-sm text-slate-600">{activeTabInfo.description}</p>
        </div>

        {dataState === "error" ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {message}
          </div>
        ) : null}

        {activeTab === "overview" ? (
          <OverviewPanel summary={summary} />
        ) : activeTab === "finance_exports" ? (
          <FinanceExportsTab />
        ) : activeTab === "refund_disputes" ? (
          <RefundsDisputesPanel />
        ) : (
          <DataTable 
            rows={rows} 
            columns={columns} 
            emptyText={`No records found for ${activeTabInfo.label}.`}
          />
        )}
      </div>
    </div>
  );
}
