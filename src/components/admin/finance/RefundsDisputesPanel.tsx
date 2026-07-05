import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { DataTable } from './FinanceDataTable';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const RefundsDisputesPanel = () => {
    const [loading, setLoading] = useState(false);
    const [refundRequests, setRefundRequests] = useState<any[]>([]);
    const [refundTransactions, setRefundTransactions] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [{ data: requests }, { data: transactions }] = await Promise.all([
            supabase.from('payment_refund_requests').select('*').order('created_at', { ascending: false }),
            supabase.from('payment_refunds').select('*').order('created_at', { ascending: false })
        ]);
        setRefundRequests(requests || []);
        setRefundTransactions(transactions || []);
        setLoading(false);
    };

    const handleApprove = async (id: string, amount: number, note: string) => {
        await supabase.rpc('admin_approve_refund_request', { p_refund_request_id: id, p_approved_amount: amount, p_admin_note: note });
        await fetchData();
    };

    const handleReject = async (id: string, reason: string) => {
        await supabase.rpc('admin_reject_refund_request', { p_refund_request_id: id, p_rejection_reason: reason });
        await fetchData();
    };

    const [processingRefunds, setProcessingRefunds] = useState<Record<string, boolean>>({});

    const handleProcessRazorpay = async (id: string) => {
        setProcessingRefunds(prev => ({ ...prev, [id]: true }));
        try {
            const { data, error } = await supabase.functions.invoke('process-razorpay-refund', {
                body: { refund_request_id: id }
            });
            if (error) throw error;
            await fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to process refund');
        } finally {
            setProcessingRefunds(prev => ({ ...prev, [id]: false }));
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Refund Requests</h3>
                <DataTable 
                    id="refund-requests-table"
                    rows={refundRequests}
                    columns={['created_at', 'booking_id', 'reason', 'requested_amount', 'status', 'actions']}
                    emptyText="No refund requests"
                    renderCell={(row, col) => {
                        if (col === 'actions') {
                            return (
                                <div className="flex gap-2">
                                    {row.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleApprove(row.id, row.requested_amount, 'Auto approved')} className="text-emerald-600 font-bold text-xs">Approve</button>
                                            <button onClick={() => handleReject(row.id, 'Auto rejected')} className="text-rose-600 font-bold text-xs">Reject</button>
                                        </>
                                    )}
                                    {row.status === 'approved' && (
                                        <button 
                                            disabled={processingRefunds[row.id]}
                                            onClick={() => handleProcessRazorpay(row.id)} 
                                            className="text-blue-600 font-bold text-xs disabled:opacity-50"
                                        >
                                            {processingRefunds[row.id] ? 'Processing...' : 'Process'}
                                        </button>
                                    )}
                                </div>
                            );
                        }
                        return undefined;
                    }}
                />
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Refund Transactions</h3>
                <DataTable 
                    rows={refundTransactions}
                    columns={['created_at', 'booking_id', 'refund_amount', 'status']}
                    emptyText="No transactions"
                />
            </div>
        </div>
    );
};
