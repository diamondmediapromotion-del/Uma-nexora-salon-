import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { DataTable } from './FinanceDataTable';
import { Loader2 } from 'lucide-react';

export const FinanceExportsTab = () => {
    const [loading, setLoading] = useState(false);
    const [exports, setExports] = useState<any[]>([]);
    const [exportType, setExportType] = useState('razorpay_orders');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchExports();
    }, []);

    const fetchExports = async () => {
        const { data, error } = await supabase
            .from('finance_export_requests')
            .select('*')
            .order('requested_at', { ascending: false });
        if (data) setExports(data);
    };

    const handleCreateExport = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.rpc('admin_create_finance_export_request', {
                p_export_type: exportType,
                p_start_date: startDate ? new Date(startDate).toISOString() : null,
                p_end_date: endDate ? new Date(endDate).toISOString() : null,
                p_filters: {}
            });
            if (error) throw error;
            await fetchExports();
        } catch (err) {
            console.error(err);
            alert('Failed to create export request');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (exportRequest: any) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch('/api/get-finance-export-download-url', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ export_request_id: exportRequest.id })
            });
            const data = await response.json();
            if (data.signed_url) {
                window.open(data.signed_url, '_blank');
            } else {
                throw new Error(data.error || 'Failed to get download URL');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to get download URL');
        }
    };

    const columns = ['export_type', 'status', 'file_name', 'row_count', 'requested_at', 'actions'];

    return (
        <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Request New Export</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select value={exportType} onChange={(e) => setExportType(e.target.value)} className="p-2 border rounded-xl">
                        <option value="razorpay_orders">Razorpay Orders</option>
                        <option value="razorpay_payments">Razorpay Payments</option>
                        <option value="full_finance_report">Full Finance Report</option>
                    </select>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2 border rounded-xl" />
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2 border rounded-xl" />
                    <button onClick={handleCreateExport} disabled={loading} className="p-2 bg-blue-600 text-white rounded-xl font-bold">
                        {loading ? 'Creating...' : 'Create Export'}
                    </button>
                </div>
            </div>

            <DataTable
                rows={exports}
                columns={columns}
                emptyText="No export requests found."
                renderCell={(row, column) => {
                    if (column === 'actions') {
                        return (
                            <div className="flex gap-2">
                                {row.status === 'completed' && row.storage_path && (
                                    <button onClick={() => handleDownload(row)} className="text-blue-600 font-bold text-xs">Download</button>
                                )}
                            </div>
                        );
                    }
                    return undefined;
                }}
            />
        </div>
    );
};
