"use client";

import { useState } from "react";
import { useData } from "@/context/DataContext";

export default function AdminWebsiteCmsPage() {
  const { siteSettings, updateSiteSettings } = useData();
  const [form, setForm] = useState(siteSettings);
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading-light dark:text-heading-dark">Website CMS</h1>
        <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-1">
          Edit homepage content shown to visitors — changes save immediately and appear on the public site.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateSiteSettings(form);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
        className="card-surface p-7 space-y-5"
      >
        <div>
          <label className="text-sm font-medium text-heading-light dark:text-heading-dark">Hero Title</label>
          <input
            value={form.heroTitle}
            onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
            className="mt-2 w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-heading-light dark:text-heading-dark">Hero Description</label>
          <textarea
            rows={3}
            value={form.heroDescription}
            onChange={(e) => setForm({ ...form, heroDescription: e.target.value })}
            className="mt-2 w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-heading-dark">Contact Email</label>
            <input
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              className="mt-2 w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-heading-dark">Contact Phone</label>
            <input
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              className="mt-2 w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange"
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-heading-light dark:text-heading-dark mb-2">Homepage stat counters</p>
          <p className="text-xs text-paragraph-light dark:text-paragraph-dark mb-3">
            Shown in the hero section. Update these as your real numbers grow — they start at 0, not a made-up number.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-paragraph-light dark:text-paragraph-dark">Members</label>
              <input
                value={form.statMembers}
                onChange={(e) => setForm({ ...form, statMembers: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-3 py-2 text-sm outline-none focus:border-orange"
              />
            </div>
            <div>
              <label className="text-xs text-paragraph-light dark:text-paragraph-dark">Events</label>
              <input
                value={form.statEvents}
                onChange={(e) => setForm({ ...form, statEvents: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-3 py-2 text-sm outline-none focus:border-orange"
              />
            </div>
            <div>
              <label className="text-xs text-paragraph-light dark:text-paragraph-dark">Certificates</label>
              <input
                value={form.statCertificates}
                onChange={(e) => setForm({ ...form, statCertificates: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-3 py-2 text-sm outline-none focus:border-orange"
              />
            </div>
            <div>
              <label className="text-xs text-paragraph-light dark:text-paragraph-dark">Projects</label>
              <input
                value={form.statProjects}
                onChange={(e) => setForm({ ...form, statProjects: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-3 py-2 text-sm outline-none focus:border-orange"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary">{saved ? "Saved!" : "Save Changes"}</button>
      </form>
    </div>
  );
}
