"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  FlaskConical,
  ChevronLeft,
  Award,
  Lock,
  Download,
  Presentation,
  Image as ImageIcon,
  FileSpreadsheet,
  FileArchive,
  FileAudio,
  Link2,
  Eye,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useEnrollment } from "@/context/EnrollmentContext";
import { ReviewModal } from "@/components/ReviewModal";
import { Lesson, QuizQuestion, ResourceItem, ResourceType } from "@/types";

type SelectedItem =
  | { kind: "lesson"; moduleId: string; lessonId: string }
  | { kind: "quiz"; moduleId: string }
  | { kind: "resource"; moduleId: string; resourceId: string }
  | null;

const resourceTypeIcon: Record<ResourceType, typeof FileText> = {
  PDF: FileText,
  DOC: FileText,
  PPT: Presentation,
  XLS: FileSpreadsheet,
  Image: ImageIcon,
  Video: PlayCircle,
  Audio: FileAudio,
  ZIP: FileArchive,
  Text: FileText,
  Markdown: FileText,
  Link: Link2,
};

function LessonView({
  lesson,
  done,
  onToggleDone,
}: {
  lesson: Lesson;
  done: boolean;
  onToggleDone: () => void;
}) {
  return (
    <div className="card-surface p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-heading-light dark:text-heading-dark">{lesson.title}</h2>
        {lesson.durationMinutes && (
          <span className="text-xs text-paragraph-light dark:text-paragraph-dark">{lesson.durationMinutes} min</span>
        )}
      </div>

      {lesson.type === "video" && (
        <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
          <iframe
            src={lesson.content}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {lesson.type === "reading" && (
        <p className="text-sm leading-relaxed text-paragraph-light dark:text-paragraph-dark whitespace-pre-line">
          {lesson.content}
        </p>
      )}

      {lesson.type === "lab" && (
        <div className="space-y-2">
          {lesson.content.split("\n").filter(Boolean).map((step, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-paragraph-light dark:text-paragraph-dark">
              <FlaskConical className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p>{step}</p>
            </div>
          ))}
          <p className="text-xs text-paragraph-light dark:text-paragraph-dark mt-3">
            Work through the steps above directly, then mark this lab complete — no download needed.
          </p>
        </div>
      )}

      <button
        onClick={onToggleDone}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
          done ? "bg-emerald-500/10 text-emerald-500" : "btn-primary"
        }`}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
        {done ? "Completed" : "Mark as Complete"}
      </button>
    </div>
  );
}

/** Renders the right viewer for a resource's file type, and counts a view
 * the first time it's opened. Falls back to a download-only card for types
 * that can't be safely previewed in-browser (DOC/PPT/XLS/ZIP). */
function ResourceView({ resource }: { resource: ResourceItem }) {
  const { trackResourceView, trackResourceDownload } = useData();
  useEffect(() => {
    trackResourceView(resource.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource.id]);

  const Icon = resourceTypeIcon[resource.type];

  return (
    <div className="card-surface p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-heading-light dark:text-heading-dark">{resource.title}</h2>
        <span className="text-xs text-paragraph-light dark:text-paragraph-dark inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {resource.views}</span>
          <span className="inline-flex items-center gap-1"><Download className="h-3.5 w-3.5" /> {resource.downloads}</span>
        </span>
      </div>
      {resource.description && (
        <p className="text-sm text-paragraph-light dark:text-paragraph-dark">{resource.description}</p>
      )}

      {resource.previewAllowed !== false && resource.type === "Image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={resource.url} alt={resource.title} className="w-full rounded-xl border border-border-light dark:border-border-dark" />
      )}
      {resource.previewAllowed !== false && resource.type === "PDF" && (
        <iframe src={resource.url} className="w-full h-[70vh] rounded-xl border border-border-light dark:border-border-dark" />
      )}
      {resource.previewAllowed !== false && resource.type === "Video" && (
        <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
          <video src={resource.url} controls className="w-full h-full" />
        </div>
      )}
      {resource.previewAllowed !== false && resource.type === "Audio" && (
        <audio src={resource.url} controls className="w-full" />
      )}
      {resource.previewAllowed === false && (
        <div className="rounded-xl bg-bg-light dark:bg-white/5 p-8 flex flex-col items-center text-center">
          <Icon className="h-9 w-9 text-orange mb-3" />
          <p className="text-sm text-paragraph-light dark:text-paragraph-dark">
            {resource.type} files aren't previewable in-browser — download it to view.
          </p>
        </div>
      )}
      {["DOC", "PPT", "XLS", "ZIP", "Text", "Markdown", "Link"].includes(resource.type) && resource.previewAllowed !== false && (
        <div className="rounded-xl bg-bg-light dark:bg-white/5 p-8 flex flex-col items-center text-center">
          <Icon className="h-9 w-9 text-orange mb-3" />
          <p className="text-sm text-paragraph-light dark:text-paragraph-dark">
            {resource.type} files open best downloaded — use the button below.
          </p>
        </div>
      )}

      {resource.downloadAllowed !== false && (
        <a
          href={resource.url}
          download={resource.title}
          target={resource.url.startsWith("data:") ? undefined : "_blank"}
          rel="noreferrer"
          onClick={() => trackResourceDownload(resource.id)}
          className="btn-primary inline-flex w-auto"
        >
          <Download className="h-4 w-4" /> Download
        </a>
      )}
    </div>
  );
}

function QuizView({
  questions,
  onSubmit,
  result,
}: {
  questions: QuizQuestion[];
  onSubmit: (score: number, total: number) => void;
  result?: { score: number; total: number; passed: boolean };
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(Boolean(result));

  function submit() {
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) score += 1;
    });
    onSubmit(score, questions.length);
    setSubmitted(true);
  }

  if (questions.length === 0) {
    return <p className="text-sm text-paragraph-light dark:text-paragraph-dark">No quiz for this module yet.</p>;
  }

  return (
    <div className="card-surface p-6 space-y-6">
      <h2 className="text-lg font-bold text-heading-light dark:text-heading-dark">Module Quiz</h2>
      {questions.map((q, qi) => (
        <div key={q.id} className="space-y-2">
          <p className="text-sm font-medium text-heading-light dark:text-heading-dark">
            {qi + 1}. {q.question}
          </p>
          <div className="space-y-1.5">
            {q.options.map((opt, oi) => (
              <label
                key={oi}
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
                  answers[q.id] === oi
                    ? "border-orange bg-orange/5"
                    : "border-border-light dark:border-border-dark"
                }`}
              >
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === oi}
                  onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                  className="accent-orange"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={submit}
          disabled={Object.keys(answers).length < questions.length}
          className="btn-primary disabled:opacity-40"
        >
          Submit Quiz
        </button>
      ) : (
        <div
          className={`rounded-xl p-4 text-sm font-semibold ${
            result?.passed ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
          }`}
        >
          {result?.passed ? "Passed! " : "Not passed yet. "}
          Score: {result?.score}/{result?.total}
          {!result?.passed && (
            <button
              onClick={() => {
                setSubmitted(false);
                setAnswers({});
              }}
              className="ml-3 underline"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function LearnCoursePage() {
  const params = useParams<{ courseId: string }>();
  const { courses, resources, addReview, hasReviewed, addNotification } = useData();
  const { user } = useAuth();
  const {
    isEnrolled,
    enroll,
    toggleLessonComplete,
    isLessonComplete,
    submitQuiz,
    getEnrollment,
    getCourseProgress,
    checkAndIssueCertificate,
  } = useEnrollment();

  const course = courses.find((c) => c.id === params.courseId);
  const [selected, setSelected] = useState<SelectedItem>(null);
  const [showReview, setShowReview] = useState(false);

  const enrollment = course ? getEnrollment(course.id) : undefined;
  const wasComplete = useMemo(() => Boolean(enrollment?.certificateIssued), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (course && enrollment?.certificateIssued && !wasComplete && user) {
      addNotification({
        userId: user.id,
        title: "Certificate earned!",
        body: `You completed "${course.title}" — your certificate is ready.`,
        type: "certificate",
        link: "/dashboard/student/certificates",
      });
      if (!hasReviewed(course.id, user.id)) setShowReview(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollment?.certificateIssued]);

  const visibleModules = useMemo(
    () => (course ? [...course.syllabus].filter((m) => m.status === "Active").sort((a, b) => a.order - b.order) : []),
    [course]
  );

  const firstLesson = useMemo(() => {
    for (const m of visibleModules) {
      if (m.lessons[0]) return { kind: "lesson" as const, moduleId: m.id, lessonId: m.lessons[0].id };
    }
    return null;
  }, [visibleModules]);

  const active = selected ?? firstLesson;

  if (!course) {
    return (
      <div className="max-w-3xl">
        <p className="text-sm text-paragraph-light dark:text-paragraph-dark">Course not found.</p>
        <Link href="/dashboard/student/courses" className="text-orange font-semibold text-sm mt-3 inline-block">
          ← Back to My Courses
        </Link>
      </div>
    );
  }

  if (!isEnrolled(course.id)) {
    return (
      <div className="max-w-lg mx-auto text-center card-surface p-10">
        <Lock className="h-9 w-9 text-orange mx-auto mb-4" />
        <h1 className="text-lg font-bold text-heading-light dark:text-heading-dark">You're not enrolled yet</h1>
        <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-2">
          Enroll in "{course.title}" to access its lessons and quizzes.
        </p>
        <button onClick={() => enroll(course.id)} className="btn-primary mt-5">
          Enroll Now
        </button>
      </div>
    );
  }

  const progress = getCourseProgress(course);
  const complete = enrollment?.certificateIssued;

  return (
    <div className="max-w-6xl">
      <Link
        href="/dashboard/student/courses"
        className="inline-flex items-center gap-1.5 text-sm text-paragraph-light dark:text-paragraph-dark hover:text-orange mb-5"
      >
        <ChevronLeft className="h-4 w-4" /> Back to My Courses
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-heading-light dark:text-heading-dark">{course.title}</h1>
          <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-1">{progress}% complete</p>
        </div>
        {complete && (
          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 text-emerald-500 px-4 py-2 text-sm font-semibold">
            <Award className="h-4 w-4" /> Certificate earned
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sidebar: modules → lessons → quiz → resources */}
        <aside className="space-y-4">
          {visibleModules.length === 0 && (
            <p className="text-sm text-paragraph-light dark:text-paragraph-dark">
              This course has no content yet. Ask an admin to add modules from Dashboard → Admin → Courses.
            </p>
          )}
          {visibleModules.map((m) => {
            const moduleResources = resources.filter((r) => r.courseId === course.id && r.moduleId === m.id);
            return (
              <div key={m.id} className="card-surface p-4">
                <p className="text-sm font-semibold text-heading-light dark:text-heading-dark mb-3">{m.title}</p>
                <div className="space-y-1.5">
                  {m.lessons.map((l) => {
                    const done = isLessonComplete(course.id, l.id);
                    const activeItem =
                      active?.kind === "lesson" && active.moduleId === m.id && active.lessonId === l.id;
                    const Icon = l.type === "video" ? PlayCircle : l.type === "lab" ? FlaskConical : FileText;
                    return (
                      <button
                        key={l.id}
                        onClick={() => setSelected({ kind: "lesson", moduleId: m.id, lessonId: l.id })}
                        className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                          activeItem ? "bg-orange/10 text-orange" : "hover:bg-bg-light dark:hover:bg-white/5"
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                        )}
                        <span className="flex-1">{l.title}</span>
                      </button>
                    );
                  })}
                  {m.quiz.length > 0 && (
                    <button
                      onClick={() => setSelected({ kind: "quiz", moduleId: m.id })}
                      className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                        active?.kind === "quiz" && active.moduleId === m.id
                          ? "bg-orange/10 text-orange"
                          : "hover:bg-bg-light dark:hover:bg-white/5"
                      }`}
                    >
                      {enrollment?.quizResults[m.id]?.passed ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Award className="h-3.5 w-3.5 flex-shrink-0" />
                      )}
                      <span className="flex-1">Quiz</span>
                    </button>
                  )}
                  {moduleResources.map((r) => {
                    const Icon = resourceTypeIcon[r.type];
                    const activeItem = active?.kind === "resource" && active.resourceId === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setSelected({ kind: "resource", moduleId: m.id, resourceId: r.id })}
                        className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                          activeItem ? "bg-orange/10 text-orange" : "hover:bg-bg-light dark:hover:bg-white/5"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 text-skyblue flex-shrink-0" />
                        <span className="flex-1">{r.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </aside>

        {/* Main content */}
        <div className="lg:col-span-2">
          {!active && (
            <div className="card-surface p-10 text-center text-sm text-paragraph-light dark:text-paragraph-dark">
              Select a lesson from the left to begin.
            </div>
          )}

          {active?.kind === "lesson" &&
            (() => {
              const m = visibleModules.find((mm) => mm.id === active.moduleId);
              const lesson = m?.lessons.find((ll) => ll.id === active.lessonId);
              if (!lesson) return null;
              return (
                <LessonView
                  lesson={lesson}
                  done={isLessonComplete(course.id, lesson.id)}
                  onToggleDone={() => {
                    toggleLessonComplete(course.id, lesson.id);
                    setTimeout(() => checkAndIssueCertificate(course), 0);
                  }}
                />
              );
            })()}

          {active?.kind === "quiz" &&
            (() => {
              const m = visibleModules.find((mm) => mm.id === active.moduleId);
              if (!m) return null;
              return (
                <QuizView
                  questions={m.quiz}
                  result={enrollment?.quizResults[m.id]}
                  onSubmit={(score, total) => {
                    submitQuiz(course.id, m.id, score, total);
                    setTimeout(() => checkAndIssueCertificate(course), 0);
                  }}
                />
              );
            })()}

          {active?.kind === "resource" &&
            (() => {
              const r = resources.find((rr) => rr.id === active.resourceId);
              if (!r) return null;
              return <ResourceView resource={r} />;
            })()}
        </div>
      </div>

      {user && (
        <ReviewModal
          open={showReview}
          onClose={() => setShowReview(false)}
          courseTitle={course.title}
          onSubmit={(rating, comment) => {
            addReview({ courseId: course.id, userId: user.id, userName: user.fullName, rating, comment });
            setShowReview(false);
          }}
        />
      )}
    </div>
  );
}
