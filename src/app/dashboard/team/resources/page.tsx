"use client";

import { useState } from "react";
import { Plus, Trash2, FileText, Video, Presentation, Image as ImageIcon, FileSpreadsheet, FileArchive, FileAudio, Link2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { FileUploadInput } from "@/components/FileUploadInput";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { ResourceType } from "@/types";

const iconMap: Record<ResourceType, typeof FileText> = {
  PDF: FileText,
  DOC: FileText,
  PPT: Presentation,
  XLS: FileSpreadsheet,
  Image: ImageIcon,
  Video: Video,
  Audio: FileAudio,
  ZIP: FileArchive,
  Text: FileText,
  Markdown: FileText,
  Link: Link2,
};

const emptyForm = { title: "", description: "", type: "PDF" as ResourceType, url: "", size: "" };

export default function TeamResourcesPage() {
  const { courses, resources, addResource, deleteResource } = useData();
  const { user } = useAuth();
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const course = courses.find((c) => c.id === courseId);
  const [moduleId, setModuleId] = useState(course?.syllabus[0]?.id ?? "");
  const [form, setForm] = useState<typeof emptyForm | null>(null);

  const activeModuleId = course?.syllabus.some((m) => m.id === moduleId) ? moduleId : course?.syllabus[0]?.id ?? "";
  const items = resources.filter((r) => r.courseId === courseId && r.moduleId === activeModuleId);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading-light dark:text-heading-dark">Course Materials</h1>
        <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-1">
          Pick a course and module, then upload notes, slides, videos, images, or documents. They show up as
          downloadable/previewable materials inside that module for enrolled students.
        </p>
      </div>

      <div className="card-surface p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-heading-dark">Course</label>
            <select
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                const c = courses.find((cc) => cc.id === e.target.value);
                setModuleId(c?.syllabus[0]?.id ?? "");
              }}
              className="mt-2 w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-heading-dark">Module</label>
            <select
              value={activeModuleId}
              onChange={(e) => setModuleId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange"
              disabled={!course || course.syllabus.length === 0}
            >
              {course?.syllabus.length === 0 && <option value="">No modules yet</option>}
              {course?.syllabus.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          {items.map((r) => {
            const Icon = iconMap[r.type];
            return (
              <div key={r.id} className="flex items-center gap-3 rounded-lg border border-border-light dark:border-border-dark px-3 py-2 text-sm">
                <Icon className="h-4 w-4 text-orange flex-shrink-0" />
                <span className="flex-1">{r.title}</span>
                <span className="text-xs text-paragraph-light dark:text-paragraph-dark uppercase">{r.type}</span>
                <button onClick={() => deleteResource(r.id)} className="text-red-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            );
          })}
          {items.length === 0 && <p className="text-xs text-paragraph-light dark:text-paragraph-dark">No materials added yet for this module.</p>}
        </div>

        <button
          onClick={() => setForm(emptyForm)}
          disabled={!activeModuleId}
          className="btn-primary !py-2.5 !px-5 text-sm disabled:opacity-40"
        >
          <Plus className="h-4 w-4" /> Add Material
        </button>
        {!activeModuleId && (
          <p className="text-xs text-paragraph-light dark:text-paragraph-dark">This course has no modules yet — add one from Admin → Courses → Manage Content first.</p>
        )}
      </div>

      <Modal open={Boolean(form)} onClose={() => setForm(null)} title="Add Course Material">
        {form && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.title.trim() || !form.url.trim()) return;
              addResource({
                ...form,
                courseId,
                moduleId: activeModuleId,
                uploadedBy: user?.fullName ?? "Team",
                visibility: "Enrolled Students",
                downloadAllowed: true,
                previewAllowed: true,
              });
              setForm(null);
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-heading-light dark:text-white">File</label>
              <div className="mt-2">
                <FileUploadInput onFile={(f) => setForm({ ...form, title: f.title, url: f.url, size: f.size, type: f.type })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-heading-light dark:text-white">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-heading-light dark:text-white">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as ResourceType })}
                className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
              >
                {(["PDF", "DOC", "PPT", "XLS", "Image", "Video", "Audio", "ZIP", "Text", "Markdown", "Link"] as ResourceType[]).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={!form.url} className="btn-primary w-full justify-center disabled:opacity-40">
              Add Material
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
