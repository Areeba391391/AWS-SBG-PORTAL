"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Cloud,
  Code2,
  BrainCircuit,
  ShieldCheck,
  LucideIcon,
  CheckCircle2,
  Lock,
  PlayCircle,
  Clock,
  BadgeCheck,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useEnrollment } from "@/context/EnrollmentContext";

const iconMap: Record<string, LucideIcon> = { Cloud, Code2, BrainCircuit, ShieldCheck };

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { courses } = useData();
  const { isEnrolled, enroll } = useEnrollment();

  const course = courses.find((c) => c.id === params.id);

  if (!course) {
    return (
      <div className="pt-40 pb-24 container-page text-center">
        <h1 className="text-2xl font-bold text-heading-light dark:text-heading-dark">Course not found</h1>
        <Link href="/courses" className="text-orange font-semibold mt-4 inline-block">
          ← Back to courses
        </Link>
      </div>
    );
  }

  const Icon = iconMap[course.icon] ?? Cloud;
  const enrolled = user ? isEnrolled(course.id) : false;
  const lessonCount = course.syllabus.reduce((sum, m) => sum + m.lessons.length, 0);

  function handleEnroll() {
    if (!course) return;
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/courses/${course.id}`)}`);
      return;
    }
    enroll(course.id);
    router.push(`/dashboard/student/learn/${course.id}`);
  }

  return (
    <div className="pt-32 pb-24">
      {/* Header */}
      <section className="bg-gradient-navy relative overflow-hidden py-16">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]" />
        <div className="container-page relative grid md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2">
            <Link href="/courses" className="text-white/60 text-sm hover:text-orange">
              ← Back to Learning Paths
            </Link>
            <div className="flex items-center gap-4 mt-4">
              <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-7 w-7 text-orange" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{course.title}</h1>
                <p className="text-white/60 text-sm mt-1">{course.level} · {course.modules} Modules</p>
              </div>
            </div>
            <p className="text-white/70 mt-5 max-w-xl leading-relaxed">{course.description}</p>
          </div>

          <div className="card-surface !bg-white dark:!bg-navy-light p-6">
            {enrolled ? (
              <div className="text-center">
                <CheckCircle2 className="h-9 w-9 text-emerald-500 mx-auto mb-3" />
                <p className="font-semibold text-heading-light dark:text-white">You're enrolled!</p>
                <Link href={`/dashboard/student/learn/${course.id}`} className="btn-primary w-full mt-4 justify-center">
                  Continue Learning
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm text-paragraph-light dark:text-white/60 mb-4">
                  {user ? "Ready to start learning?" : "Create a free account to enroll and track your progress."}
                </p>
                <button onClick={handleEnroll} className="btn-primary w-full justify-center">
                  {user ? (
                    <>
                      <PlayCircle className="h-4 w-4" /> Enroll Now
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" /> Login to Enroll
                    </>
                  )}
                </button>
                {!user && (
                  <p className="text-center text-xs text-paragraph-light dark:text-white/50 mt-3">
                    No account?{" "}
                    <Link href={`/register?redirect=${encodeURIComponent(`/courses/${course.id}`)}`} className="text-orange font-semibold">
                      Sign up free
                    </Link>
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Syllabus */}
      <section className="container-page mt-14 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-heading-light dark:text-heading-dark mb-5">Course Syllabus</h2>
          {course.syllabus.length === 0 && (
            <p className="text-sm text-paragraph-light dark:text-paragraph-dark">Content for this course is coming soon.</p>
          )}
          <div className="space-y-3">
            {course.syllabus.map((m, i) => {
              const locked = !user;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  className={`card-surface flex items-center gap-4 p-4 ${locked ? "opacity-70" : "hover-lift"}`}
                >
                  <div className="h-9 w-9 rounded-lg bg-orange/10 flex items-center justify-center flex-shrink-0 text-orange text-sm font-semibold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-heading-light dark:text-heading-dark">{m.title}</p>
                    <p className="text-xs text-paragraph-light dark:text-paragraph-dark mt-0.5">
                      {m.lessons.length} lessons{m.quiz.length > 0 ? " · quiz included" : ""}
                    </p>
                  </div>
                  {locked ? (
                    <Lock className="h-4 w-4 text-paragraph-light dark:text-paragraph-dark" />
                  ) : (
                    <PlayCircle className="h-4 w-4 text-orange" />
                  )}
                </motion.div>
              );
            })}
          </div>

          {!user && (
            <div className="mt-6 rounded-2xl bg-orange/10 p-6 flex items-start gap-4">
              <Lock className="h-6 w-6 text-orange flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-heading-light dark:text-heading-dark">Sign up to unlock this course</p>
                <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-1">
                  Create a free account to access every module, track your progress, and earn a certificate.
                </p>
                <div className="flex gap-3 mt-4">
                  <Link
                    href={`/register?redirect=${encodeURIComponent(`/courses/${course.id}`)}`}
                    className="btn-primary !py-2 !px-4 text-sm"
                  >
                    Sign Up Free
                  </Link>
                  <Link
                    href={`/login?redirect=${encodeURIComponent(`/courses/${course.id}`)}`}
                    className="btn-secondary !py-2 !px-4 text-sm"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card-surface p-5 flex items-center gap-3">
            <Clock className="h-5 w-5 text-skyblue" />
            <div>
              <p className="text-sm font-semibold text-heading-light dark:text-heading-dark">{lessonCount} Lessons</p>
              <p className="text-xs text-paragraph-light dark:text-paragraph-dark">Self-paced</p>
            </div>
          </div>
          <div className="card-surface p-5 flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-sm font-semibold text-heading-light dark:text-heading-dark">Certificate Included</p>
              <p className="text-xs text-paragraph-light dark:text-paragraph-dark">On completion</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
