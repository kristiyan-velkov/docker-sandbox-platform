-- Trim workshop to 6 labs (remove lab-07 through lab-10)
-- Requires: 004_lab_progress.sql and 005_extend_lab_ids.sql applied first

-- Clear invalid lab references on signups before tightening checks
update public.workshop_signups
set current_lab_id = null
where current_lab_id in ('lab-07', 'lab-08', 'lab-09', 'lab-10');

update public.workshop_signups
set furthest_lab_id = null
where furthest_lab_id in ('lab-07', 'lab-08', 'lab-09', 'lab-10');

update public.workshop_signups
set lab_interest = 'all'
where lab_interest in ('lab-07', 'lab-08', 'lab-09', 'lab-10');

alter table public.workshop_signups
  drop constraint if exists workshop_signups_lab_interest_check;

alter table public.workshop_signups
  add constraint workshop_signups_lab_interest_check
  check (lab_interest in (
    'lab-01', 'lab-02', 'lab-03', 'lab-04', 'lab-05',
    'lab-06', 'all'
  ));

alter table public.workshop_signups
  drop constraint if exists workshop_signups_current_lab_id_check;

alter table public.workshop_signups
  add constraint workshop_signups_current_lab_id_check
  check (current_lab_id is null or current_lab_id in (
    'lab-01', 'lab-02', 'lab-03', 'lab-04', 'lab-05',
    'lab-06'
  ));

alter table public.workshop_signups
  drop constraint if exists workshop_signups_furthest_lab_id_check;

alter table public.workshop_signups
  add constraint workshop_signups_furthest_lab_id_check
  check (furthest_lab_id is null or furthest_lab_id in (
    'lab-01', 'lab-02', 'lab-03', 'lab-04', 'lab-05',
    'lab-06'
  ));

delete from public.workshop_questions
where lab_id in ('lab-07', 'lab-08', 'lab-09', 'lab-10');

alter table public.workshop_questions
  drop constraint if exists workshop_questions_lab_id_check;

alter table public.workshop_questions
  add constraint workshop_questions_lab_id_check
  check (lab_id in (
    'lab-01', 'lab-02', 'lab-03', 'lab-04', 'lab-05',
    'lab-06', 'general'
  ));

-- workshop_lab_progress (table from 004_lab_progress.sql — not lab_progress)
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'workshop_lab_progress'
  ) then
    delete from public.workshop_lab_progress
    where lab_id in ('lab-07', 'lab-08', 'lab-09', 'lab-10');

    alter table public.workshop_lab_progress
      drop constraint if exists workshop_lab_progress_lab_id_check;

    alter table public.workshop_lab_progress
      add constraint workshop_lab_progress_lab_id_check
      check (lab_id in (
        'lab-01', 'lab-02', 'lab-03', 'lab-04', 'lab-05',
        'lab-06'
      ));
  end if;
end $$;
