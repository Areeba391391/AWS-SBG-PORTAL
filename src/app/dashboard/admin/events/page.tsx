"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, MapPin, Users, ChevronDown } from "lucide-react";
import { Modal } from "@/components/Modal";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { EventItem } from "@/types";
import { readAllEventRegistrations } from "@/lib/crossUserStores";

const emptyForm = {
  title: "",
  type: "Workshop" as EventItem["type"],
  date: new Date().toISOString().slice(0, 10),
  mode: "Online" as EventItem["mode"],
  description: "",
};

export default function AdminEventsPage() {
  const { events, addEvent, updateEvent, deleteEvent } = useData();
  const { users } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [regStore, setRegStore] = useState<Record<string, { eventId: string }[]>>({});

  useEffect(() => {
    readAllEventRegistrations().then(setRegStore);
  }, [modalOpen]);

  function registrantsFor(eventId: string) {
    return Object.entries(regStore)
      .filter(([, regs]) => regs.some((r) => r.eventId === eventId))
      .map(([userId]) => users.find((u) => u.id === userId))
      .filter((u): u is NonNullable<typeof u> => Boolean(u));
  }

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(ev: EventItem) {
    setEditingId(ev.id);
    setForm({ title: ev.title, type: ev.type, date: ev.date.slice(0, 10), mode: ev.mode, description: ev.description });
    setModalOpen(true);
  }

  function saveEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editingId) {
      updateEvent(editingId, form);
    } else {
      addEvent(form);
    }
    setModalOpen(false);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-heading-light dark:text-heading-dark">All Events</h1>
          <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-1">
            Full oversight — as Master Admin you can add, edit, or remove any event.
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary !py-2.5 !px-5 text-sm">
          <Plus className="h-4 w-4" /> New Event
        </button>
      </div>

      <div className="space-y-4">
        {events.length === 0 && (
          <p className="text-sm text-paragraph-light dark:text-paragraph-dark text-center py-10">No events yet.</p>
        )}
        {events.map((ev, i) => {
          const date = new Date(ev.date);
          const registrants = registrantsFor(ev.id);
          const isOpen = expanded === ev.id;
          return (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="card-surface p-5"
            >
              <div className="flex items-center gap-5">
                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-navy dark:bg-white/10 flex flex-col items-center justify-center text-white">
                  <span className="text-[10px] font-semibold text-orange">
                    {date.toLocaleString("en-US", { month: "short" }).toUpperCase()}
                  </span>
                  <span className="font-numbers text-xl font-bold">{date.getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-orange">{ev.type}</span>
                  <h4 className="font-heading font-semibold text-heading-light dark:text-heading-dark truncate">{ev.title}</h4>
                  <p className="flex items-center gap-1.5 text-xs text-paragraph-light dark:text-paragraph-dark mt-1">
                    <MapPin className="h-3.5 w-3.5" /> {ev.mode}
                  </p>
                </div>
                <button
                  onClick={() => setExpanded(isOpen ? null : ev.id)}
                  className="flex-shrink-0 flex items-center gap-1.5 rounded-lg bg-orange/10 text-orange px-3 py-1.5 text-xs font-semibold"
                >
                  <Users className="h-3.5 w-3.5" /> {registrants.length} <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button onClick={() => openEditModal(ev)} className="text-skyblue hover:text-orange transition-colors"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => deleteEvent(ev.id)} className="text-red-500 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              {isOpen && (
                <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                  {registrants.length === 0 ? (
                    <p className="text-xs text-paragraph-light dark:text-paragraph-dark">No one has registered yet.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {registrants.map((u) => (
                        <li key={u.id} className="text-xs text-paragraph-light dark:text-paragraph-dark flex justify-between">
                          <span className="text-heading-light dark:text-heading-dark font-medium">{u.fullName}</span>
                          <span>{u.email}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Event" : "New Event"}>
        <form onSubmit={saveEvent} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-white">Event Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
              placeholder="AWS Cloud Workshop"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-heading-light dark:text-white">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as EventItem["type"] })}
                className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
              >
                <option>Workshop</option>
                <option>Hackathon</option>
                <option>Bootcamp</option>
                <option>Seminar</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-heading-light dark:text-white">Mode</label>
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value as EventItem["mode"] })}
                className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
              >
                <option>Online</option>
                <option>Onsite</option>
                <option>Hybrid</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-white">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-white">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white resize-none"
            />
          </div>
          <button type="submit" className="btn-primary w-full justify-center">
            {editingId ? "Save Changes" : "Create Event"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
