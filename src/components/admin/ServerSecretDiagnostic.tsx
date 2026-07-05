import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { CheckCircle, AlertTriangle, RefreshCw, ShieldCheck } from "lucide-react";

interface DiagnosticData {
  RAZORPAY_KEY_ID: boolean;
  RAZORPAY_KEY_SECRET: boolean;
  RAZORPAY_WEBHOOK_SECRET: boolean;
  VITE_SUPABASE_URL: boolean;
  SUPABASE_SERVICE_ROLE_KEY: boolean;
}

export default function ServerSecretDiagnostic() {
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostic = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        throw new Error("No active session found. Please log in again.");
      }

      const res = await fetch("/api/admin/diagnose-secrets", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(`Diagnostic failed with status code ${res.status}`);
      }

      const data: DiagnosticData = await res.json();
      setDiagnosticData(data);
    } catch (err: any) {
      console.error("Error executing server secrets diagnostic:", err);
      setError(err.message || "Failed to complete diagnostics check.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  return (
    <div id="server-secret-diagnostic" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h4 className="text-sm font-black uppercase text-slate-800 tracking-wider">
              Server Secrets & Credentials Diagnostics
            </h4>
          </div>
          <p className="text-xs text-slate-500 font-light mt-1">
            Verifies presence of critical server-side secrets for Razorpay payments and Supabase services. No sensitive values are exposed.
          </p>
        </div>
        <button
          id="btn-run-diagnostic"
          onClick={runDiagnostic}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Run Health Check
        </button>
      </div>

      {error && (
        <div id="diagnostic-error" className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-xs font-medium flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !diagnosticData && (
        <div id="diagnostic-loading" className="py-8 flex flex-col items-center justify-center gap-2.5 text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="font-medium">Querying server environment...</span>
        </div>
      )}

      {diagnosticData && (
        <div id="diagnostic-report" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              key: "RAZORPAY_KEY_ID",
              label: "Razorpay Key ID",
              desc: "Used by checkout clients to initiate payment flows.",
              type: "Payment Gateways",
            },
            {
              key: "RAZORPAY_KEY_SECRET",
              label: "Razorpay Secret",
              desc: "Secure backend key for signatures & refunds.",
              type: "Payment Gateways",
            },
            {
              key: "RAZORPAY_WEBHOOK_SECRET",
              label: "Webhook Secret",
              desc: "Authenticates incoming payment.captured events.",
              type: "Webhooks",
            },
            {
              key: "VITE_SUPABASE_URL",
              label: "Supabase URL",
              desc: "Endpoint used to communicate with the database.",
              type: "Infrastructure",
            },
            {
              key: "SUPABASE_SERVICE_ROLE_KEY",
              label: "Service Role Key",
              desc: "Full schema bypass token for admin tasks.",
              type: "Infrastructure",
            },
          ].map((item) => {
            const isConfigured = diagnosticData[item.key as keyof DiagnosticData];
            return (
              <div
                key={item.key}
                id={`diagnostic-card-${item.key}`}
                className={`p-4 rounded-2.5xl border flex flex-col justify-between gap-4 transition-all duration-200 ${
                  isConfigured
                    ? "bg-emerald-50/20 border-emerald-100/60 hover:border-emerald-200"
                    : "bg-rose-50/20 border-rose-100/60 hover:border-rose-200"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {isConfigured ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-500" />
                    )}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-xs font-bold text-slate-800 block truncate leading-tight">
                      {item.label}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono truncate">
                      {item.key}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 font-light leading-snug">
                    {item.desc}
                  </p>
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/50">
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 font-medium">
                      {item.type}
                    </span>
                    <span
                      className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-full ${
                        isConfigured
                          ? "bg-emerald-100/80 text-emerald-800"
                          : "bg-rose-100/80 text-rose-800"
                      }`}
                    >
                      {isConfigured ? "ACTIVE" : "MISSING"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
