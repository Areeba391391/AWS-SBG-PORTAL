"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, BookOpen, FileText, Users, CalendarDays, Star, Award, X } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

interface Result {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  icon: typeof Search;
}

export function GlobalSearch() {
  const { courses, resources, events, reviews } = useData();
  const { users } = useAuth();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const results: Result[] = useMemo(() => {
    if (q.trim().length < 2) return [];
    const query = q.toLowerCase();
    const out: Result[] = [];

    courses.forEach((c) => {
      if (c.title.toLowerCase().includes(query)) {
        out.push({ id: c.id, label: c.title, sublabel: "Course", href: `/dashboard/admin/courses/${c.id}/content`, icon: BookOpen });
      }
      c.syllabus.forEach((m) => {
        if (m.title.toLowerCase().includes(query)) {
          out.push({ id: m.id, label: m.title, sublabel: `Module in ${c.title}`, href: `/dashboard/admin/courses/${c.id}/content`, icon: BookOpen });
        }
      });
    });

    resources.forEach((r) => {
      if (r.title.toLowerCase().includes(query)) {
        const course = courses.find((c) => c.id === r.courseId);
        out.push({ id: r.id, label: r.title, sublabel: course ? `Resource in ${course.title}` : "Resource", href: course ? `/dashboard/admin/courses/${course.id}/content` : "/dashboard/admin/courses", icon: FileText });
      }
    });

    users.forEach((u) => {
      if (u.fullName.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)) {
        out.push({ id: u.id, label: u.fullName, sublabel: `${u.role} · ${u.email}`, href: "/dashboard/admin/users", icon: Users });
      }
    });

    events.forEach((e) => {
      if (e.title.toLowerCase().includes(query)) {
        out.push({ id: e.id, label: e.title, sublabel: "Event", href: "/dashboard/admin/events", icon: CalendarDays });
      }
    });

    reviews.forEach((r) => {
      if (r.comment.toLowerCase().includes(query) || r.userName.toLowerCase().includes(query)) {
        out.push({ id: r.id, label: `${r.userName}'s review`, sublabel: "Review", href: "/dashboard/admin/reviews", icon: Star });
      }
    });

    return out.slice(0, 15);
  }, [q, courses, resources, users, events, reviews]);

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-paragraph-light dark:text-paragraph-dark" />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search courses, students, events, resources..."
        className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-navy-light pl-10 pr-9 py-2.5 text-sm outline-none focus:border-orange"
      />
      {q && (
        <button onClick={() => { setQ(""); setOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-paragraph-light dark:text-paragraph-dark">
          <X className="h-4 w-4" />
        </button>
      )}

      {open && q.trim().length >= 2 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-12 z-50 max-h-96 overflow-y-auto rounded-2xl bg-white dark:bg-navy-light shadow-xl border border-border-light dark:border-border-dark">
            {results.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-paragraph-light dark:text-paragraph-dark">No matches for "{q}".</p>
            ) : (
              results.map((r) => {
                const Icon = r.icon;
                return (
                  <Link
                    key={`${r.sublabel}-${r.id}`}
                    href={r.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0 border-border-light dark:border-border-dark hover:bg-orange/5"
                  >
                    <Icon className="h-4 w-4 text-orange flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-heading-light dark:text-heading-dark truncate">{r.label}</p>
                      <p className="text-[11px] text-paragraph-light dark:text-paragraph-dark truncate">{r.sublabel}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
