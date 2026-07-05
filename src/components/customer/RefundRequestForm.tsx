import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export const RefundRequestForm = ({ bookingId, onSubmitted }: { bookingId: string, onSubmitted: () => void }) => {
    const [reason, setReason] = useState('customer_cancelled');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.rpc('create_payment_refund_request', {
                p_booking_id: bookingId,
                p_reason: reason,
                p_customer_note: note,
                p_requested_amount: parseFloat(amount)
            });
            if (error) throw error;
            onSubmitted();
        } catch (err) {
            console.error(err);
            alert('Failed to request refund');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Request Refund</h3>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full mb-2 p-2 border rounded">
                <option value="customer_cancelled">Customer Cancelled</option>
                <option value="merchant_cancelled">Merchant Cancelled</option>
                <option value="no_show">No Show</option>
                <option value="service_unavailable">Service Unavailable</option>
                <option value="duplicate_payment">Duplicate Payment</option>
                <option value="wrong_amount">Wrong Amount</option>
                <option value="other">Other</option>
            </select>
            <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full mb-2 p-2 border rounded" required />
            <textarea placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} className="w-full mb-2 p-2 border rounded" />
            <button type="submit" disabled={loading} className="w-full p-2 bg-blue-600 text-white rounded">
                {loading ? 'Submitting...' : 'Request Refund'}
            </button>
        </form>
    );
};
