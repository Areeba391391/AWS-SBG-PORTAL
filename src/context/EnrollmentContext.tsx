"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Course } from "@/types";
import { createClient } from "@/lib/supabase/client";

export interface Enrollment {
  courseId: string;
  enrolledAt: string;
  completedLessonIds: string[];
  quizResults: Record<string, { score: number; total: number; passed: boolean }>;
  certificateIssued: boolean;
  certificateIssuedAt?: string;
  certificateNumber?: string;
}

interface EnrollmentContextValue {
  loading: boolean;
  isEnrolled: (courseId: string) => boolean;
  enroll: (courseId: string) => Promise<void>;
  getEnrollment: (courseId: string) => Enrollment | undefined;
  toggleLessonComplete: (courseId: string, lessonId: string) => Promise<void>;
  isLessonComplete: (courseId: string, lessonId: string) => boolean;
  submitQuiz: (courseId: string, moduleId: string, score: number, total: number, passMark?: number) => Promise<void>;
  getCourseProgress: (course: Course) => number;
  isCourseComplete: (course: Course) => boolean;
  checkAndIssueCertificate: (course: Course) => Promise<void>;
  myEnrollments: () => Enrollment[];
  stats: { inProgress: number; completed: number; certificates: number };
}

const EnrollmentContext = createContext<EnrollmentContextValue | null>(null);

function fromRow(row: any): Enrollment {
  return {
    courseId: row.course_id,
    enrolledAt: row.enrolled_at,
    completedLessonIds: row.completed_lesson_ids ?? [],
    quizResults: row.quiz_results ?? {},
    certificateIssued: row.certificate_issued ?? false,
    certificateIssuedAt: row.certificate_issued_at ?? undefined,
    certificateNumber: row.certificate_number ?? undefined,
  };
}

export function EnrollmentProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient());
  const { user } = useAuth();
  const [mine, setMine] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setMine([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase.from("enrollments").select("*").eq("student_id", user.id);
    setMine((data ?? []).map(fromRow));
    setLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function isEnrolled(courseId: string) {
    return mine.some((e) => e.courseId === courseId);
  }

  function getEnrollment(courseId: string) {
    return mine.find((e) => e.courseId === courseId);
  }

  async function enroll(courseId: string) {
    if (!user || isEnrolled(courseId)) return;
    const { data } = await supabase
      .from("enrollments")
      .insert({ student_id: user.id, course_id: courseId })
      .select()
      .single();
    if (data) setMine((list) => [...list, fromRow(data)]);
  }

  async function persist(courseId: string, patch: Record<string, unknown>, mutateLocal: (e: Enrollment) => Enrollment) {
    if (!user) return;
    await supabase.from("enrollments").update(patch).eq("student_id", user.id).eq("course_id", courseId);
    setMine((list) => list.map((e) => (e.courseId === courseId ? mutateLocal(e) : e)));
  }

  async function toggleLessonComplete(courseId: string, lessonId: string) {
    const enr = getEnrollment(courseId);
    if (!enr) return;
    const has = enr.completedLessonIds.includes(lessonId);
    const next = has ? enr.completedLessonIds.filter((id) => id !== lessonId) : [...enr.completedLessonIds, lessonId];
    await persist(courseId, { completed_lesson_ids: next }, (e) => ({ ...e, completedLessonIds: next }));
  }

  function isLessonComplete(courseId: string, lessonId: string) {
    return getEnrollment(courseId)?.completedLessonIds.includes(lessonId) ?? false;
  }

  async function submitQuiz(courseId: string, moduleId: string, score: number, total: number, passMark = 0.6) {
    const enr = getEnrollment(courseId);
    if (!enr) return;
    const passed = total === 0 ? true : score / total >= passMark;
    const nextResults = { ...enr.quizResults, [moduleId]: { score, total, passed } };
    await persist(courseId, { quiz_results: nextResults }, (e) => ({ ...e, quizResults: nextResults }));
  }

  function getCourseProgress(course: Course): number {
    const enr = getEnrollment(course.id);
    if (!enr) return 0;
    const activeModules = course.syllabus.filter((m) => m.status !== "Draft");
    const totalLessons = activeModules.reduce((sum, m) => sum + m.lessons.length, 0);
    const totalQuizzes = activeModules.filter((m) => m.quiz.length > 0).length;
    const totalUnits = totalLessons + totalQuizzes;
    if (totalUnits === 0) return 0;
    const doneLessons = activeModules.reduce(
      (sum, m) => sum + m.lessons.filter((l) => enr.completedLessonIds.includes(l.id)).length,
      0
    );
    const doneQuizzes = activeModules.filter((m) => m.quiz.length > 0 && enr.quizResults[m.id]?.passed).length;
    return Math.round(((doneLessons + doneQuizzes) / totalUnits) * 100);
  }

  function isCourseComplete(course: Course): boolean {
    return getCourseProgress(course) >= 100 && course.syllabus.filter((m) => m.status !== "Draft").length > 0;
  }

  async function checkAndIssueCertificate(course: Course) {
    if (!user || course.certificateEnabled === false) return;
    const enr = getEnrollment(course.id);
    if (!enr || enr.certificateIssued) return;
    if (isCourseComplete(course)) {
      const certNumber = `AWSSBG-${course.id.slice(0, 6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      const issuedAt = new Date().toISOString();
      await persist(
        course.id,
        { certificate_issued: true, certificate_issued_at: issuedAt, certificate_number: certNumber },
        (e) => ({ ...e, certificateIssued: true, certificateIssuedAt: issuedAt, certificateNumber: certNumber })
      );
    }
  }

  function myEnrollments() {
    return mine;
  }

  const stats = {
    inProgress: mine.filter((e) => !e.certificateIssued).length,
    completed: mine.filter((e) => e.certificateIssued).length,
    certificates: mine.filter((e) => e.certificateIssued).length,
  };

  return (
    <EnrollmentContext.Provider
      value={{
        loading,
        isEnrolled,
        enroll,
        getEnrollment,
        toggleLessonComplete,
        isLessonComplete,
        submitQuiz,
        getCourseProgress,
        isCourseComplete,
        checkAndIssueCertificate,
        myEnrollments,
        stats,
      }}
    >
      {children}
    </EnrollmentContext.Provider>
  );
}

export function useEnrollment() {
  const ctx = useContext(EnrollmentContext);
  if (!ctx) throw new Error("useEnrollment must be used within EnrollmentProvider");
  return ctx;
}
