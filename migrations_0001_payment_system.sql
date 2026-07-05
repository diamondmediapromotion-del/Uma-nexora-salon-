-- 1. Razorpay Orders
create table if not exists public.razorpay_orders (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null,
  customer_id uuid references public.profiles(id) not null,
  shop_id uuid not null,
  owner_id uuid references public.profiles(id) not null,
  razorpay_order_id text not null unique,
  amount numeric not null,
  currency text default 'INR',
  status text not null,
  created_at timestamptz default now()
);

alter table public.razorpay_orders enable row level security;
create policy "Owners can view their orders" on public.razorpay_orders for select using (auth.uid() = owner_id);
create policy "Customers can view their orders" on public.razorpay_orders for select using (auth.uid() = customer_id);

-- 2. Razorpay Payments
create table if not exists public.razorpay_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.razorpay_orders(id) not null,
  razorpay_payment_id text not null unique,
  amount numeric not null,
  method text,
  status text not null,
  created_at timestamptz default now()
);

alter table public.razorpay_payments enable row level security;
create policy "Owners can view payments of their orders" on public.razorpay_payments for select using (exists (select 1 from public.razorpay_orders where id = order_id and owner_id = auth.uid()));

-- 3. Owner Wallets
create table if not exists public.owner_wallets (
  owner_id uuid primary key references public.profiles(id),
  pending_balance numeric default 0,
  total_earned numeric default 0,
  updated_at timestamptz default now()
);

alter table public.owner_wallets enable row level security;
create policy "Owners can view their wallet" on public.owner_wallets for select using (auth.uid() = owner_id);

-- 4. Owner Wallet Ledger
create table if not exists public.owner_wallet_ledger (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid references public.owner_wallets(owner_id) not null,
  amount numeric not null,
  type text not null,
  description text,
  created_at timestamptz default now()
);

alter table public.owner_wallet_ledger enable row level security;
create policy "Owners can view their ledger" on public.owner_wallet_ledger for select using (exists (select 1 from public.owner_wallets where owner_id = auth.uid() and wallet_id = owner_id));

-- 5. Owner Payout Accounts
create table if not exists public.owner_payout_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid unique references public.profiles(id) not null,
  type text not null, -- 'bank' or 'upi'
  details jsonb not null, -- e.g., { "account_number": "...", "ifsc": "..." } or { "upi_id": "..." }
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.owner_payout_accounts enable row level security;
create policy "Owners can view their payout account" on public.owner_payout_accounts for select using (auth.uid() = owner_id);
create policy "Owners can insert their payout account" on public.owner_payout_accounts for insert with check (auth.uid() = owner_id);
create policy "Owners can update their payout account" on public.owner_payout_accounts for update using (auth.uid() = owner_id);

-- 6. RPC Function
create or replace function public.record_captured_razorpay_payment(
  p_payment_id text,
  p_order_id text,
  p_amount numeric,
  p_method text,
  p_payload jsonb
) returns void as $$
declare
  v_order record;
  v_commission numeric;
  v_owner_earning numeric;
begin
  select * into v_order from public.razorpay_orders where razorpay_order_id = p_order_id;
  
  if not found then
    raise exception 'Order not found';
  end if;

  -- Insert payment
  insert into public.razorpay_payments (order_id, razorpay_payment_id, amount, method, status)
  values (v_order.id, p_payment_id, p_amount, p_method, 'captured');

  -- Calculate commission (10%)
  v_commission := p_amount * 0.10;
  v_owner_earning := p_amount - v_commission;

  -- Update wallet
  insert into public.owner_wallets (owner_id, pending_balance, total_earned)
  values (v_order.owner_id, v_owner_earning, v_owner_earning)
  on conflict (owner_id) do update 
  set pending_balance = public.owner_wallets.pending_balance + v_owner_earning,
      total_earned = public.owner_wallets.total_earned + v_owner_earning;

  -- Ledger entry
  insert into public.owner_wallet_ledger (wallet_id, amount, type, description)
  values (v_order.owner_id, v_owner_earning, 'credit', 'Payment captured for order ' || p_order_id);
end;
$$ language plpgsql security definer;
