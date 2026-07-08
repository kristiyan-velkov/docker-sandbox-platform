-- Per-lab progress tracking for registered attendees

alter table public.workshop_signups
  add column if not exists current_lab_id text,
  add column if not exists furthest_lab_id text,
  add column if not exists total_duration_seconds integer not null default 0
    check (total_duration_seconds >= 0);

create table if not exists public.workshop_lab_progress (
  id uuid primary key default gen_random_uuid(),
  signup_id uuid not null references public.workshop_signups (id) on delete cascade,
  lab_id text not null,
  status text not null check (status in ('in_progress', 'completed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (signup_id, lab_id)
);

alter table public.workshop_lab_progress
  add constraint workshop_lab_progress_lab_id_check
  check (lab_id in (
    'lab-01', 'lab-02', 'lab-03', 'lab-04', 'lab-05',
    'lab-06', 'lab-07', 'lab-08', 'lab-09', 'lab-10'
  ));

create index if not exists idx_workshop_lab_progress_signup_id
  on public.workshop_lab_progress (signup_id);

create index if not exists idx_workshop_lab_progress_lab_id
  on public.workshop_lab_progress (lab_id);

alter table public.workshop_lab_progress enable row level security;

create policy "workshop_lab_progress_public_read"
  on public.workshop_lab_progress for select
  to anon, authenticated
  using (true);

create policy "workshop_lab_progress_public_insert"
  on public.workshop_lab_progress for insert
  to anon, authenticated
  with check (true);

create policy "workshop_lab_progress_public_update"
  on public.workshop_lab_progress for update
  to anon, authenticated
  using (true)
  with check (true);
