"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ListTree, Copy, Eye, EyeOff } from "lucide-react";
import { Modal } from "@/components/Modal";
import { useData } from "@/context/DataContext";
import { Course } from "@/types";

const emptyForm = {
  title: "",
  description: "",
  level: "Beginner" as Course["level"],
  icon: "Cloud",
  status: "Draft" as Course["status"],
  category: "",
  instructor: "",
  durationHours: 0,
  thumbnail: "",
  certificateEnabled: true,
};

export default function AdminCoursesPage() {
  const { courses, addCourse, updateCourse, deleteCourse, duplicateCourse } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(c: Course) {
    setEditingId(c.id);
    setForm({
      title: c.title,
      description: c.description,
      level: c.level,
      icon: c.icon,
      status: c.status,
      category: c.category ?? "",
      instructor: c.instructor ?? "",
      durationHours: c.durationHours ?? 0,
      thumbnail: c.thumbnail ?? "",
      certificateEnabled: c.certificateEnabled,
    });
    setModalOpen(true);
  }

  function toggleStatus(c: Course) {
    updateCourse(c.id, { status: c.status === "Active" ? "Draft" : "Active" });
  }

  function saveCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editingId) {
      updateCourse(editingId, form);
    } else {
      addCourse(form);
    }
    setModalOpen(false);
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-heading-light dark:text-heading-dark">Course Management</h1>
          <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-1">
            Click the <span className="font-semibold">Publish/Unpublish</span> toggle to control what's live on the
            public site, or <span className="font-semibold">Manage Content</span> to add modules, lessons, quizzes, and materials.
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary !py-2.5 !px-5 text-sm">
          <Plus className="h-4 w-4" /> Add Course
        </button>
      </div>

      <div className="card-surface overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead className="bg-bg-light dark:bg-white/5 text-left text-xs uppercase text-paragraph-light dark:text-paragraph-dark">
            <tr>
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Level</th>
              <th className="px-5 py-3 font-medium">Modules</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-paragraph-light dark:text-paragraph-dark">
                  No courses yet — click "Add Course" to create one.
                </td>
              </tr>
            )}
            {courses.map((c) => (
              <tr key={c.id} className="border-t border-border-light dark:border-border-dark hover:bg-orange/5 transition-colors">
                <td className="px-5 py-3.5 font-medium text-heading-light dark:text-heading-dark whitespace-nowrap">{c.title}</td>
                <td className="px-5 py-3.5 text-paragraph-light dark:text-paragraph-dark">{c.category || "—"}</td>
                <td className="px-5 py-3.5 text-paragraph-light dark:text-paragraph-dark">{c.level}</td>
                <td className="px-5 py-3.5 text-paragraph-light dark:text-paragraph-dark">{c.syllabus.length}</td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => toggleStatus(c)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${c.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-gray-500/10 text-gray-500"}`}
                  >
                    {c.status === "Active" ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {c.status === "Active" ? "Published" : "Draft"}
                  </button>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Link href={`/dashboard/admin/courses/${c.id}/content`} className="text-orange hover:opacity-70 transition-opacity" title="Manage Content">
                      <ListTree className="h-4 w-4" />
                    </Link>
                    <button onClick={() => duplicateCourse(c.id)} className="text-paragraph-light dark:text-paragraph-dark hover:text-orange transition-colors" title="Duplicate"><Copy className="h-4 w-4" /></button>
                    <button onClick={() => openEditModal(c)} className="text-skyblue hover:text-orange transition-colors" title="Edit"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => deleteCourse(c.id)} className="text-red-500 hover:text-red-600 transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Course" : "Add Course"}>
        <form onSubmit={saveCourse} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-white">Course Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
              placeholder="AWS Cloud Practitioner"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-white">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white resize-none"
              placeholder="What will students learn?"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-heading-light dark:text-white">Category</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
                placeholder="Cloud Fundamentals"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-heading-light dark:text-white">Instructor</label>
              <input
                value={form.instructor}
                onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
                placeholder="Instructor name"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-heading-light dark:text-white">Level</label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value as Course["level"] })}
                className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-heading-light dark:text-white">Duration (hrs)</label>
              <input
                type="number"
                min={0}
                value={form.durationHours}
                onChange={(e) => setForm({ ...form, durationHours: Number(e.target.value) })}
                className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-heading-light dark:text-white">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Course["status"] })}
                className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
              >
                <option>Active</option>
                <option>Draft</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-white">Thumbnail Image</label>
            <input
              value={form.thumbnail}
              onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
              className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
              placeholder="/images/your-thumbnail.png"
            />
          </div>
          <label className="flex items-center gap-2.5 text-sm text-heading-light dark:text-white">
            <input
              type="checkbox"
              checked={form.certificateEnabled}
              onChange={(e) => setForm({ ...form, certificateEnabled: e.target.checked })}
              className="accent-orange h-4 w-4"
            />
            Issue a certificate when a student completes this course
          </label>
          {!editingId && (
            <p className="text-xs text-paragraph-light dark:text-paragraph-dark">
              After saving, click the <ListTree className="h-3 w-3 inline" /> icon on this course to add modules, lessons, and quizzes.
            </p>
          )}
          <button type="submit" className="btn-primary w-full justify-center">
            {editingId ? "Save Changes" : "Add Course"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
