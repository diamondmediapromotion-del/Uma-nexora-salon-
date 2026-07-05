import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader2, AlertTriangle } from 'lucide-react';

export const FinanceOverviewTab = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFinanceSummary();
    }, []);

    const fetchFinanceSummary = async () => {
        setLoading(true);
        try {
            // Using a default range or custom range. Let's start with all-time or last 30 days.
            const { data: summary, error } = await supabase.rpc('admin_get_finance_summary', {
                start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
                end_date: new Date().toISOString()
            });

            if (error) throw error;
            setData(summary);
        } catch (err) {
            console.error("Error fetching finance summary:", err);
            setError("Failed to load finance summary.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin w-6 h-6 mx-auto" /></div>;
    if (error) return <div className="p-10 text-center text-rose-500 font-bold"><AlertTriangle className="w-6 h-6 mx-auto mb-2" />{error}</div>;
    if (!data) return <div className="p-10 text-center text-slate-500">No data available.</div>;

    const kpiCards = [
        { label: "Gross Collection", value: data.gross_collection },
        { label: "Nexora Commission", value: data.nexora_commission },
        { label: "Owner Earnings", value: data.owner_earnings },
        { label: "Pending Owner Balance", value: data.pending_owner_balance },
        { label: "Paid Out Amount", value: data.paid_out_amount },
        { label: "Reward Liability", value: data.reward_liability },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-black text-slate-900">Finance Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((card, i) => (
                    <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{card.label}</span>
                        <h3 className="text-xl font-black text-slate-900 mt-1">₹{card.value?.toLocaleString() || 0}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};
