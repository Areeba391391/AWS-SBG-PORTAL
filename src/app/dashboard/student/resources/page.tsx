"use client";

import { ResourceCard } from "@/components/ResourceCard";
import { useData } from "@/context/DataContext";
import { useEnrollment } from "@/context/EnrollmentContext";

export default function StudentResourcesPage() {
  const { resources, courses } = useData();
  const { myEnrollments } = useEnrollment();

  const enrolledCourseIds = myEnrollments().map((e) => e.courseId);
  const groups = courses
    .filter((c) => enrolledCourseIds.includes(c.id))
    .map((c) => ({ course: c, items: resources.filter((r) => r.courseId === c.id) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-heading-light dark:text-heading-dark">Resources</h1>
        <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-1">
          Notes, slides, videos, and materials from the courses you're enrolled in.
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="card-surface p-10 text-center">
          <p className="text-sm text-paragraph-light dark:text-paragraph-dark">
            {enrolledCourseIds.length === 0
              ? "Enroll in a course to see its resources here."
              : "No downloadable materials have been added to your courses yet."}
          </p>
        </div>
      ) : (
        groups.map(({ course, items }) => (
          <div key={course.id}>
            <h2 className="font-heading font-semibold text-lg text-heading-light dark:text-heading-dark mb-4">{course.title}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((r, i) => (
                <ResourceCard key={r.id} resource={r} index={i} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
