"use client";

import Link from "next/link";
import { CourseCard } from "@/components/CourseCard";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { useData } from "@/context/DataContext";
import { useEnrollment } from "@/context/EnrollmentContext";

export default function StudentCoursesPage() {
  const { courses } = useData();
  const { myEnrollments, getCourseProgress } = useEnrollment();
  const published = courses.filter((c) => c.status === "Active");

  const enrollments = myEnrollments();
  const enrolledCourses = enrollments
    .map((e) => published.find((c) => c.id === e.courseId))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const notEnrolled = published.filter((c) => !enrollments.some((e) => e.courseId === c.id));

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-heading-light dark:text-heading-dark">My Courses</h1>
        <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-1">
          Track progress and jump back into your enrolled courses.
        </p>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="card-surface p-8 text-center">
          <p className="text-sm text-paragraph-light dark:text-paragraph-dark">
            You haven't enrolled in any course yet. Explore below and enroll to start tracking real progress.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((c) => (
            <Link key={c.id} href={`/dashboard/student/learn/${c.id}`} className="card-surface hover-lift p-6 block">
              <h3 className="font-heading font-semibold text-heading-light dark:text-heading-dark">{c.title}</h3>
              <p className="text-xs text-paragraph-light dark:text-paragraph-dark mt-1 mb-4">{c.level} · {c.modules} Modules</p>
              <ProgressBar value={getCourseProgress(c)} label="Progress" />
            </Link>
          ))}
        </div>
      )}

      {notEnrolled.length > 0 && (
        <div>
          <h2 className="font-heading font-semibold text-lg text-heading-light dark:text-heading-dark mb-5">
            Explore more learning paths
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {notEnrolled.map((c, i) => (
              <Link key={c.id} href={`/courses/${c.id}`} className="block">
                <CourseCard course={c} index={i} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
