# Content Guide — AWS SBG Portal

> **What's new in this pass:** courses now have real LMS fields (thumbnail,
> category, instructor, duration, publish/unpublish/duplicate), resources
> belong to *modules* and support PDF/DOC/PPT/XLS/images/video/audio/ZIP/
> text/markdown/links with view+download tracking, there's a real
> Enrollment Management screen (search/filter/remove/export), certificates
> now carry a certificate number + scannable QR code, there's a working
> notification bell, and a global search bar in the admin dashboard.
>
> **Honest caveat:** everything still runs on the browser's localStorage,
> not a real database — see § 7. A few items from a full production LMS
> spec are intentionally not built yet because they need that real backend
> first (or are marked optional): Assignments, date-triggered event-reminder
> notifications, and in-browser preview of Office files (DOC/PPT/XLS open
> via download, same as most real LMS platforms do without a conversion
> service). Everything else in the spec is implemented and working.

This file explains where the *sample* data currently living in the app lives,
and exactly how to replace it with your real content. **You do not need to
edit any code for any of this** — it's all done from inside the app itself,
through the Admin dashboard.

## 1. How to get into the Admin dashboard

1. Go to `/login`.
2. Sign in with the bootstrap admin account:
   - Email: `admin@awssbg.com`
   - Password: `ChangeMe123`
3. You'll land on `Dashboard → Admin`.
4. **First thing to do:** go to `Dashboard → Admin → Settings` (or Users) and
   change this password / add your own real admin accounts, then stop using
   the bootstrap one day-to-day.

Every other account (team members, other admins, students) is created either
by someone signing up on `/register`, or by an admin adding them from
`Dashboard → Admin → Users`. Nothing is hardcoded.

## 2. Replacing course content (modules, lessons, quizzes, materials)

Go to `Dashboard → Admin → Courses & Resources`.

- Click the **list icon** next to a course ("Manage Content") to open its editor. This one screen now has everything for that course:
  - **Enrolled Students** — who's taken it and their status (In Progress / Completed)
  - **Course Materials** — upload real files (images, videos, PDFs, slides, documents) or paste a URL; students see these as downloadable materials inside the course
  - **Modules → Lessons → Quiz** — same as before

- Add a **Module** (a section of the course).
- Inside a module, add **Lessons**. Each lesson has a type:
  - `Reading` — plain text, shown directly in the course.
  - `Video` — paste a YouTube/Vimeo **embed** URL, e.g.
    `https://www.youtube.com/embed/VIDEO_ID`. It plays inside the course —
    students are never sent to an external site.
  - `Lab` — write one instruction per line; it renders as a numbered,
    solvable checklist inside the app. There is nothing to download.
- Add **Quiz questions** to the module — multiple choice, pick the correct
  answer. Students must pass the quiz (default 60%) for that module to count
  toward completion.

Every course currently ships with one **sample module** so you can see the
whole flow working end-to-end (enroll → lesson → lab → quiz → certificate →
review prompt). Delete the sample module and add your real one the same way,
or just edit it in place — both work.

A student's progress bar, "Completed" count, and certificate are all
calculated automatically from what they've actually completed. A brand-new
student always starts at 0% — nothing is faked.

## 3. Replacing events, and reviewing/moderating student reviews

- `Dashboard → Admin → Events` — add/edit/delete workshops, hackathons, etc.
  Click the people-count badge on any event to see who registered.
- `Dashboard → Admin → Reviews` — every review a student leaves after
  finishing a course lands here. The most recent ones automatically show as
  testimonials on the homepage. Delete any you don't want shown.
- `Dashboard → Admin → Learning Paths` — same CRUD pattern (add/edit/delete).

There is no separate "Departments" section anymore — it wasn't needed and
has been removed.

## 4. Replacing homepage text and stat counters

Go to `Dashboard → Admin → Website CMS`. You can edit:

- Hero title & description
- Contact email & phone (shown on the Contact page)
- The four homepage stat counters (Members / Events / Certificates /
  Projects) — these start at **0**, not a made-up number. Update them
  yourself as your real numbers grow.

Changes save immediately and show up on the public site right away.

## 5. Your founding team / "About" page

The "Meet the Team" section on `/about` is **not hardcoded**. It
automatically shows every account registered with the **Team** or **Admin**
role. To add yourself and your co-founders:

1. `Dashboard → Admin → Users → Add User`
2. Set their role to `Team` (or `Admin` if they need dashboard access).
3. They now appear on the public About page automatically — no code edits,
   no placeholder names like "Wajahat Ali" or "Ali Khan" left behind.

The homepage testimonials section still has **placeholder** quotes clearly
labeled as samples (`"Sample testimonial"`) — swap in real student quotes
once you have them the same way, from the file
`src/app/(site)/page.tsx` (this one piece isn't in the CMS yet since it's
free-form testimonial text rather than structured data).

## 6. Where to put images

Put any new image file directly in:

```
public/images/your-file-name.png
```

Then reference it in the app as:

```
/images/your-file-name.png
```

Existing images already used by the site (replace these files with your own
using the *same filenames* to update them without touching any code):

| File | Used for |
|---|---|
| `public/images/banner-hero.png` | Homepage hero illustration |
| `public/images/banner-team.png` | About page illustration |
| `public/images/banner-mountain.png` | Section background |
| `public/images/icon-learning.png` | Feature icon |
| `public/images/icon-build.png` | Feature icon |
| `public/images/icon-community.png` | Feature icon |
| `public/images/icon-certificates.png` | Feature icon |
| `public/images/icon-support.png` | Feature icon |
| `public/favicon.ico` | Browser tab icon |

**Course materials (PDFs, slides, videos, images) are different** — you
don't touch the `public/images` folder for these. Upload them directly from
`Dashboard → Admin → Courses & Resources → Manage Content → Course
Materials` (or `Dashboard → Team → Resources`), using the **Upload File**
button. A couple of things to know about this:

- Files are stored as part of the app's data (in the browser, for now — see
  the storage note below), so keep individual files small (a few MB) —
  large videos will be slow. For big videos, use **Paste URL** instead and
  point to a YouTube/Vimeo link.
- Resources are **not public** anymore — they only show up inside a course
  for students who are enrolled in it. This was a deliberate change so
  random visitors can't download your course materials without an account.

## 7. Current data storage (important — read this)

Right now the whole app (users, courses, enrollments, everything) is stored
in the browser's **localStorage**, per the existing README. This means:

- It works fully today for testing, demos, and even real use on one device.
- Data does **not** sync between different devices/browsers yet — if you
  open the site on your phone and your laptop, they'll have separate data.
- Browsers cap localStorage at roughly 5–10 MB total, and uploaded course
  files count against that. Fine for a handful of PDFs/slides; not fine for
  many large videos — use YouTube/Vimeo links for those instead (see § 6).
- A Supabase schema is already included (`supabase/schema.sql`) for the next
  step, which is connecting a real shared database (with real file storage
  for uploads) so everyone sees the same data everywhere, from any device,
  with no size worries. Ask me when you're ready for that step — it's a
  separate, contained piece of work, and worth doing soon now that file
  uploads are part of the app.

## 8. One site, not two

The public website (home, courses, about, contact) and the student/team/
admin dashboards are **one single application** — the same Next.js project,
the same deployment, the same domain. There's no separate "real site" you'll
lose access to; the dashboard *is* part of the site, just behind login.
