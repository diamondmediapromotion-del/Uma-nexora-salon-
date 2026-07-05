-- 1. Payment Refund Requests
create table if not exists public.payment_refund_requests (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.customer_bookings(id) not null,
  shop_id uuid references public.shops(id) not null,
  owner_id uuid references public.profiles(id) not null,
  customer_id uuid references public.profiles(id) not null,
  reason text not null,
  customer_note text,
  admin_note text,
  rejection_reason text,
  requested_amount numeric not null,
  approved_amount numeric,
  status text default 'pending', -- pending, approved, processing, completed, rejected, failed
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Payment Refunds (Actual transactions)
create table if not exists public.payment_refunds (
  id uuid primary key default gen_random_uuid(),
  refund_request_id uuid references public.payment_refund_requests(id) not null,
  razorpay_refund_id text not null unique,
  razorpay_payment_id text not null,
  amount numeric not null,
  status text not null,
  raw_payload jsonb,
  created_at timestamptz default now()
);

-- 3. RPC: Create Refund Request
create or replace function public.create_payment_refund_request(
  p_booking_id uuid,
  p_reason text,
  p_customer_note text,
  p_requested_amount numeric
) returns uuid as $$
declare
  v_refund_request_id uuid;
  v_booking record;
begin
  -- Validate booking and check if refund already exists
  select * into v_booking from public.customer_bookings where id = p_booking_id;
  
  if not found then raise exception 'Booking not found'; end if;
  if exists (select 1 from public.payment_refund_requests where booking_id = p_booking_id and status in ('pending', 'approved', 'processing')) then
    raise exception 'Active refund request exists';
  end if;

  insert into public.payment_refund_requests (booking_id, shop_id, owner_id, customer_id, reason, customer_note, requested_amount)
  values (p_booking_id, v_booking.shop_id, v_booking.owner_id, v_booking.customer_id, p_reason, p_customer_note, p_requested_amount)
  returning id into v_refund_request_id;
  
  return v_refund_request_id;
end;
$$ language plpgsql security definer;

-- 4. RPC: Admin Approve Refund
create or replace function public.admin_approve_refund_request(
  p_refund_request_id uuid,
  p_approved_amount numeric,
  p_admin_note text
) returns void as $$
begin
  update public.payment_refund_requests
  set status = 'approved',
      approved_amount = p_approved_amount,
      admin_note = p_admin_note,
      updated_at = now()
  where id = p_refund_request_id;
end;
$$ language plpgsql security definer;

-- 5. RPC: Admin Reject Refund
create or replace function public.admin_reject_refund_request(
  p_refund_request_id uuid,
  p_rejection_reason text
) returns void as $$
begin
  update public.payment_refund_requests
  set status = 'rejected',
      rejection_reason = p_rejection_reason,
      updated_at = now()
  where id = p_refund_request_id;
end;
$$ language plpgsql security definer;

-- 6. Service RPC: Mark Refund Processing
create or replace function public.service_mark_refund_processing(
  p_refund_request_id uuid,
  p_razorpay_refund_id text,
  p_raw_payload jsonb
) returns void as $$
begin
  update public.payment_refund_requests
  set status = 'processing',
      updated_at = now()
  where id = p_refund_request_id;

  insert into public.payment_refunds (refund_request_id, razorpay_refund_id, razorpay_payment_id, amount, status, raw_payload)
  values (p_refund_request_id, p_razorpay_refund_id, (select razorpay_payment_id from public.customer_bookings where id = (select booking_id from public.payment_refund_requests where id = p_refund_request_id)), 
  (select approved_amount from public.payment_refund_requests where id = p_refund_request_id), 'processing', p_raw_payload);
end;
$$ language plpgsql security definer;

-- 7. Service RPC: Record Success
create or replace function public.record_razorpay_refund_success(
  p_razorpay_refund_id text,
  p_razorpay_payment_id text,
  p_refund_amount numeric,
  p_raw_payload jsonb
) returns void as $$
declare
  v_refund_request_id uuid;
begin
  update public.payment_refunds
  set status = 'completed',
      raw_payload = p_raw_payload
  where razorpay_refund_id = p_razorpay_refund_id
  returning refund_request_id into v_refund_request_id;

  update public.payment_refund_requests
  set status = 'completed',
      updated_at = now()
  where id = v_refund_request_id;
  
  -- Wallet reversal logic would go here
end;
$$ language plpgsql security definer;
