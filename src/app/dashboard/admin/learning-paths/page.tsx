"use client";

import { useState } from "react";
import { Cloud, Code2, BrainCircuit, ShieldCheck, Route, Plus, Trash2, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { Modal } from "@/components/Modal";
import { useData, LearningPath } from "@/context/DataContext";

const icons = [Cloud, Code2, BrainCircuit, ShieldCheck];

export default function AdminLearningPathsPage() {
  const { learningPaths, addLearningPath, updateLearningPath, deleteLearningPath } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", level: "Beginner", courses: 1 });

  function openAdd() {
    setEditingId(null);
    setForm({ title: "", level: "Beginner", courses: 1 });
    setModalOpen(true);
  }

  function openEdit(p: LearningPath) {
    setEditingId(p.id);
    setForm({ title: p.title, level: p.level, courses: p.courses });
    setModalOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editingId) {
      updateLearningPath(editingId, form);
    } else {
      addLearningPath(form);
    }
    setModalOpen(false);
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-heading-light dark:text-heading-dark">Learning Paths</h1>
          <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-1">Group courses into structured learning journeys.</p>
        </div>
        <button onClick={openAdd} className="btn-primary !py-2.5 !px-5 text-sm">
          <Plus className="h-4 w-4" /> Add Path
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {learningPaths.length === 0 && (
          <p className="col-span-full text-sm text-paragraph-light dark:text-paragraph-dark text-center py-10">
            No learning paths yet.
          </p>
        )}
        {learningPaths.map((p, i) => {
          const Icon = icons[i % icons.length] ?? Route;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="card-surface hover-lift p-6 relative group"
            >
              <div className="absolute top-4 right-4 flex items-center gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(p)} className="text-skyblue hover:text-orange">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => deleteLearningPath(p.id)} className="text-red-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="h-11 w-11 rounded-xl bg-navy dark:bg-white/10 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-orange" />
              </div>
              <h3 className="font-heading font-semibold text-heading-light dark:text-heading-dark">{p.title}</h3>
              <p className="text-xs text-paragraph-light dark:text-paragraph-dark mt-1">{p.level} · {p.courses} Courses</p>
            </motion.div>
          );
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Learning Path" : "Add Learning Path"}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-white">Path Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
              placeholder="e.g. Solutions Architect"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-heading-light dark:text-white">Level</label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-heading-light dark:text-white">Courses</label>
              <input
                type="number"
                min={1}
                value={form.courses}
                onChange={(e) => setForm({ ...form, courses: Number(e.target.value) })}
                className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full justify-center">{editingId ? "Save Changes" : "Add Path"}</button>
        </form>
      </Modal>
    </div>
  );
}
