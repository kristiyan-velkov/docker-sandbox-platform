-- Workshop signups for WeAreDevelopers Berlin demo
-- Run in Supabase SQL editor or via Supabase MCP

create table if not exists public.workshop_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) >= 2),
  email text not null check (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  company text,
  lab_interest text not null default 'all'
    check (lab_interest in ('lab-01', 'lab-02', 'lab-03', 'all')),
  created_at timestamptz not null default now()
);

create index if not exists idx_workshop_signups_created_at
  on public.workshop_signups (created_at desc);

alter table public.workshop_signups enable row level security;

create policy "workshop_signups_public_read"
  on public.workshop_signups for select
  to anon, authenticated
  using (true);

create policy "workshop_signups_public_insert"
  on public.workshop_signups for insert
  to anon, authenticated
  with check (true);
