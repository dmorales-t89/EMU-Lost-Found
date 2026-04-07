-- Lost and Found Items Table
-- Enable UUID extension (safe to run even if already enabled)
create extension if not exists "pgcrypto";

create table if not exists public.items (

  id uuid primary key default gen_random_uuid(),

  -- lost or found
  type text not null
    check (type in ('lost', 'found')),

  title text not null,

  description text,

  -- where it was lost or found
  event_location text,

  -- where it is currently stored (optional)
  current_location text,

  date_event date,

  image_url text not null,

  contact_info text not null,

  -- lifecycle management
  status text not null default 'open'
    check (status in ('open', 'claimed', 'returned')),

  created_at timestamptz not null default now()
);


-- Public access policies for items table
-- Enable row level security
alter table items enable row level security;

-- Allow anyone to submit an item
create policy "Public insert"
on items
for insert
to anon
with check (true);

-- Allow anyone to view items
create policy "Public read"
on items
for select
to anon
using (true);

-- Anon access policies
-- Upload to this bucket only
drop policy if exists "anon_upload_lost_found_images" on storage.objects;
create policy "anon_upload_lost_found_images"
on storage.objects
for insert
to anon
with check (bucket_id = 'lost-found-images');

-- Read from this bucket only
drop policy if exists "anon_read_lost_found_images" on storage.objects;
create policy "anon_read_lost_found_images"
on storage.objects
for select
to anon
using (bucket_id = 'lost-found-images');

-- Claim Requests (optional, used by the request-claim edge function)
create table if not exists public.claim_requests (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  requestor_email text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table claim_requests enable row level security;

-- Allow anyone to create a claim request (restrict/adjust as needed)
drop policy if exists "Public claim insert" on claim_requests;
create policy "Public claim insert"
on claim_requests
for insert
to anon
with check (true);

