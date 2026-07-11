# Supabase setup (real database — replaces localStorage)

## 1. Run the schema
Supabase Dashboard → SQL Editor → New query → paste the entire contents of
`supabase/schema.sql` → Run.

It's safe to run more than once. It creates every table (profiles, courses,
enrollments, events, event_registrations, resources, reviews, notifications,
site_settings, contact_messages), sets up Row Level Security so students can
only touch their own data while team/admin can see and manage everything,
creates two storage buckets (`resources`, `avatars`), and schedules the
event-reminder job (see step 4).

## 2. Environment variables
Copy `.env.local.example` to `.env.local` and fill in three values from
**Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        <- keep this one secret, server-only
```

The service role key powers `/api/admin/users` (the route that lets an admin
create a teammate's account with a chosen password — the public sign-up flow
can't do that, by design, since only the account owner should set their own
password).

## 3. Auth settings
Supabase Dashboard → Authentication → Providers → Email:
- **Turn OFF "Confirm email"** for this app to work as designed — the
  sign-up form logs the student straight in and redirects to their dashboard.
  If you'd rather require email confirmation, that's fine too, but the
  sign-up flow will show "check your email" instead of an instant redirect.

## 4. Event reminders — how they actually work now
`send_event_reminders()` runs **inside your Supabase Postgres database itself**
via `pg_cron`, every 15 minutes, whether or not anyone has the site open. When
an event is starting within the next 24 hours, every registered student gets
a real notification row, which shows up in their bell icon live (via Supabase
Realtime — no page refresh needed).

This is in-app notifications only, not email — sending real email needs an
email provider (Resend, SendGrid, etc.) and an API key I don't have. If you
want email too: create a Supabase Edge Function that calls your email
provider, and change the `cron.schedule(...)` call at the bottom of
`schema.sql` to also invoke it (e.g. via `pg_net`). Happy to wire that up if
you get a Resend API key — it's a small addition on top of what's here.

## 5. First admin account
Sign up normally through the site (you'll land as a "student"), then in
Supabase Dashboard → Table Editor → `profiles`, change your row's `role` to
`admin`. Every admin account after that can be created properly from
Dashboard → Users.

## What changed, concretely
- **Auth**: real Supabase Auth (`AuthContext.tsx`) — passwords are hashed and
  stored by Supabase, not localStorage.
- **Courses/enrollments/events/resources/reviews/notifications/site
  settings**: all read/written through Supabase (`DataContext.tsx`,
  `EnrollmentContext.tsx`, `EventRegistrationContext.tsx`,
  `crossUserStores.ts`) with Row Level Security enforcing who can see/edit
  what — a student cannot read or modify another student's enrollments,
  certificates, or notifications, even by tampering with the client.
- **File uploads** (`FileUploadInput.tsx`): go to a real Supabase Storage
  bucket and get a real public URL, instead of being base64-encoded into
  localStorage.
- **Event reminders**: a real scheduled job in Postgres (`pg_cron`), not a
  browser timer — it fires even when the site is closed.
- Every other page in the app (courses, dashboard, admin panels, etc.) was
  left untouched — they all call the same context functions as before, which
  now happen to talk to a real database underneath instead of localStorage.

## What I could not verify from my side
I don't have your Supabase project's credentials and my sandbox can't reach
`supabase.co` (network is locked down), so I could not run this end-to-end
against a live database. I did verify the whole app type-checks cleanly
(`tsc --noEmit`, zero errors) against the new data layer, which catches most
integration mistakes, but you should still smoke-test the core flows after
deploying: sign up → enroll in a course → complete a lesson → get a
certificate → register for an event → (wait for/trigger the cron job) → see
the reminder notification. If anything breaks, paste me the exact error and
I'll fix it.
