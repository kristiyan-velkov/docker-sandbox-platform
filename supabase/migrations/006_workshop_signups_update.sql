-- Allow progress fields on signups to be updated (total time, current/furthest lab)

create policy "workshop_signups_public_update"
  on public.workshop_signups for update
  to anon, authenticated
  using (true)
  with check (true);

-- Backfill total time from completed lab progress rows
update public.workshop_signups s
set total_duration_seconds = coalesce(
  (
    select sum(p.duration_seconds)::integer
    from public.workshop_lab_progress p
    where p.signup_id = s.id
      and p.status = 'completed'
      and p.duration_seconds is not null
  ),
  0
)
where coalesce(s.total_duration_seconds, 0) = 0
  and exists (
    select 1
    from public.workshop_lab_progress p
    where p.signup_id = s.id
      and p.status = 'completed'
      and p.duration_seconds is not null
  );
