-- Organizer flag on workshop signups (set manually in SQL editor)

alter table public.workshop_signups
  add column if not exists is_admin boolean not null default false;

create index if not exists idx_workshop_signups_is_admin
  on public.workshop_signups (is_admin)
  where is_admin = true;

create or replace function public.guard_workshop_signup_admin_flag()
returns trigger
language plpgsql
as $$
begin
  -- Block only logged-in app users from self-promotion. SQL editor + service role are OK.
  if TG_OP = 'INSERT'
     and new.is_admin = true
     and auth.uid() is not null
     and coalesce(auth.role(), '') != 'service_role' then
    new.is_admin := false;
  end if;

  if TG_OP = 'UPDATE'
     and new.is_admin is distinct from old.is_admin
     and auth.uid() is not null
     and coalesce(auth.role(), '') != 'service_role' then
    raise exception 'Cannot change admin status';
  end if;

  return new;
end;
$$;

drop trigger if exists workshop_signups_guard_admin on public.workshop_signups;

create trigger workshop_signups_guard_admin
  before insert or update on public.workshop_signups
  for each row
  execute function public.guard_workshop_signup_admin_flag();

-- Admins can read all attendee data
drop policy if exists "workshop_signups_admin_select" on public.workshop_signups;

create policy "workshop_signups_admin_select"
  on public.workshop_signups for select
  to authenticated
  using (
    exists (
      select 1
      from public.workshop_signups admin_row
      where admin_row.auth_user_id = auth.uid()
        and admin_row.is_admin = true
    )
  );

drop policy if exists "workshop_lab_progress_admin_select" on public.workshop_lab_progress;

create policy "workshop_lab_progress_admin_select"
  on public.workshop_lab_progress for select
  to authenticated
  using (
    exists (
      select 1
      from public.workshop_signups admin_row
      where admin_row.auth_user_id = auth.uid()
        and admin_row.is_admin = true
    )
  );

drop policy if exists "workshop_questions_admin_select" on public.workshop_questions;

create policy "workshop_questions_admin_select"
  on public.workshop_questions for select
  to authenticated
  using (
    exists (
      select 1
      from public.workshop_signups admin_row
      where admin_row.auth_user_id = auth.uid()
        and admin_row.is_admin = true
    )
  );

-- Grant admin after you register (replace with your email):
-- update public.workshop_signups set is_admin = true where lower(email) = lower('you@example.com');
