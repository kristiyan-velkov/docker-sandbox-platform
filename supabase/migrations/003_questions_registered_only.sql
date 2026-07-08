-- Only registered attendees can submit questions

drop policy if exists "workshop_questions_public_insert" on public.workshop_questions;

create policy "workshop_questions_registered_insert"
  on public.workshop_questions for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.workshop_signups s
      where lower(s.email) = lower(email)
    )
  );
