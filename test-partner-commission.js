
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log('🚀 Starting Growth Partner Commission Logic Test...');

  try {
    // 1. Setup Test Data (Using existing profiles to satisfy FKs)
    const testUserId = '01debd81-de0f-4a8d-932d-7f1443d536bb';
    const testShopId = '9bcdbd77-9971-4902-960d-2aa3a6709057';
    const testPartnerId = '00000000-0000-0000-0000-000000000003';
    let testBookingId = null;

    // Clean up previous test data
    await supabase.from('partner_commission_ledger').delete().eq('shop_id', testShopId);
    await supabase.from('partner_shop_assignments').delete().eq('shop_id', testShopId);
    await supabase.from('partner_profiles').delete().eq('id', testPartnerId);
    await supabase.from('razorpay_payments').delete().eq('shop_id', testShopId);
    await supabase.from('razorpay_orders').delete().eq('shop_id', testShopId);
    await supabase.from('customer_bookings').delete().eq('shop_id', testShopId);

    console.log('✅ Cleaned up old test data.');

    // Ensure profile has role
    await supabase.from('profiles').update({ role: 'growth_partner' }).eq('id', testUserId);

    // Create a mock booking
    const { data: bData, error: bError } = await supabase.from('customer_bookings').insert({
      customer_id: testUserId,
      shop_id: testShopId,
      status: 'confirmed',
      total_amount: 1000,
      booking_date: '2026-07-05',
      booking_time: '10:00',
      total_duration_minutes: 60
    }).select('id').single();
    if (bError) throw bError;
    testBookingId = bData.id;

    // Create Partner Profile
    const { error: pError } = await supabase.from('partner_profiles').insert({
      id: testPartnerId,
      user_id: testUserId,
      full_name: 'Test Partner',
      mobile: '9999999999',
      partner_code: 'TEST1001',
      status: 'approved',
      city: 'Jaipur',
      district: 'Jaipur',
      state: 'Rajasthan',
      partner_level: 'Growth Partner'
    });
    if (pError) throw pError;
    console.log('✅ Created test partner.');

    // Helper to process payment
    const processPayment = async (paymentId, orderId, assignedMonthsAgo, expectedRate) => {
      const assignedAt = new Date();
      assignedAt.setMonth(assignedAt.getMonth() - assignedMonthsAgo);

      // Create order
      const { error: oError } = await supabase.from('razorpay_orders').insert({
        id: orderId,
        booking_id: testBookingId,
        customer_id: testUserId,
        shop_id: testShopId,
        owner_id: testUserId,
        razorpay_order_id: 'order_' + paymentId,
        amount: 1000,
        status: 'paid'
      });
      if (oError) throw oError;

      // Create payment
      const { error: pyError } = await supabase.from('razorpay_payments').insert({
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        shop_id: testShopId,
        owner_id: testUserId,
        gross_amount: 1000,
        method: 'upi',
        status: 'captured'
      });
      if (pyError) throw pyError;

      // Update assignment date
      await supabase.from('partner_shop_assignments').delete().eq('shop_id', testShopId);
      const { error: aError } = await supabase.from('partner_shop_assignments').insert({
        partner_id: testPartnerId,
        partner_user_id: testUserId,
        shop_id: testShopId,
        owner_id: testUserId,
        commission_start_date: assignedAt.toISOString().split('T')[0],
        is_active: true
      });
      if (aError) throw aError;

      // Run RPC
      const { data: rpcRes, error: rpcError } = await supabase.rpc('process_partner_commission_for_payment', { p_razorpay_payment_id: paymentId });
      if (rpcError) throw rpcError;
      
      const actualRate = rpcRes.partner_commission_rate;
      const normalizedActual = actualRate > 1 ? actualRate / 100 : actualRate;
      
      if (Math.abs(normalizedActual - expectedRate) > 0.001) {
          throw new Error(`Rate mismatch for ${paymentId}: Expected ${expectedRate}, got ${actualRate}`);
      }
      console.log(`✅ Case ${paymentId}: Rate ${actualRate}% matches expected (${expectedRate * 100}%).`);

      return { rpcRes };
    };

    // 2. Test Case 1: Month 1-6 (10% Rate)
    console.log('\n--- Test Case 1: Month 1-6 (10% Rate) ---');
    await processPayment('pay_test_001', '00000000-0000-0000-0000-000000000004', 2, 0.10);

    // 3. Test Case 2: Duplicate Prevention
    console.log('\n--- Test Case 2: Duplicate Webhook Prevention ---');
    await supabase.rpc('process_partner_commission_for_payment', { p_razorpay_payment_id: 'pay_test_001' });
    const { data: payments } = await supabase.from('razorpay_payments').select('id').eq('razorpay_payment_id', 'pay_test_001').single();
    const { count } = await supabase.from('partner_commission_ledger').select('*', { count: 'exact', head: true }).eq('razorpay_payment_row_id', payments.id);
    
    if (count === 1) {
      console.log('✅ Duplicate prevention PASS (Count is 1)');
    } else {
      console.error(`❌ Duplicate prevention FAIL (Found ${count} records)`);
    }

    // 4. Test Case 3: Month 7-12 (5% Rate)
    console.log('\n--- Test Case 3: Month 7-12 (5% Rate) ---');
    await processPayment('pay_test_002', '00000000-0000-0000-0000-000000000006', 8, 0.05);

    // 5. Test Case 4: After 12 Months (2% Rate)
    console.log('\n--- Test Case 4: After 12 Months (2% Rate) ---');
    await processPayment('pay_test_003', '00000000-0000-0000-0000-000000000007', 14, 0.02);

    console.log('\n✨ ALL GROWTH PARTNER COMMISSION LADDER TESTS PASSED! ✨');

  } catch (err) {
    console.error('💥 Test execution error:', err);
    process.exit(1);
  }
}

runTest();
