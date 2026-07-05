-- 1. Finance Export Requests
create table if not exists public.finance_export_requests (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) not null,
  export_type text not null,
  status text default 'pending', -- pending, processing, completed, failed
  start_date timestamptz,
  end_date timestamptz,
  filters jsonb,
  storage_path text,
  file_name text,
  row_count int,
  file_size_bytes bigint,
  mime_type text,
  error_message text,
  requested_at timestamptz default now(),
  completed_at timestamptz
);

-- 2. RPC: Admin Create Export Request
create or replace function public.admin_create_finance_export_request(
  p_export_type text,
  p_start_date timestamptz,
  p_end_date timestamptz,
  p_filters jsonb
) returns uuid as $$
declare
  v_id uuid;
begin
  insert into public.finance_export_requests (created_by, export_type, start_date, end_date, filters)
  values (auth.uid(), p_export_type, p_start_date, p_end_date, p_filters)
  returning id into v_id;
  return v_id;
end;
$$ language plpgsql security definer;

-- 3. RPC: Admin Cancel Export Request
create or replace function public.admin_cancel_finance_export_request(
  p_export_request_id uuid
) returns void as $$
begin
  update public.finance_export_requests
  set status = 'cancelled'
  where id = p_export_request_id and status in ('pending', 'processing');
end;
$$ language plpgsql security definer;

-- 4. Service RPC: Mark Processing
create or replace function public.service_mark_finance_export_processing(
  p_export_request_id uuid
) returns void as $$
begin
  update public.finance_export_requests
  set status = 'processing'
  where id = p_export_request_id;
end;
$$ language plpgsql security definer;

-- 5. Service RPC: Mark Completed
create or replace function public.service_mark_finance_export_completed(
  p_export_request_id uuid,
  p_storage_path text,
  p_file_name text,
  p_row_count int,
  p_file_size_bytes bigint,
  p_mime_type text
) returns void as $$
begin
  update public.finance_export_requests
  set status = 'completed',
      storage_path = p_storage_path,
      file_name = p_file_name,
      row_count = p_row_count,
      file_size_bytes = p_file_size_bytes,
      mime_type = p_mime_type,
      completed_at = now()
  where id = p_export_request_id;
end;
$$ language plpgsql security definer;

-- 6. Service RPC: Mark Failed
create or replace function public.service_mark_finance_export_failed(
  p_export_request_id uuid,
  p_error_message text
) returns void as $$
begin
  update public.finance_export_requests
  set status = 'failed',
      error_message = p_error_message
  where id = p_export_request_id;
end;
$$ language plpgsql security definer;
