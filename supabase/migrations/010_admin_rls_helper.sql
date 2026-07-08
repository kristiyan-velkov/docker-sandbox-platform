-- Helper for admin RLS (avoids recursive policy checks)

create or replace function public.is_workshop_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workshop_signups
    where is_admin = true
      and (
        auth_user_id = auth.uid()
        or lower(email) = lower(auth.jwt() ->> 'email')
      )
  );
$$;

revoke all on function public.is_workshop_admin() from public;
grant execute on function public.is_workshop_admin() to authenticated;

drop policy if exists "workshop_signups_admin_select" on public.workshop_signups;
drop policy if exists "workshop_lab_progress_admin_select" on public.workshop_lab_progress;
drop policy if exists "workshop_questions_admin_select" on public.workshop_questions;

create policy "workshop_signups_admin_select"
  on public.workshop_signups for select
  to authenticated
  using (public.is_workshop_admin());

create policy "workshop_lab_progress_admin_select"
  on public.workshop_lab_progress for select
  to authenticated
  using (public.is_workshop_admin());

create policy "workshop_questions_admin_select"
  on public.workshop_questions for select
  to authenticated
  using (public.is_workshop_admin());
