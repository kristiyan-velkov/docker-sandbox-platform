-- Workshop questions + signup role field

alter table public.workshop_signups
  add column if not exists role text;

create table if not exists public.workshop_questions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) >= 2),
  email text not null check (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  lab_id text not null check (lab_id in ('lab-01', 'lab-02', 'lab-03', 'general')),
  question text not null check (char_length(trim(question)) >= 5),
  created_at timestamptz not null default now()
);

create index if not exists idx_workshop_questions_lab_id
  on public.workshop_questions (lab_id);

create index if not exists idx_workshop_questions_created_at
  on public.workshop_questions (created_at desc);

alter table public.workshop_questions enable row level security;

create policy "workshop_questions_public_read"
  on public.workshop_questions for select
  to anon, authenticated
  using (true);

create policy "workshop_questions_public_insert"
  on public.workshop_questions for insert
  to anon, authenticated
  with check (true);
