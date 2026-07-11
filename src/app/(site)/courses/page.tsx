"use client";

import { useState } from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import { CourseCard } from "@/components/CourseCard";
import { useData } from "@/context/DataContext";

const tabs = ["All", "Beginner", "Intermediate", "Advanced"] as const;

export default function CoursesPage() {
  const { courses } = useData();
  const [active, setActive] = useState<(typeof tabs)[number]>("All");

  const published = courses.filter((c) => c.status === "Active");
  const filtered = active === "All" ? published : published.filter((c) => c.level === active);

  return (
    <div className="pt-32 pb-20 container-page">
      <SectionHeading eyebrow="Learning Paths" title="Our learning paths" description="Choose a path and start your cloud journey today." />

      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              active === tab
                ? "bg-navy text-white shadow-lift"
                : "bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark text-paragraph-light dark:text-paragraph-dark hover:border-orange hover:text-orange"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-14 text-center text-paragraph-light dark:text-paragraph-dark">
          No courses published yet — check back soon.
        </p>
      )}

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((c, i) => (
          <Link key={c.id} href={`/courses/${c.id}`} className="block">
            <CourseCard course={c} index={i} />
          </Link>
        ))}
      </div>
    </div>
  );
}
