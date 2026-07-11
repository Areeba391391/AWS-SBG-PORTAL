# AWS Student Builders Group (AWS SBG) — Portal

A complete, functional web portal for the AWS Student Builders Group community —
public website + role-based dashboards (Student, Team, Master Admin) — built with
**Next.js 14, TypeScript, Tailwind CSS, Supabase, and Framer Motion**. Supports full
light/dark mode and is designed to deploy entirely on **Vercel + Supabase** (no AWS
DynamoDB, no servers to manage, no bills).

---

## 1. Tech Stack

| Technology       | Purpose                          |
|-------------------|-----------------------------------|
| Next.js 14 (App Router) | Frontend + Backend (Server Actions/Routes) |
| TypeScript        | Type safety                       |
| Tailwind CSS       | Styling                           |
| Framer Motion      | Animations & transitions          |
| Supabase           | Auth + Database (Postgres)        |
| Vercel             | Deployment                        |
| Lucide React        | Icons                             |
| React Hook Form + Zod | Forms & validation             |
| Recharts            | Admin dashboard charts            |
| next-themes          | Light / Dark mode                 |

---

## 2. Project Structure

```
aws-sbg-portal/
├── public/
│   └── images/                 # Logos, banners, icons (from your assets)
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout (fonts + ThemeProvider)
│   │   ├── globals.css          # Global styles, color tokens, utility classes
│   │   ├── (site)/              # Public website (shares Navbar + Footer)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Homepage
│   │   │   ├── about/
│   │   │   ├── courses/
│   │   │   ├── events/
│   │   │   ├── resources/
│   │   │   ├── contact/
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── dashboard/
│   │       ├── student/          # Student dashboard + sub-pages
│   │       ├── team/             # Team dashboard + sub-pages
│   │       └── admin/            # Master Admin dashboard + sub-pages
│   ├── components/               # Navbar, Footer, cards, sections, etc.
│   │   └── dashboard/            # Sidebar, MobileTopbar, ProgressBar
│   ├── context/
│   │   └── ThemeProvider.tsx     # next-themes wrapper (light/dark)
│   ├── lib/
│   │   └── supabase/             # client.ts (browser) + server.ts (server)
│   ├── data/
│   │   └── mock.ts               # Placeholder data (swap for Supabase queries)
│   └── types/
│       └── index.ts              # Shared TypeScript types
├── supabase/
│   └── schema.sql                # Full database schema + Row Level Security
├── .env.local.example            # Copy to .env.local and fill in
├── tailwind.config.ts            # Color palette, fonts, animations
└── package.json
```

---

## 3. Website & System Flow

```
                         ┌────────────────────┐
                         │      Visitor        │
                         └─────────┬───────────┘
                                   │
                Explore Website (Home / About / Courses / Events / Resources)
                                   │
                          Sign Up / Login
                                   │
                       ┌───────────┴───────────┐
                       │   Role-Based Access     │
                       └───────────┬───────────┘
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                     ▼
        STUDENT DASH          TEAM DASH             MASTER ADMIN DASH
   • Enrolled Courses    • Manage Courses        • Full System Access
   • Track Progress      • Upload Resources      • Manage Users / Roles
   • Certificates        • Manage Events         • Manage Departments
   • Download Resources  • View Reports          • Website CMS
   • Join Events                                  • Analytics & Reports


   Frontend (Next.js, Vercel)  ⇄  Supabase (Auth + Postgres DB, Storage)
   • Website + Dashboards           • profiles, courses, events, resources
     deployed together                certificates, enrollments, notifications
   • Communicates via Supabase      • Row Level Security enforces permissions
     JS client (HTTPS/REST only —
     no SSH/HTTP ports required,
     so it works cleanly behind
     Vercel's network)
```

**Why Supabase instead of DynamoDB:** Supabase is reached entirely over HTTPS via
its REST/JS client, so it works cleanly when deployed on Vercel. This keeps the
whole system deployable as a single Next.js app with no separate backend to run,
no extra hosting bills, and fast response times.

---

## 4. How Login & Access Control Works (Important)

To make the whole app immediately testable **without requiring a Supabase
project first**, authentication currently runs on a lightweight demo layer
(`src/context/AuthContext.tsx`) that stores accounts in your browser's
`localStorage`. This is intentional so you can test every flow right away —
and it's admin-driven rather than hard-coded:

- **Sign Up** (public) always creates a `student` account and logs you in.
- **Login** checks the email/password against real accounts — either
  self-registered students, or accounts created by an admin.
- **Team and Admin accounts are not self-serve.** There is exactly **one
  bootstrap admin account** seeded so the first person can get in and take it
  from there (see below). Every other Team or Admin account must be created —
  or a Student promoted — from **Dashboard → Users**, which only the Master
  Admin can access. Team members cannot create accounts or change anyone's
  role; that page simply isn't in their sidebar.
- **Courses** require login — visiting `/courses/[id]` shows a locked syllabus
  with "Sign Up" / "Login" buttons until you're signed in.
- **Dashboards** (`/dashboard/student`, `/dashboard/team`, `/dashboard/admin`)
  are protected — visiting one while logged out redirects you to `/login` and
  brings you back afterward. Visiting the wrong role's dashboard redirects you
  to your own.
- **Navbar** shows "Login" + "Sign Up" when logged out, and your avatar with a
  "My Dashboard" / "Logout" menu when logged in.

**Bootstrap admin account (first login only):**

| Email              | Password      |
|----------------------|----------------|
| admin@awssbg.com     | ChangeMe123    |

Log in with this once, then go to **Dashboard → Users** and:
1. Change this account's password by re-adding it, or just create your real
   admin account and delete this one (the app always keeps at least one
   admin, so you can't accidentally lock yourself out).
2. Add your actual team members there, picking their role (Student / Team /
   Admin) and a temporary password to share with them.

This whole flow is genuinely dynamic — the Users table you see in the admin
panel **is** the real login list, not a separate mock. Promoting a student to
`team` there means they get Team dashboard access the next time they log in.

**Courses, Events, and Resources are dynamic too** (`src/context/DataContext.tsx`):
anything an Admin or Team member adds, edits, or deletes from their dashboard
shows up immediately on the public website and in every dashboard that reads
it — no separate "public" vs "dashboard" data to keep in sync. A course
marked "Draft" stays hidden from the public course catalog until switched to
"Active".

When you're ready to connect the real backend, follow steps 5–7 below to wire
up Supabase — the `lib/supabase/client.ts` / `server.ts` helpers and
`supabase/schema.sql` are ready to go, and swapping `AuthContext` /
`DataContext` to call Supabase instead of `localStorage` is a contained
change in those two files.

## 5. Supabase Setup (For Connecting Real Backend + API Keys)

### Step 1 — Install prerequisites
- Install **Node.js 18+** from https://nodejs.org
- Install **VS Code** (or any code editor)
- Create a free account at https://supabase.com

### Step 2 — Unzip and install dependencies
```bash
cd aws-sbg-portal
npm install
```

### Step 3 — Create your Supabase project
1. Go to https://supabase.com/dashboard → **New Project**
2. Once created, go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon public` key

### Step 4 — Set up environment variables
```bash
cp .env.local.example .env.local
```
Open `.env.local` and paste your values:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### Step 5 — Create the database tables
1. In Supabase, open **SQL Editor → New Query**
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run** — this creates all tables, the auto-profile trigger, and Row Level
   Security policies in one go.

### Step 6 — Run the app locally
```bash
npm run dev
```
Visit **http://localhost:3000**

### Step 7 — Try it out (with the current demo auth layer)
- Register a new account at `/register` — it becomes a `student` immediately.
- Login with the bootstrap admin account above, then go to **Dashboard →
  Users** to create your real Team and Admin accounts.

---

## 5. Deploying to Vercel

1. Push this project to a GitHub repository.
2. Go to https://vercel.com → **New Project** → import your repo.
3. Add the same two environment variables from `.env.local` in
   **Vercel → Project Settings → Environment Variables**.
4. Click **Deploy**. That's it — no servers, no extra config.

---

## 6. Design System

| Token              | Value      |
|---------------------|------------|
| Primary (AWS Navy)   | `#232F3E`  |
| Secondary (AWS Orange) | `#FF9900` |
| Accent (AWS Blue)     | `#146EB4`  |
| Background (light)     | `#F8FAFC`  |
| Background (dark)      | `#0B1220`  |
| Heading font          | Poppins    |
| Body font             | Inter      |
| Numbers font          | Manrope    |

Dark mode is powered by `next-themes` with the `class` strategy — toggle it via the
sun/moon icon in the navbar or any dashboard sidebar. All colors, cards, and
buttons automatically adapt.

---

## 7. Replacing Mock Data with Real Supabase Data

Every dashboard/website page currently reads from `src/data/mock.ts` so the UI
works immediately without any setup. Once your Supabase tables have real data,
swap a mock import for a live query, e.g.:

```ts
// Before (mock data)
import { courses } from "@/data/mock";

// After (live Supabase data) — inside a Server Component
import { createClient } from "@/lib/supabase/server";

const supabase = createClient();
const { data: courses } = await supabase.from("courses").select("*");
```

Every component (`CourseCard`, `EventCard`, `ResourceCard`, etc.) already expects
the exact same shape defined in `src/types/index.ts`, so no component code needs
to change — only the data source.

---

## 8. What's Included

- ✅ Fully responsive public website (Home, About, Courses, Events, Resources, Contact, Login, Register)
- ✅ Working demo authentication with **one bootstrap admin account** — every other Team/Admin account is created from Dashboard → Users, not hard-coded
- ✅ Course detail pages gated behind login — students must sign up/login before accessing syllabus content
- ✅ Protected dashboard routes — logged-out users are redirected to Login and returned afterward
- ✅ Student, Team, and Master Admin dashboards with working sub-pages
- ✅ Real, admin-managed Users CRUD — promoting/demoting a role here immediately changes that person's dashboard access; Team members cannot manage users or roles (Admin-only)
- ✅ Fully dynamic Courses, Events, Resources, Departments, and Learning Paths — anything added/edited/deleted in a dashboard reflects instantly on the public site and every other dashboard
- ✅ Light & dark mode across the entire app, including a fixed navbar contrast bug on the transparent hero
- ✅ Hover animations, page-load animations, animated progress bars & charts
- ✅ Complete Supabase schema with Row Level Security, ready for when you connect the real backend
- ✅ Production-ready Tailwind design system matching the AWS color palette


