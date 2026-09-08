-- Capacity Connect has three primary roles only: learner, manager, and admin.
-- This migration safely normalizes the retired trainer role before tightening the constraint.

update public.profiles
set role = 'manager', manager_approved = true
where role = 'trainer';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('learner', 'manager', 'admin'));

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
    and is_active = true
    and (role <> 'manager' or manager_approved = true);
$$;

drop policy if exists courses_insert_manager on public.courses;
drop policy if exists courses_update_owner_or_admin on public.courses;

create policy courses_insert_manager on public.courses
  for insert to authenticated
  with check (created_by = auth.uid() and public.current_user_role() in ('manager', 'admin'));

create policy courses_update_owner_or_admin on public.courses
  for update to authenticated
  using (created_by = auth.uid() or public.current_user_role() = 'admin')
  with check ((created_by = auth.uid() and public.current_user_role() in ('manager', 'admin')) or public.current_user_role() = 'admin');
