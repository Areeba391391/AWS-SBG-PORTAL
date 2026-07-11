-- ============================================================
-- AWS Student Builders Group Portal — Supabase Schema (v2)
-- Run this inside: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Safe to re-run: every statement is idempotent (IF NOT EXISTS / OR REPLACE),
-- so running this on a project that already has the old v1 schema just
-- fills in whatever is missing instead of erroring out.
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists pg_cron;

-- ---------- PROFILES (extends Supabase auth.users) ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null default 'student' check (role in ('student', 'team', 'admin')),
  department text,
  avatar_url text,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  created_at timestamptz default now()
);
alter table profiles add column if not exists status text not null default 'Active';

-- Auto-create a profile row whenever a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- LEARNING PATHS ----------
create table if not exists learning_paths (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  level text not null check (level in ('Beginner', 'Intermediate', 'Advanced')),
  courses int not null default 0,
  created_at timestamptz default now()
);
alter table learning_paths add column if not exists courses int not null default 0;

-- ---------- COURSES (syllabus stored as JSONB: modules -> lessons/quiz) ----------
create table if not exists courses (
  id uuid primary key default uuid_generate_v4(),
  learning_path_id uuid references learning_paths(id) on delete set null,
  title text not null,
  description text,
  level text not null check (level in ('Beginner', 'Intermediate', 'Advanced')),
  modules int default 0,
  icon text default 'Cloud',
  status text not null default 'Draft' check (status in ('Active', 'Draft')),
  thumbnail text,
  category text,
  instructor text,
  duration_hours numeric,
  certificate_enabled boolean default true,
  syllabus jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);
alter table courses add column if not exists thumbnail text;
alter table courses add column if not exists category text;
alter table courses add column if not exists instructor text;
alter table courses add column if not exists duration_hours numeric;
alter table courses add column if not exists certificate_enabled boolean default true;
alter table courses add column if not exists syllabus jsonb not null default '[]'::jsonb;

-- ---------- ENROLLMENTS + PROGRESS + CERTIFICATES ----------
create table if not exists enrollments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  completed_lesson_ids text[] not null default '{}',
  quiz_results jsonb not null default '{}'::jsonb,
  certificate_issued boolean not null default false,
  certificate_issued_at timestamptz,
  certificate_number text,
  enrolled_at timestamptz default now(),
  unique (student_id, course_id)
);
alter table enrollments add column if not exists completed_lesson_ids text[] not null default '{}';
alter table enrollments add column if not exists quiz_results jsonb not null default '{}'::jsonb;
alter table enrollments add column if not exists certificate_issued boolean not null default false;
alter table enrollments add column if not exists certificate_issued_at timestamptz;
alter table enrollments add column if not exists certificate_number text;

-- ---------- EVENTS ----------
create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  type text not null check (type in ('Workshop', 'Hackathon', 'Bootcamp', 'Seminar')),
  description text,
  event_date timestamptz not null,
  mode text not null check (mode in ('Online', 'Onsite', 'Hybrid')),
  venue text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists event_registrations (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  registered_at timestamptz default now(),
  reminder_sent boolean not null default false,
  unique (event_id, student_id)
);
alter table event_registrations add column if not exists reminder_sent boolean not null default false;

-- ---------- RESOURCES ----------
create table if not exists resources (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  type text not null check (type in ('PDF','DOC','PPT','XLS','Image','Video','Audio','ZIP','Text','Markdown','Link')),
  file_url text,
  size_label text,
  thumbnail text,
  course_id uuid references courses(id) on delete cascade,
  module_id text,
  visibility text not null default 'Public' check (visibility in ('Enrolled Students', 'Public')),
  download_allowed boolean not null default true,
  preview_allowed boolean not null default true,
  uploaded_by uuid references profiles(id),
  downloads int not null default 0,
  views int not null default 0,
  created_at timestamptz default now()
);
alter table resources add column if not exists description text;
alter table resources add column if not exists thumbnail text;
alter table resources add column if not exists course_id uuid references courses(id) on delete cascade;
alter table resources add column if not exists module_id text;
alter table resources add column if not exists visibility text not null default 'Public';
alter table resources add column if not exists download_allowed boolean not null default true;
alter table resources add column if not exists preview_allowed boolean not null default true;
alter table resources add column if not exists downloads int not null default 0;
alter table resources add column if not exists views int not null default 0;
-- widen the old v1 type check (PDF/Video/Slides/GitHub/Lab) to the full set the app actually uses
alter table resources drop constraint if exists resources_type_check;
alter table resources add constraint resources_type_check
  check (type in ('PDF','DOC','PPT','XLS','Image','Video','Audio','ZIP','Text','Markdown','Link'));

-- ---------- REVIEWS ----------
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references courses(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  user_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- ---------- NOTIFICATIONS ----------
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  message text,
  type text not null default 'system' check (type in ('resource','course','certificate','event','review','system')),
  link text,
  is_read boolean not null default false,
  created_at timestamptz default now()
);
alter table notifications add column if not exists type text not null default 'system';
alter table notifications add column if not exists link text;

-- ---------- SITE SETTINGS (singleton row) ----------
create table if not exists site_settings (
  id boolean primary key default true,
  hero_title text not null default 'Learn AWS Cloud. Build. Innovate.',
  hero_description text not null default 'A community of student builders growing their cloud computing skills.',
  contact_email text default 'hello@awssbg.com',
  contact_phone text default '',
  stat_members text default '0',
  stat_events text default '0',
  stat_certificates text default '0',
  stat_projects text default '0',
  constraint site_settings_singleton check (id)
);
insert into site_settings (id) values (true) on conflict (id) do nothing;

-- ---------- CONTACT MESSAGES (public contact form) ----------
create table if not exists contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz default now()
);

-- Drop the old, redundant standalone certificates table from v1 if present —
-- certificates now live directly on the enrollments row (certificate_issued,
-- certificate_issued_at, certificate_number), matching the app's data model.
drop table if exists certificates;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table courses enable row level security;
alter table learning_paths enable row level security;
alter table enrollments enable row level security;
alter table events enable row level security;
alter table event_registrations enable row level security;
alter table resources enable row level security;
alter table reviews enable row level security;
alter table notifications enable row level security;
alter table site_settings enable row level security;
alter table contact_messages enable row level security;

-- Helper predicates used across policies below (team or admin)
create or replace function public.is_staff()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role in ('team', 'admin')
  );
$$ language sql security definer stable;

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Drop-then-recreate every policy so this script is fully re-runnable
drop policy if exists "Public read courses" on courses;
drop policy if exists "Staff manage courses" on courses;
drop policy if exists "Staff update courses" on courses;
drop policy if exists "Staff delete courses" on courses;
create policy "Public read courses" on courses for select using (status = 'Active' or public.is_staff());
create policy "Staff manage courses" on courses for insert with check (public.is_staff());
create policy "Staff update courses" on courses for update using (public.is_staff());
create policy "Staff delete courses" on courses for delete using (public.is_staff());

drop policy if exists "Public read learning paths" on learning_paths;
drop policy if exists "Staff manage learning paths" on learning_paths;
create policy "Public read learning paths" on learning_paths for select using (true);
create policy "Staff manage learning paths" on learning_paths for all using (public.is_staff());

drop policy if exists "Public read events" on events;
drop policy if exists "Staff manage events" on events;
create policy "Public read events" on events for select using (true);
create policy "Staff manage events" on events for all using (public.is_staff());

drop policy if exists "Public read resources" on resources;
drop policy if exists "Staff manage resources" on resources;
create policy "Public read resources" on resources for select using (
  visibility = 'Public' or public.is_staff() or
  exists (select 1 from enrollments where course_id = resources.course_id and student_id = auth.uid())
);
create policy "Staff manage resources" on resources for all using (public.is_staff());

drop policy if exists "Public read reviews" on reviews;
drop policy if exists "Students insert own reviews" on reviews;
drop policy if exists "Students delete own reviews" on reviews;
create policy "Public read reviews" on reviews for select using (true);
create policy "Students insert own reviews" on reviews for insert with check (auth.uid() = student_id);
create policy "Students delete own reviews" on reviews for delete using (auth.uid() = student_id or public.is_staff());

drop policy if exists "Public read site settings" on site_settings;
drop policy if exists "Staff update site settings" on site_settings;
create policy "Public read site settings" on site_settings for select using (true);
create policy "Staff update site settings" on site_settings for update using (public.is_staff());

drop policy if exists "Anyone can submit contact form" on contact_messages;
drop policy if exists "Staff read contact messages" on contact_messages;
create policy "Anyone can submit contact form" on contact_messages for insert with check (true);
create policy "Staff read contact messages" on contact_messages for select using (public.is_staff());

-- Profiles: users see/update their own row; staff can see & manage everyone
drop policy if exists "Users read own profile" on profiles;
drop policy if exists "Users update own profile" on profiles;
create policy "Users read own profile" on profiles for select using (auth.uid() = id or public.is_staff());
create policy "Users update own profile" on profiles for update using (auth.uid() = id or public.is_admin());

-- Enrollments: students manage their own; staff can see/manage all (admin
-- dashboards, unenroll, revoke/reissue certificates)
drop policy if exists "Students read own enrollments" on enrollments;
drop policy if exists "Students insert own enrollments" on enrollments;
drop policy if exists "Students update own enrollments" on enrollments;
drop policy if exists "Staff delete enrollments" on enrollments;
create policy "Students read own enrollments" on enrollments for select using (auth.uid() = student_id or public.is_staff());
create policy "Students insert own enrollments" on enrollments for insert with check (auth.uid() = student_id);
create policy "Students update own enrollments" on enrollments for update using (auth.uid() = student_id or public.is_staff());
create policy "Staff delete enrollments" on enrollments for delete using (public.is_staff());

-- Event registrations: students manage their own; staff can see all
drop policy if exists "Students read own registrations" on event_registrations;
drop policy if exists "Students insert own registrations" on event_registrations;
drop policy if exists "Students delete own registrations" on event_registrations;
create policy "Students read own registrations" on event_registrations for select using (auth.uid() = student_id or public.is_staff());
create policy "Students insert own registrations" on event_registrations for insert with check (auth.uid() = student_id);
create policy "Students delete own registrations" on event_registrations for delete using (auth.uid() = student_id or public.is_staff());

-- Notifications: users see/update only their own; staff (or the cron job,
-- which runs as security definer and bypasses RLS entirely) can insert
drop policy if exists "Users read own notifications" on notifications;
drop policy if exists "Users update own notifications" on notifications;
drop policy if exists "Staff insert notifications" on notifications;
create policy "Users read own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on notifications for update using (auth.uid() = user_id);
create policy "Staff insert notifications" on notifications for insert with check (auth.uid() = user_id or public.is_staff());

-- ============================================================
-- GRANTS
-- RLS policies above are the actual gatekeeper of who-sees-what, but
-- Postgres requires a base privilege grant before RLS is even evaluated.
-- Tables created via the Dashboard's table UI get this automatically;
-- tables created via raw SQL (like this script) do not — without this
-- block, PostgREST rejects every request with 403 regardless of RLS.
-- ============================================================
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant usage, select on all sequences in schema public to anon, authenticated;

-- ============================================================
-- STORAGE (files uploaded from Dashboard → Resources, and avatars)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('resources', 'resources', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Public read resource files" on storage.objects;
create policy "Public read resource files" on storage.objects for select using (bucket_id = 'resources');
drop policy if exists "Staff upload resource files" on storage.objects;
create policy "Staff upload resource files" on storage.objects for insert with check (bucket_id = 'resources' and public.is_staff());
drop policy if exists "Staff update resource files" on storage.objects;
create policy "Staff update resource files" on storage.objects for update using (bucket_id = 'resources' and public.is_staff());
drop policy if exists "Staff delete resource files" on storage.objects;
create policy "Staff delete resource files" on storage.objects for delete using (bucket_id = 'resources' and public.is_staff());

drop policy if exists "Public read avatars" on storage.objects;
create policy "Public read avatars" on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists "Users upload own avatar" on storage.objects;
create policy "Users upload own avatar" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid() is not null);

-- ============================================================
-- DATE-TRIGGERED EVENT REMINDERS — real background job (pg_cron)
-- Runs INSIDE Supabase's Postgres every 15 minutes, independent of whether
-- the site/browser is open. It notifies every registered student once,
-- 24 hours before an event's start time.
-- ============================================================
create or replace function public.send_event_reminders()
returns void as $$
begin
  insert into notifications (user_id, title, message, type, link)
  select
    er.student_id,
    'Reminder: ' || e.title || ' is coming up',
    'Starts ' || to_char(e.event_date, 'FMDay, FMMonth FMDDth at HH12:MI AM') || ' (' || e.mode || ').',
    'event',
    '/dashboard/student/events'
  from event_registrations er
  join events e on e.id = er.event_id
  where er.reminder_sent = false
    and e.event_date > now()
    and e.event_date <= now() + interval '24 hours';

  update event_registrations er
  set reminder_sent = true
  from events e
  where er.event_id = e.id
    and er.reminder_sent = false
    and e.event_date > now()
    and e.event_date <= now() + interval '24 hours';
end;
$$ language plpgsql security definer;

select cron.unschedule('event-reminders') where exists (
  select 1 from cron.job where jobname = 'event-reminders'
);
select cron.schedule('event-reminders', '*/15 * * * *', 'select public.send_event_reminders();');
