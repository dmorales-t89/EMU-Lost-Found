-- Enable UUID extension (safe to run even if already enabled)
create extension if not exists "pgcrypto";

-- Lost and Found Items Table
create table public.items (
  id uuid not null default gen_random_uuid (),
  type text not null,
  title text not null,
  description text null,
  event_location text null,
  current_location text null,
  date_event date null,
  image_url text not null,
  contact_info text not null,
  status text not null default 'open'::text,
  created_at timestamp with time zone not null default now(),
  constraint items_pkey primary key (id),
  constraint items_status_check check (
    (
      status = any (
        array['open'::text, 'claimed'::text, 'returned'::text]
      )
    )
  ),
  constraint items_type_check check ((type = any (array['lost'::text, 'found'::text])))
) TABLESPACE pg_default;

-- Claim_requests Table
create table public.claim_requests (
  id uuid not null default gen_random_uuid (),
  item_id uuid not null,
  requestor_email text not null,
  status text not null default 'pending'::text,
  decision_token_hash text null,
  decision_expires_at timestamp with time zone null,
  decided_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  action_token_hash text null,
  action_token_expires_at timestamp with time zone null default (now() + '7 days'::interval),
  action_token_used_at timestamp with time zone null,
  constraint claim_requests_pkey primary key (id),
  constraint claim_requests_item_id_fkey foreign KEY (item_id) references items (id) on delete CASCADE,
  constraint claim_requests_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'approved'::text,
          'rejected'::text,
          'returned'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create unique INDEX IF not exists claim_requests_action_token_hash_uq on public.claim_requests using btree (action_token_hash) TABLESPACE pg_default
where
  (action_token_hash is not null);

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

