-- Link workshop signups to Supabase Auth users

alter table public.workshop_signups
  add column if not exists auth_user_id uuid unique references auth.users (id) on delete cascade;

create unique index if not exists idx_workshop_signups_email_lower
  on public.workshop_signups (lower(email));

-- Signups: authenticated users manage their own row
drop policy if exists "workshop_signups_public_insert" on public.workshop_signups;

create policy "workshop_signups_auth_insert"
  on public.workshop_signups for insert
  to authenticated
  with check (auth.uid() = auth_user_id);

create policy "workshop_signups_own_select"
  on public.workshop_signups for select
  to authenticated
  using (
    auth.uid() = auth_user_id
    or (
      auth_user_id is null
      and lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

drop policy if exists "workshop_signups_public_update" on public.workshop_signups;

create policy "workshop_signups_own_update"
  on public.workshop_signups for update
  to authenticated
  using (
    auth.uid() = auth_user_id
    or (
      auth_user_id is null
      and lower(email) = lower(auth.jwt() ->> 'email')
    )
  )
  with check (auth.uid() = auth_user_id);

-- Lab progress: only for the authenticated attendee's signup
drop policy if exists "workshop_lab_progress_public_insert" on public.workshop_lab_progress;
drop policy if exists "workshop_lab_progress_public_update" on public.workshop_lab_progress;

create policy "workshop_lab_progress_own_insert"
  on public.workshop_lab_progress for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.workshop_signups s
      where s.id = signup_id
        and s.auth_user_id = auth.uid()
    )
  );

create policy "workshop_lab_progress_own_update"
  on public.workshop_lab_progress for update
  to authenticated
  using (
    exists (
      select 1
      from public.workshop_signups s
      where s.id = signup_id
        and s.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.workshop_signups s
      where s.id = signup_id
        and s.auth_user_id = auth.uid()
    )
  );

-- Questions: registered attendee with matching auth account
drop policy if exists "workshop_questions_registered_insert" on public.workshop_questions;

create policy "workshop_questions_auth_insert"
  on public.workshop_questions for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.workshop_signups s
      where lower(s.email) = lower(email)
        and s.auth_user_id = auth.uid()
    )
  );
