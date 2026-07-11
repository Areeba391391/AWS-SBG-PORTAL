"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Pencil,
  FileText,
  PlayCircle,
  FlaskConical,
  Image as ImageIcon,
  Presentation,
  FileSpreadsheet,
  FileArchive,
  FileAudio,
  Link2,
  Users,
} from "lucide-react";
import { Modal } from "@/components/Modal";
import { FileUploadInput } from "@/components/FileUploadInput";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Lesson, LessonType, QuizQuestion, ResourceItem, ResourceType } from "@/types";
import { readAllEnrollments, StoredEnrollment } from "@/lib/crossUserStores";

const lessonTypeIcon: Record<LessonType, typeof FileText> = {
  reading: FileText,
  video: PlayCircle,
  lab: FlaskConical,
};

const lessonTypeHint: Record<LessonType, string> = {
  reading: "Paste the lesson text here — shown as plain paragraphs in-app.",
  video: "Paste a YouTube/Vimeo *embed* URL (e.g. https://www.youtube.com/embed/VIDEO_ID). It plays inside the course, no external redirect.",
  lab: "One instruction per line — shown as a numbered, solvable checklist. No files to download.",
};

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

const emptyResourceForm = {
  title: "",
  description: "",
  type: "PDF" as ResourceType,
  url: "",
  size: "",
  thumbnail: "",
  visibility: "Enrolled Students" as ResourceItem["visibility"],
  downloadAllowed: true,
  previewAllowed: true,
};

export default function AdminCourseContentPage() {
  const params = useParams<{ id: string }>();
  const {
    courses,
    addModule,
    updateModule,
    deleteModule,
    addLesson,
    updateLesson,
    deleteLesson,
    addQuizQuestion,
    updateQuizQuestion,
    deleteQuizQuestion,
    resources,
    addResource,
    deleteResource,
    addNotification,
  } = useData();
  const { users, user: currentUser } = useAuth();

  const course = courses.find((c) => c.id === params.id);

  const [lessonModal, setLessonModal] = useState<{ moduleId: string; lesson?: Lesson } | null>(null);
  const [lessonForm, setLessonForm] = useState<{ title: string; type: LessonType; content: string; durationMinutes: number }>({
    title: "",
    type: "reading",
    content: "",
    durationMinutes: 5,
  });
  const [quizModal, setQuizModal] = useState<{ moduleId: string; question?: QuizQuestion } | null>(null);
  const [quizForm, setQuizForm] = useState<{ question: string; options: string[]; correctIndex: number }>({
    question: "",
    options: ["", "", "", ""],
    correctIndex: 0,
  });
  const [resourceModal, setResourceModal] = useState<{ moduleId: string } | null>(null);
  const [resourceForm, setResourceForm] = useState(emptyResourceForm);
  const [moduleTitle, setModuleTitle] = useState("");

  const [enrollments, setEnrollments] = useState<Record<string, StoredEnrollment[]>>({});
  useEffect(() => {
    readAllEnrollments().then(setEnrollments);
  }, []);

  if (!course) {
    return (
      <div className="max-w-3xl">
        <p className="text-sm text-paragraph-light dark:text-paragraph-dark">Course not found.</p>
        <Link href="/dashboard/admin/courses" className="text-orange font-semibold text-sm mt-3 inline-block">
          ← Back to Courses
        </Link>
      </div>
    );
  }

  const enrolledStudents = Object.entries(enrollments)
    .filter(([, list]) => list.some((e) => e.courseId === course.id))
    .map(([userId, list]) => {
      const u = users.find((x) => x.id === userId);
      const enr = list.find((e) => e.courseId === course.id)!;
      return u ? { user: u, enr } : null;
    })
    .filter((x): x is { user: (typeof users)[number]; enr: StoredEnrollment } => Boolean(x));

  function openLessonModal(moduleId: string, lesson?: Lesson) {
    setLessonModal({ moduleId, lesson });
    setLessonForm(
      lesson
        ? { title: lesson.title, type: lesson.type, content: lesson.content, durationMinutes: lesson.durationMinutes ?? 5 }
        : { title: "", type: "reading", content: "", durationMinutes: 5 }
    );
  }

  function saveLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!lessonModal || !lessonForm.title.trim()) return;
    if (lessonModal.lesson) {
      updateLesson(course!.id, lessonModal.moduleId, lessonModal.lesson.id, lessonForm);
    } else {
      addLesson(course!.id, lessonModal.moduleId, lessonForm);
    }
    setLessonModal(null);
  }

  function openQuizModal(moduleId: string, question?: QuizQuestion) {
    setQuizModal({ moduleId, question });
    setQuizForm(
      question
        ? { question: question.question, options: [...question.options], correctIndex: question.correctIndex }
        : { question: "", options: ["", "", "", ""], correctIndex: 0 }
    );
  }

  function saveQuiz(e: React.FormEvent) {
    e.preventDefault();
    if (!quizModal || !quizForm.question.trim() || quizForm.options.some((o) => !o.trim())) return;
    if (quizModal.question) {
      updateQuizQuestion(course!.id, quizModal.moduleId, quizModal.question.id, quizForm);
    } else {
      addQuizQuestion(course!.id, quizModal.moduleId, quizForm);
    }
    setQuizModal(null);
  }

  function saveResource(e: React.FormEvent) {
    e.preventDefault();
    if (!course || !resourceModal || !resourceForm.title.trim() || !resourceForm.url.trim()) return;
    addResource({
      ...resourceForm,
      courseId: course.id,
      moduleId: resourceModal.moduleId,
      uploadedBy: currentUser?.fullName ?? "Admin",
    });
    enrolledStudents.forEach(({ user }) => {
      addNotification({
        userId: user.id,
        title: "New resource uploaded",
        body: `"${resourceForm.title}" was added to ${course.title}.`,
        type: "resource",
        link: `/dashboard/student/learn/${course.id}`,
      });
    });
    setResourceModal(null);
    setResourceForm(emptyResourceForm);
  }

  return (
    <div className="max-w-5xl space-y-6">
      <Link href="/dashboard/admin/courses" className="inline-flex items-center gap-1.5 text-sm text-paragraph-light dark:text-paragraph-dark hover:text-orange">
        <ChevronLeft className="h-4 w-4" /> Back to Courses
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-heading-light dark:text-heading-dark">{course.title} — Content</h1>
        <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-1">
          Everything for this course lives on one screen: modules, lessons, quizzes, and each module's downloadable
          materials. Nothing shows up for students until you add it here — no external links needed.
        </p>
      </div>

      {/* Enrolled students */}
      <div className="card-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4.5 w-4.5 text-orange" />
          <h2 className="font-heading font-semibold text-heading-light dark:text-heading-dark">
            Enrolled Students ({enrolledStudents.length})
          </h2>
        </div>
        {enrolledStudents.length === 0 ? (
          <p className="text-sm text-paragraph-light dark:text-paragraph-dark">No one has enrolled in this course yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="text-left text-xs uppercase text-paragraph-light dark:text-paragraph-dark">
                <tr>
                  <th className="py-2 font-medium">Student</th>
                  <th className="py-2 font-medium">Enrolled</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {enrolledStudents.map(({ user, enr }) => (
                  <tr key={user.id} className="border-t border-border-light dark:border-border-dark">
                    <td className="py-2.5">
                      <p className="font-medium text-heading-light dark:text-heading-dark">{user.fullName}</p>
                      <p className="text-xs text-paragraph-light dark:text-paragraph-dark">{user.email}</p>
                    </td>
                    <td className="py-2.5 text-paragraph-light dark:text-paragraph-dark">{new Date(enr.enrolledAt).toLocaleDateString()}</td>
                    <td className="py-2.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${enr.certificateIssued ? "bg-emerald-500/10 text-emerald-500" : "bg-orange/10 text-orange"}`}>
                        {enr.certificateIssued ? "Completed" : "In Progress"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!moduleTitle.trim()) return;
            addModule(course.id, moduleTitle.trim());
            setModuleTitle("");
          }}
          className="card-surface p-5 flex gap-3 flex-wrap"
        >
          <input
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
            placeholder="New module title (e.g. Module 2: Storage Services)"
            className="flex-1 min-w-[220px] rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange"
          />
          <button type="submit" className="btn-primary !py-2.5 !px-5 text-sm">
            <Plus className="h-4 w-4" /> Add Module
          </button>
        </form>

        {[...course.syllabus].sort((a, b) => a.order - b.order).map((m) => {
          const moduleResources = resources.filter((r) => r.courseId === course.id && r.moduleId === m.id);
          return (
            <div key={m.id} className="card-surface p-5 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <input
                  defaultValue={m.title}
                  onBlur={(e) => e.target.value.trim() && updateModule(course.id, m.id, { title: e.target.value.trim() })}
                  className="font-heading font-semibold text-heading-light dark:text-heading-dark bg-transparent outline-none border-b border-transparent focus:border-orange flex-1 min-w-[200px]"
                />
                <div className="flex items-center gap-3">
                  <select
                    value={m.status}
                    onChange={(e) => updateModule(course.id, m.id, { status: e.target.value as "Active" | "Draft" })}
                    className="text-xs rounded-lg border border-border-light dark:border-border-dark bg-transparent px-2 py-1 outline-none focus:border-orange"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                  <button onClick={() => deleteModule(course.id, m.id)} className="text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-paragraph-light dark:text-paragraph-dark">Lessons</p>
                {m.lessons.map((l) => {
                  const Icon = lessonTypeIcon[l.type];
                  return (
                    <div key={l.id} className="flex items-center gap-3 rounded-lg border border-border-light dark:border-border-dark px-3 py-2 text-sm">
                      <Icon className="h-4 w-4 text-orange flex-shrink-0" />
                      <span className="flex-1">{l.title}</span>
                      <span className="text-xs text-paragraph-light dark:text-paragraph-dark uppercase">{l.type}</span>
                      <button onClick={() => openLessonModal(m.id, l)} className="text-skyblue hover:text-orange"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => deleteLesson(course.id, m.id, l.id)} className="text-red-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  );
                })}
                <button onClick={() => openLessonModal(m.id)} className="text-xs font-semibold text-orange inline-flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add Lesson
                </button>
              </div>

              <div className="space-y-2 pt-3 border-t border-border-light dark:border-border-dark">
                <p className="text-xs font-semibold uppercase text-paragraph-light dark:text-paragraph-dark">Quiz</p>
                {m.quiz.map((q) => (
                  <div key={q.id} className="flex items-center gap-3 rounded-lg border border-border-light dark:border-border-dark px-3 py-2 text-sm">
                    <span className="flex-1">{q.question}</span>
                    <button onClick={() => openQuizModal(m.id, q)} className="text-skyblue hover:text-orange"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => deleteQuizQuestion(course.id, m.id, q.id)} className="text-red-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
                <button onClick={() => openQuizModal(m.id)} className="text-xs font-semibold text-orange inline-flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add Quiz Question
                </button>
              </div>

              <div className="space-y-2 pt-3 border-t border-border-light dark:border-border-dark">
                <p className="text-xs font-semibold uppercase text-paragraph-light dark:text-paragraph-dark">Resources (PDF, DOC, PPT, XLS, Image, Video, Audio, ZIP, Text...)</p>
                {moduleResources.map((r) => {
                  const Icon = resourceTypeIcon[r.type];
                  return (
                    <div key={r.id} className="flex items-center gap-3 rounded-lg border border-border-light dark:border-border-dark px-3 py-2 text-sm">
                      <Icon className="h-4 w-4 text-orange flex-shrink-0" />
                      <span className="flex-1">{r.title}</span>
                      <span className="text-xs text-paragraph-light dark:text-paragraph-dark uppercase">{r.type}</span>
                      <span className="text-[11px] text-paragraph-light dark:text-paragraph-dark">{r.downloads} dl · {r.views} views</span>
                      <button onClick={() => deleteResource(r.id)} className="text-red-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  );
                })}
                {moduleResources.length === 0 && <p className="text-xs text-paragraph-light dark:text-paragraph-dark">No resources added yet.</p>}
                <button onClick={() => { setResourceModal({ moduleId: m.id }); setResourceForm(emptyResourceForm); }} className="text-xs font-semibold text-orange inline-flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add Resource
                </button>
              </div>
            </div>
          );
        })}
        {course.syllabus.length === 0 && (
          <p className="text-sm text-paragraph-light dark:text-paragraph-dark text-center py-6">
            No modules yet — add one above to get started.
          </p>
        )}
      </div>

      {/* Lesson modal */}
      <Modal open={Boolean(lessonModal)} onClose={() => setLessonModal(null)} title={lessonModal?.lesson ? "Edit Lesson" : "Add Lesson"}>
        <form onSubmit={saveLesson} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-white">Lesson Title</label>
            <input
              value={lessonForm.title}
              onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
              className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-white">Type</label>
            <select
              value={lessonForm.type}
              onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value as LessonType })}
              className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
            >
              <option value="reading">Reading</option>
              <option value="video">Video</option>
              <option value="lab">Lab (step-by-step)</option>
            </select>
            <p className="text-xs text-paragraph-light dark:text-paragraph-dark mt-1.5">{lessonTypeHint[lessonForm.type]}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-white">Content</label>
            <textarea
              value={lessonForm.content}
              onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
              rows={5}
              className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white resize-none"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-white">Duration (minutes)</label>
            <input
              type="number"
              min={1}
              value={lessonForm.durationMinutes}
              onChange={(e) => setLessonForm({ ...lessonForm, durationMinutes: Number(e.target.value) })}
              className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
            />
          </div>
          <button type="submit" className="btn-primary w-full justify-center">
            {lessonModal?.lesson ? "Save Changes" : "Add Lesson"}
          </button>
        </form>
      </Modal>

      {/* Quiz modal */}
      <Modal open={Boolean(quizModal)} onClose={() => setQuizModal(null)} title={quizModal?.question ? "Edit Question" : "Add Quiz Question"}>
        <form onSubmit={saveQuiz} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-white">Question</label>
            <input
              value={quizForm.question}
              onChange={(e) => setQuizForm({ ...quizForm, question: e.target.value })}
              className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
              required
            />
          </div>
          <div className="space-y-2.5">
            <label className="text-sm font-medium text-heading-light dark:text-white">Options (select the correct one)</label>
            {quizForm.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <input
                  type="radio"
                  checked={quizForm.correctIndex === i}
                  onChange={() => setQuizForm({ ...quizForm, correctIndex: i })}
                  className="accent-orange flex-shrink-0"
                />
                <input
                  value={opt}
                  onChange={(e) => {
                    const options = [...quizForm.options];
                    options[i] = e.target.value;
                    setQuizForm({ ...quizForm, options });
                  }}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2 text-sm outline-none focus:border-orange dark:text-white"
                  required
                />
              </div>
            ))}
          </div>
          <button type="submit" className="btn-primary w-full justify-center">
            {quizModal?.question ? "Save Changes" : "Add Question"}
          </button>
        </form>
      </Modal>

      {/* Resource modal */}
      <Modal open={Boolean(resourceModal)} onClose={() => setResourceModal(null)} title="Add Resource">
        <form onSubmit={saveResource} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-white">File</label>
            <div className="mt-2">
              <FileUploadInput onFile={(f) => setResourceForm({ ...resourceForm, title: f.title, url: f.url, size: f.size, type: f.type })} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-white">Title</label>
            <input
              value={resourceForm.title}
              onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
              className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-white">Description (optional)</label>
            <textarea
              value={resourceForm.description}
              onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
              rows={2}
              className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-white">Type</label>
            <select
              value={resourceForm.type}
              onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value as ResourceType })}
              className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
            >
              {(["PDF", "DOC", "PPT", "XLS", "Image", "Video", "Audio", "ZIP", "Text", "Markdown", "Link"] as ResourceType[]).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-white">Custom Thumbnail (optional)</label>
            <input
              value={resourceForm.thumbnail}
              onChange={(e) => setResourceForm({ ...resourceForm, thumbnail: e.target.value })}
              className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
              placeholder="/images/your-thumbnail.png"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-white">Visibility</label>
            <select
              value={resourceForm.visibility}
              onChange={(e) => setResourceForm({ ...resourceForm, visibility: e.target.value as ResourceItem["visibility"] })}
              className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
            >
              <option value="Enrolled Students">Enrolled Students Only</option>
              <option value="Public">Public (visible to anyone)</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm text-heading-light dark:text-white">
              <input type="checkbox" checked={resourceForm.downloadAllowed} onChange={(e) => setResourceForm({ ...resourceForm, downloadAllowed: e.target.checked })} className="accent-orange h-4 w-4" />
              Allow download
            </label>
            <label className="flex items-center gap-2 text-sm text-heading-light dark:text-white">
              <input type="checkbox" checked={resourceForm.previewAllowed} onChange={(e) => setResourceForm({ ...resourceForm, previewAllowed: e.target.checked })} className="accent-orange h-4 w-4" />
              Allow preview
            </label>
          </div>
          <button type="submit" disabled={!resourceForm.url} className="btn-primary w-full justify-center disabled:opacity-40">
            Add Resource
          </button>
        </form>
      </Modal>
    </div>
  );
}
