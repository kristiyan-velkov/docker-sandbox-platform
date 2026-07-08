-- Extend lab IDs to all ten workshop labs

alter table public.workshop_signups
  drop constraint if exists workshop_signups_lab_interest_check;

alter table public.workshop_signups
  add constraint workshop_signups_lab_interest_check
  check (lab_interest in (
    'lab-01', 'lab-02', 'lab-03', 'lab-04', 'lab-05',
    'lab-06', 'lab-07', 'lab-08', 'lab-09', 'lab-10', 'all'
  ));

alter table public.workshop_questions
  drop constraint if exists workshop_questions_lab_id_check;

alter table public.workshop_questions
  add constraint workshop_questions_lab_id_check
  check (lab_id in (
    'lab-01', 'lab-02', 'lab-03', 'lab-04', 'lab-05',
    'lab-06', 'lab-07', 'lab-08', 'lab-09', 'lab-10', 'general'
  ));

alter table public.workshop_signups
  drop constraint if exists workshop_signups_current_lab_id_check;

alter table public.workshop_signups
  add constraint workshop_signups_current_lab_id_check
  check (current_lab_id is null or current_lab_id in (
    'lab-01', 'lab-02', 'lab-03', 'lab-04', 'lab-05',
    'lab-06', 'lab-07', 'lab-08', 'lab-09', 'lab-10'
  ));

alter table public.workshop_signups
  drop constraint if exists workshop_signups_furthest_lab_id_check;

alter table public.workshop_signups
  add constraint workshop_signups_furthest_lab_id_check
  check (furthest_lab_id is null or furthest_lab_id in (
    'lab-01', 'lab-02', 'lab-03', 'lab-04', 'lab-05',
    'lab-06', 'lab-07', 'lab-08', 'lab-09', 'lab-10'
  ));
