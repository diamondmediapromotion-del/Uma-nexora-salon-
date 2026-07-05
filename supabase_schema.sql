-- 1. Create the profiles table
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  mobile_number text,
  city text,
  area text,
  role text default 'customer', -- Role: customer, salon_owner, etc.
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. Create RLS Policies

-- Policy: Users can view their own profile
create policy "Users can view own profile" on public.profiles
for select using (auth.uid() = id);

-- Policy: Users can update their own profile
create policy "Users can update own profile" on public.profiles
for update using (auth.uid() = id);

-- 4. Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, mobile_number, city, area)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'mobile_number',
    new.raw_user_meta_data ->> 'city',
    new.raw_user_meta_data ->> 'area'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 5. Create trigger to run function on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
