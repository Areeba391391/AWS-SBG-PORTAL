"use client";

import Link from "next/link";
import { BookOpen, Award, CalendarClock, FolderOpen } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { EventCard } from "@/components/EventCard";
import { ResourceCard } from "@/components/ResourceCard";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useEnrollment } from "@/context/EnrollmentContext";

export default function StudentDashboardPage() {
  const { events, resources, courses } = useData();
  const { user } = useAuth();
  const { myEnrollments, getCourseProgress, stats } = useEnrollment();
  const firstName = user?.fullName.split(" ")[0] ?? "there";

  const enrollments = myEnrollments();
  const enrolledCourses = enrollments
    .map((e) => courses.find((c) => c.id === e.courseId))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-heading-light dark:text-heading-dark">
          Hello {firstName} 👋
        </h1>
        <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-1">
          Keep learning, keep building.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={BookOpen} label="In Progress" value={stats.inProgress} accent="blue" index={0} />
        <StatCard icon={Award} label="Completed" value={stats.completed} accent="green" index={1} />
        <StatCard icon={Award} label="Certificates" value={stats.certificates} accent="orange" index={2} />
        <StatCard icon={CalendarClock} label="Upcoming Events" value={events.length} accent="purple" index={3} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-surface p-6">
          <h3 className="font-heading font-semibold text-heading-light dark:text-heading-dark mb-5">
            Learning Progress
          </h3>
          {enrolledCourses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-paragraph-light dark:text-paragraph-dark">
                You haven't enrolled in any course yet.
              </p>
              <Link href="/courses" className="text-orange font-semibold text-sm mt-3 inline-block">
                Browse courses →
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {enrolledCourses.map((c) => (
                <Link key={c.id} href={`/dashboard/student/learn/${c.id}`} className="block">
                  <ProgressBar value={getCourseProgress(c)} label={c.title} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card-surface p-6">
          <h3 className="font-heading font-semibold text-heading-light dark:text-heading-dark mb-5">
            Upcoming Event
          </h3>
          {events[0] ? <EventCard event={events[0]} /> : (
            <p className="text-sm text-paragraph-light dark:text-paragraph-dark">No events scheduled yet.</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-5">
          <FolderOpen className="h-5 w-5 text-orange" />
          <h3 className="font-heading font-semibold text-heading-light dark:text-heading-dark">
            Recent Resources
          </h3>
        </div>
        {resources.length === 0 ? (
          <p className="text-sm text-paragraph-light dark:text-paragraph-dark">No resources added yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resources.slice(0, 3).map((r, i) => (
              <ResourceCard key={r.id} resource={r} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
