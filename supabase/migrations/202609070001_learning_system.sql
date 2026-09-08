create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  role text not null default 'learner' check (role in ('learner', 'manager', 'admin', 'trainer')),
  department text not null default '',
  position text not null default '',
  avatar text not null default 'CC',
  is_active boolean not null default true,
  manager_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and is_active = true and (role <> 'manager' or manager_approved = true);
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, department, position, avatar, manager_approved)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Capacity Connect User'),
    new.email,
    'learner',
    coalesce(new.raw_user_meta_data ->> 'department', ''),
    coalesce(new.raw_user_meta_data ->> 'position', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar', 'CC'),
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();

create table if not exists public.course_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default 'Other',
  level text not null default 'Beginner' check (level in ('Beginner', 'Intermediate', 'Advanced')),
  duration_weeks integer not null default 4 check (duration_weeks between 1 and 52),
  source text not null default 'Capacity Connect demo curriculum',
  source_url text,
  is_official boolean not null default false,
  is_published boolean not null default false,
  sequential_unlock boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses add column if not exists source text not null default 'Capacity Connect demo curriculum';
alter table public.courses add column if not exists source_url text;
alter table public.courses add column if not exists is_official boolean not null default false;
alter table public.courses add column if not exists is_published boolean not null default false;
alter table public.courses add column if not exists sequential_unlock boolean not null default true;
alter table public.courses add column if not exists created_by uuid references public.profiles(id) on delete set null;
alter table public.courses add column if not exists updated_at timestamptz not null default now();

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at before update on public.courses for each row execute function public.set_updated_at();

create table if not exists public.course_weeks (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  week_number integer not null check (week_number > 0),
  title text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  unique(course_id, week_number)
);

create table if not exists public.course_videos (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.course_weeks(id) on delete cascade,
  title text not null,
  description text not null default '',
  video_url text,
  transcript text,
  transcript_language text not null default 'en',
  duration_minutes integer,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(user_id, course_id)
);

create table if not exists public.video_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  video_id uuid not null references public.course_videos(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  unique(user_id, video_id)
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.course_weeks(id) on delete cascade,
  title text not null,
  passing_score integer not null default 70 check (passing_score between 1 and 100),
  allow_retake boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer integer not null check (correct_answer between 0 and 3),
  explanation text not null default '',
  order_index integer not null default 0
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  passed boolean not null default false,
  answers jsonb not null default '{}'::jsonb,
  attempted_at timestamptz not null default now()
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.course_weeks(id) on delete cascade,
  title text not null,
  description text not null default '',
  instructions text not null default '',
  deadline date,
  created_at timestamptz not null default now()
);

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  response text not null,
  score integer check (score between 0 and 100),
  feedback text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique(assignment_id, user_id)
);

create table if not exists public.competencies (
  id text primary key,
  name text not null unique,
  category text not null default 'General',
  description text not null default '',
  default_required integer not null default 70 check (default_required between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.user_competencies (
  user_id uuid not null references public.profiles(id) on delete cascade,
  competency_id text not null references public.competencies(id) on delete cascade,
  current_score integer not null default 0 check (current_score between 0 and 100),
  required_score integer not null default 70 check (required_score between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key (user_id, competency_id)
);

create table if not exists public.certificates (
  id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null default '',
  title text not null,
  issued_date date not null default current_date,
  expiry_date date,
  verification_status text not null default 'valid' check (verification_status in ('valid', 'revoked')),
  created_at timestamptz not null default now()
);

create table if not exists public.course_competencies (
  course_id uuid not null references public.courses(id) on delete cascade,
  competency_id text not null references public.competencies(id) on delete cascade,
  primary key (course_id, competency_id)
);

insert into public.course_categories (name, description) values
  ('Earth Science', 'Earth system science and geoscience resources.'),
  ('Weather', 'Weather observation, forecasting, and atmospheric services.'),
  ('Climate', 'Climate systems, climate change, and resilience.'),
  ('Ocean Science', 'Oceanography, marine science, and coastal systems.'),
  ('Geoscience', 'Seismology, hazards, and geological processes.'),
  ('AI & Digital Skills', 'Clearly labelled digital and AI learning content.'),
  ('Other', 'Additional capability-building content.')
on conflict (name) do nothing;

insert into public.courses (id, title, description, category, level, duration_weeks, source, source_url, is_official, is_published, sequential_unlock)
values
  ('10000000-0000-0000-0000-000000000001', 'MoES Earth System Science Resource Path', 'A guided learning path curated from public Ministry of Earth Sciences information about the Earth system, ministry mandate, and national science services.', 'Earth Science', 'Beginner', 3, 'Curated from official MoES public information; this is a Capacity Connect learning path, not an MoES-certified course.', 'https://www.moes.gov.in/ministry', true, true, true),
  ('10000000-0000-0000-0000-000000000002', 'Weather and Climate Services Resource Path', 'Explore official public information about weather, climate, and Mission Mausam through structured weekly study.', 'Weather', 'Intermediate', 4, 'Curated from official MoES Mission Mausam and IMD public resources; this is not presented as an official MoES course.', 'https://www.moes.gov.in/offerings/schemes-and-services/details/mission-mausam-AjMzATMtQWa', true, true, true),
  ('10000000-0000-0000-0000-000000000003', 'AI and Digital Skills for Public Service', 'Demo curriculum created by Capacity Connect for responsible AI literacy, prompting, and digital productivity in public services.', 'AI & Digital Skills', 'Beginner', 3, 'Capacity Connect demo curriculum; not an official MoES resource.', 'https://www.moes.gov.in/', false, true, true)
on conflict (id) do update set title = excluded.title, description = excluded.description, source = excluded.source, source_url = excluded.source_url, is_official = excluded.is_official, is_published = excluded.is_published;

insert into public.course_weeks (id, course_id, week_number, title, description) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1, 'The Earth system and MoES mandate', 'Understand the connected atmosphere, hydrosphere, geosphere, biosphere, and cryosphere.'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 2, 'Oceans, coasts, and polar regions', 'Review the public-service role of ocean, coastal, and polar science.'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 3, 'Natural hazards and public information', 'Connect earth-system observations with hazard awareness and resilience.'),
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000002', 1, 'Weather observation and services', 'Learn how weather observations support public decisions.'),
  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000002', 2, 'Atmosphere and climate systems', 'Distinguish weather processes from longer-term climate patterns.'),
  ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000002', 3, 'Mission Mausam and climate resilience', 'Study the stated goals of improving weather and climate services.'),
  ('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000002', 4, 'Applying official information responsibly', 'Use authoritative sources and communicate uncertainty clearly.'),
  ('20000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000003', 1, 'Introduction to artificial intelligence', 'Core concepts and examples for public-service teams.'),
  ('20000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000003', 2, 'Prompting and AI productivity', 'Use clear instructions and verify generated outputs.'),
  ('20000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000003', 3, 'Responsible AI in government', 'Consider privacy, fairness, transparency, and human oversight.')
on conflict (id) do update set title = excluded.title, description = excluded.description;

insert into public.course_videos (id, week_id, title, description, video_url, transcript, transcript_language, duration_minutes, order_index) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'MoES mandate and Earth-system services', 'Official ministry overview and mandate reference.', 'https://www.moes.gov.in/ministry', 'This learning resource introduces the Ministry of Earth Sciences mandate across weather, climate, oceans, coastal states, hydrology, seismology, natural hazards, and the three polar regions. Read the linked official page for the authoritative description.', 'en', 12, 1),
  ('30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000011', 'Mission Mausam public information', 'Official MoES scheme information reference.', 'https://www.moes.gov.in/offerings/schemes-and-services/details/mission-mausam-AjMzATMtQWa', 'This resource points learners to the official Mission Mausam information published by the Ministry of Earth Sciences. Learners should distinguish public information about a government scheme from a formal training course.', 'en', 12, 1),
  ('30000000-0000-0000-0000-000000000021', '20000000-0000-0000-0000-000000000021', 'AI fundamentals demo lesson', 'Capacity Connect demo content, clearly separated from official MoES resources.', null, 'Artificial intelligence describes systems that perform tasks associated with human intelligence. In public services, useful AI adoption starts with a clear problem, reliable data, human review, and measurable outcomes. This is manager-created demo content, not an official MoES video.', 'en', 15, 1)
on conflict (id) do update set transcript = excluded.transcript, video_url = excluded.video_url, description = excluded.description;

insert into public.quizzes (id, week_id, title, passing_score, allow_retake) values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Week 1 Earth-system knowledge check', 70, true),
  ('40000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000011', 'Week 1 weather services knowledge check', 70, true),
  ('40000000-0000-0000-0000-000000000021', '20000000-0000-0000-0000-000000000021', 'Week 1 AI fundamentals knowledge check', 70, true)
on conflict (id) do update set title = excluded.title, passing_score = excluded.passing_score;

insert into public.quiz_questions (id, quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index) values
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Which set best describes areas named in the MoES mandate?', 'Weather, climate, oceans, and natural hazards', 'Only software engineering', 'Only crop pricing', 'Only civil construction', 0, 'The official MoES ministry description includes weather, climate, oceans, hydrology, seismology, natural hazards, and polar regions.', 1),
  ('50000000-0000-0000-0000-000000000011', '40000000-0000-0000-0000-000000000011', 'What should a learner do when using an official public resource?', 'Check the source and communicate its scope accurately', 'Present it as a personal opinion', 'Remove the source reference', 'Assume it is a certification', 0, 'Source and scope are important when using public information.', 1),
  ('50000000-0000-0000-0000-000000000021', '40000000-0000-0000-0000-000000000021', 'What is a responsible first step for AI adoption?', 'Define the problem and keep human review', 'Skip validation', 'Hide the use of AI', 'Use any data without checking', 0, 'Responsible AI begins with a clear use case, reliable data, and human oversight.', 1)
on conflict (id) do update set question = excluded.question, explanation = excluded.explanation;

insert into public.assignments (id, week_id, title, description, instructions)
values ('60000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000014', 'Source-check reflection', 'Practice communicating the limits of a public science resource.', 'Choose one official MoES resource, record its URL, and write 150 words explaining what it does and does not claim.')
on conflict (id) do update set description = excluded.description, instructions = excluded.instructions;

alter table public.profiles enable row level security;
alter table public.course_categories enable row level security;
alter table public.courses enable row level security;
alter table public.course_weeks enable row level security;
alter table public.course_videos enable row level security;
alter table public.enrollments enable row level security;
alter table public.video_progress enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.competencies enable row level security;
alter table public.user_competencies enable row level security;
alter table public.certificates enable row level security;
alter table public.course_competencies enable row level security;

alter table public.courses add column if not exists content_status text not null default 'Draft' check (content_status in ('Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Published'));

update public.courses set content_status = case when is_published then 'Published' else 'Draft' end where content_status = 'Draft';

drop policy if exists profiles_select_self_or_admin on public.profiles;
drop policy if exists "Authenticated users can view profiles" on public.profiles;
drop policy if exists "Users can update their own profiles" on public.profiles;
drop policy if exists profiles_insert_self on public.profiles;
drop policy if exists profiles_update_self_or_admin on public.profiles;
drop policy if exists courses_read_published_or_owner on public.courses;
drop policy if exists "Authenticated users can read catalog courses" on public.courses;
drop policy if exists "Managers and trainers can create courses" on public.courses;
drop policy if exists courses_insert_manager on public.courses;
drop policy if exists courses_update_owner_or_admin on public.courses;
drop policy if exists courses_delete_owner_or_admin on public.courses;
drop policy if exists weeks_read_authenticated on public.course_weeks;
drop policy if exists "Authenticated users can read course weeks" on public.course_weeks;
drop policy if exists weeks_manage_owner on public.course_weeks;
drop policy if exists videos_read_authenticated on public.course_videos;
drop policy if exists "Authenticated users can read course videos" on public.course_videos;
drop policy if exists videos_manage_owner on public.course_videos;
drop policy if exists enrollment_self_or_manager_read on public.enrollments;
drop policy if exists enrollment_self_insert on public.enrollments;
drop policy if exists enrollment_self_update on public.enrollments;
drop policy if exists video_progress_self on public.video_progress;
drop policy if exists quiz_read_authenticated on public.quizzes;
drop policy if exists "Authenticated users can read quizzes" on public.quizzes;
drop policy if exists quiz_manage_owner on public.quizzes;
drop policy if exists question_read_authenticated on public.quiz_questions;
drop policy if exists "Authenticated users can read questions" on public.quiz_questions;
drop policy if exists question_manage_owner on public.quiz_questions;
drop policy if exists quiz_attempts_self_or_manager_read on public.quiz_attempts;
drop policy if exists quiz_attempts_self_insert on public.quiz_attempts;
drop policy if exists assignment_read_authenticated on public.assignments;
drop policy if exists "Authenticated users can read assignments" on public.assignments;
drop policy if exists assignment_manage_owner on public.assignments;
drop policy if exists submissions_self_or_manager_read on public.assignment_submissions;
drop policy if exists submissions_self_insert on public.assignment_submissions;
drop policy if exists submissions_self_or_manager_update on public.assignment_submissions;

create policy profiles_select_self_or_admin on public.profiles for select to authenticated using (id = auth.uid() or public.current_user_role() = 'admin');
create policy profiles_insert_self on public.profiles for insert to authenticated with check (id = auth.uid() and role = 'learner');
create policy profiles_update_self_or_admin on public.profiles for update to authenticated using (id = auth.uid() or public.current_user_role() = 'admin') with check ((id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid())) or public.current_user_role() = 'admin');

create policy courses_read_published_or_owner on public.courses for select to authenticated using (content_status in ('Approved', 'Published') or created_by = auth.uid() or public.current_user_role() = 'admin');
create policy courses_insert_manager on public.courses for insert to authenticated with check (created_by = auth.uid() and public.current_user_role() in ('manager', 'trainer', 'admin'));
create policy courses_update_owner_or_admin on public.courses for update to authenticated using (created_by = auth.uid() or public.current_user_role() = 'admin') with check ((created_by = auth.uid() and public.current_user_role() in ('manager', 'trainer', 'admin')) or public.current_user_role() = 'admin');
create policy courses_delete_owner_or_admin on public.courses for delete to authenticated using (created_by = auth.uid() or public.current_user_role() = 'admin');

create policy weeks_read_authenticated on public.course_weeks for select to authenticated using (exists (select 1 from public.courses c where c.id = course_id and (c.content_status in ('Approved', 'Published') or c.created_by = auth.uid() or public.current_user_role() = 'admin')));
create policy weeks_manage_owner on public.course_weeks for all to authenticated using (exists (select 1 from public.courses c where c.id = course_id and (c.created_by = auth.uid() or public.current_user_role() = 'admin'))) with check (exists (select 1 from public.courses c where c.id = course_id and (c.created_by = auth.uid() or public.current_user_role() = 'admin')));

create policy videos_read_authenticated on public.course_videos for select to authenticated using (exists (select 1 from public.course_weeks w join public.courses c on c.id = w.course_id where w.id = week_id and (c.content_status in ('Approved', 'Published') or c.created_by = auth.uid() or public.current_user_role() = 'admin')));
create policy videos_manage_owner on public.course_videos for all to authenticated using (exists (select 1 from public.course_weeks w join public.courses c on c.id = w.course_id where w.id = week_id and (c.created_by = auth.uid() or public.current_user_role() = 'admin'))) with check (exists (select 1 from public.course_weeks w join public.courses c on c.id = w.course_id where w.id = week_id and (c.created_by = auth.uid() or public.current_user_role() = 'admin')));

create policy enrollment_self_or_manager_read on public.enrollments for select to authenticated using (user_id = auth.uid() or public.current_user_role() in ('manager', 'admin'));
create policy enrollment_self_insert on public.enrollments for insert to authenticated with check (user_id = auth.uid());
create policy enrollment_self_update on public.enrollments for update to authenticated using (user_id = auth.uid() or public.current_user_role() = 'admin') with check (user_id = auth.uid() or public.current_user_role() = 'admin');
create policy video_progress_self on public.video_progress for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy quiz_read_authenticated on public.quizzes for select to authenticated using (exists (select 1 from public.course_weeks w join public.courses c on c.id = w.course_id where w.id = week_id and (c.content_status in ('Approved', 'Published') or c.created_by = auth.uid() or public.current_user_role() = 'admin')));
create policy quiz_manage_owner on public.quizzes for all to authenticated using (exists (select 1 from public.course_weeks w join public.courses c on c.id = w.course_id where w.id = week_id and (c.created_by = auth.uid() or public.current_user_role() = 'admin'))) with check (exists (select 1 from public.course_weeks w join public.courses c on c.id = w.course_id where w.id = week_id and (c.created_by = auth.uid() or public.current_user_role() = 'admin')));
create policy question_read_authenticated on public.quiz_questions for select to authenticated using (true);
create policy question_manage_owner on public.quiz_questions for all to authenticated using (exists (select 1 from public.quizzes q join public.course_weeks w on w.id = q.week_id join public.courses c on c.id = w.course_id where q.id = quiz_id and (c.created_by = auth.uid() or public.current_user_role() = 'admin'))) with check (exists (select 1 from public.quizzes q join public.course_weeks w on w.id = q.week_id join public.courses c on c.id = w.course_id where q.id = quiz_id and (c.created_by = auth.uid() or public.current_user_role() = 'admin')));
create policy quiz_attempts_self_or_manager_read on public.quiz_attempts for select to authenticated using (user_id = auth.uid() or public.current_user_role() in ('manager', 'admin'));
create policy quiz_attempts_self_insert on public.quiz_attempts for insert to authenticated with check (user_id = auth.uid());
create policy assignment_read_authenticated on public.assignments for select to authenticated using (true);
create policy assignment_manage_owner on public.assignments for all to authenticated using (exists (select 1 from public.course_weeks w join public.courses c on c.id = w.course_id where w.id = week_id and (c.created_by = auth.uid() or public.current_user_role() = 'admin'))) with check (exists (select 1 from public.course_weeks w join public.courses c on c.id = w.course_id where w.id = week_id and (c.created_by = auth.uid() or public.current_user_role() = 'admin')));
create policy submissions_self_or_manager_read on public.assignment_submissions for select to authenticated using (user_id = auth.uid() or public.current_user_role() in ('manager', 'admin'));
create policy submissions_self_insert on public.assignment_submissions for insert to authenticated with check (user_id = auth.uid());
create policy submissions_self_or_manager_update on public.assignment_submissions for update to authenticated using (user_id = auth.uid() or public.current_user_role() in ('manager', 'admin')) with check (user_id = auth.uid() or public.current_user_role() in ('manager', 'admin'));

create policy competencies_read_authenticated on public.competencies for select to authenticated using (true);
create policy competencies_manage_admin on public.competencies for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy user_competencies_self_or_manager_read on public.user_competencies for select to authenticated using (user_id = auth.uid() or public.current_user_role() in ('manager', 'admin'));
create policy user_competencies_self_update on public.user_competencies for insert to authenticated with check (user_id = auth.uid());
create policy user_competencies_self_update_existing on public.user_competencies for update to authenticated using (user_id = auth.uid() or public.current_user_role() = 'admin') with check (user_id = auth.uid() or public.current_user_role() = 'admin');
create policy certificates_owner_or_admin_read on public.certificates for select to authenticated using (user_id = auth.uid() or public.current_user_role() in ('manager', 'admin'));
create policy certificates_self_insert on public.certificates for insert to authenticated with check (user_id = auth.uid());
create policy certificates_admin_update on public.certificates for update to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy certificates_public_verify on public.certificates for select to anon using (verification_status = 'valid');
create policy course_competencies_read_authenticated on public.course_competencies for select to authenticated using (exists (select 1 from public.courses c where c.id = course_id and (c.content_status in ('Approved', 'Published') or c.created_by = auth.uid() or public.current_user_role() = 'admin')));

create or replace function public.manager_can_access_user(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('admin', 'manager')
    and exists (
      select 1 from public.profiles manager
      join public.profiles member on member.department = manager.department
      where manager.id = auth.uid() and member.id = target_user_id and member.role = 'learner'
    );
$$;

drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_admin_or_manager_team on public.profiles for select to authenticated using (id = auth.uid() or public.current_user_role() = 'admin' or public.manager_can_access_user(id));
drop policy if exists enrollment_self_or_manager_read on public.enrollments;
create policy enrollment_self_or_manager_read on public.enrollments for select to authenticated using (user_id = auth.uid() or public.current_user_role() = 'admin' or public.manager_can_access_user(user_id));
drop policy if exists quiz_attempts_self_or_manager_read on public.quiz_attempts;
create policy quiz_attempts_self_or_manager_read on public.quiz_attempts for select to authenticated using (user_id = auth.uid() or public.current_user_role() = 'admin' or public.manager_can_access_user(user_id));
drop policy if exists submissions_self_or_manager_read on public.assignment_submissions;
create policy submissions_self_or_manager_read on public.assignment_submissions for select to authenticated using (user_id = auth.uid() or public.current_user_role() = 'admin' or public.manager_can_access_user(user_id));
drop policy if exists user_competencies_self_or_manager_read on public.user_competencies;
create policy user_competencies_self_or_manager_read on public.user_competencies for select to authenticated using (user_id = auth.uid() or public.current_user_role() = 'admin' or public.manager_can_access_user(user_id));

create or replace function public.verify_certificate(lookup_certificate_id text)
returns table (certificate_id text, status text, learner_name text, course_name text, issued_date date, completion_date timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select cert.id, 'Valid', profile.full_name, course.title, cert.issued_date, enrollment.completed_at
  from public.certificates cert
  join public.profiles profile on profile.id = cert.user_id
  left join public.courses course on course.id::text = cert.course_id
  left join public.enrollments enrollment on enrollment.user_id = cert.user_id and enrollment.course_id::text = cert.course_id
  where cert.id = lookup_certificate_id and cert.verification_status = 'valid';
$$;
revoke all on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon, authenticated;

