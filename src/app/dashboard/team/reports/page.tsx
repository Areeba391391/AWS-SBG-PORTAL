"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/StatCard";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { Users, BookOpen, Award, CalendarDays } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Course } from "@/types";
import { readAllEnrollments } from "@/lib/crossUserStores";

interface Enrollment {
  courseId: string;
  completedLessonIds: string[];
  quizResults: Record<string, { passed: boolean }>;
  certificateIssued: boolean;
}

function courseCompletionRate(course: Course, allEnrollments: Enrollment[]): number {
  const enrolledFor = allEnrollments.filter((e) => e.courseId === course.id);
  if (enrolledFor.length === 0) return 0;
  const totalUnits = course.syllabus.reduce((sum, m) => sum + m.lessons.length, 0) + course.syllabus.filter((m) => m.quiz.length > 0).length;
  if (totalUnits === 0) return 0;
  const avg =
    enrolledFor.reduce((sum, e) => {
      const doneLessons = course.syllabus.reduce((s, m) => s + m.lessons.filter((l) => e.completedLessonIds.includes(l.id)).length, 0);
      const doneQuizzes = course.syllabus.filter((m) => m.quiz.length > 0 && e.quizResults[m.id]?.passed).length;
      return sum + (doneLessons + doneQuizzes) / totalUnits;
    }, 0) / enrolledFor.length;
  return Math.round(avg * 100);
}

export default function TeamReportsPage() {
  const { courses, events } = useData();
  const { users } = useAuth();
  const totalStudents = users.filter((u) => u.role === "student").length;

  const [allEnrollments, setAllEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    readAllEnrollments().then((store) => setAllEnrollments(Object.values(store).flat()));
  }, []);

  const certificatesIssued = allEnrollments.filter((e) => e.certificateIssued).length;

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-heading-light dark:text-heading-dark">Reports</h1>
        <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-1">
          Real, live numbers computed from actual student activity — nothing here is hardcoded.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={Users} label="Total Students" value={totalStudents} accent="blue" index={0} />
        <StatCard icon={BookOpen} label="Courses Offered" value={courses.length} accent="orange" index={1} />
        <StatCard icon={CalendarDays} label="Events Held" value={events.length} accent="green" index={2} />
        <StatCard icon={Award} label="Certificates Issued" value={certificatesIssued} accent="purple" index={3} />
      </div>

      <div className="card-surface p-6 space-y-5">
        <h3 className="font-heading font-semibold text-heading-light dark:text-heading-dark">Average course completion</h3>
        {courses.length === 0 ? (
          <p className="text-sm text-paragraph-light dark:text-paragraph-dark">No courses yet.</p>
        ) : (
          courses.map((c) => <ProgressBar key={c.id} value={courseCompletionRate(c, allEnrollments)} label={c.title} />)
        )}
      </div>
    </div>
  );
}
