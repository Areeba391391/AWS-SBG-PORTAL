"use client";

import { useState } from "react";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
}

const initial: Announcement[] = [
  { id: "a1", title: "New course released", message: "AWS Lambda deep-dive is now live.", date: "2h ago" },
  { id: "a2", title: "Hackathon registration open", message: "Sign up before Aug 10.", date: "1d ago" },
  { id: "a3", title: "Team meeting scheduled", message: "Sunday 6 PM on Discord.", date: "2d ago" },
];

export default function TeamAnnouncementsPage() {
  const [items, setItems] = useState(initial);
  const [text, setText] = useState("");

  function post(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setItems((prev) => [{ id: `a${Date.now()}`, title: text, message: "", date: "Just now" }, ...prev]);
    setText("");
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading-light dark:text-heading-dark">Announcements</h1>
        <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-1">Broadcast updates to all students.</p>
      </div>

      <form onSubmit={post} className="card-surface p-5 flex gap-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write an announcement..."
          className="flex-1 rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange"
        />
        <button type="submit" className="btn-primary !py-2.5 !px-5 text-sm">
          <Plus className="h-4 w-4" /> Post
        </button>
      </form>

      <div className="space-y-4">
        {items.length === 0 && (
          <p className="text-sm text-paragraph-light dark:text-paragraph-dark text-center py-10">No announcements yet.</p>
        )}
        {items.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="card-surface p-5 flex gap-4"
          >
            <div className="h-10 w-10 rounded-xl bg-orange/10 flex items-center justify-center flex-shrink-0">
              <Megaphone className="h-5 w-5 text-orange" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-heading-light dark:text-heading-dark">{a.title}</p>
              {a.message && <p className="text-xs text-paragraph-light dark:text-paragraph-dark mt-1">{a.message}</p>}
              <p className="text-xs text-paragraph-light dark:text-paragraph-dark mt-1.5">{a.date}</p>
            </div>
            <button onClick={() => remove(a.id)} className="text-red-500 hover:text-red-600 transition-colors flex-shrink-0">
              <Trash2 className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
