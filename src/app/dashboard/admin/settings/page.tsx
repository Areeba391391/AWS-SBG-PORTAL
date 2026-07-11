"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading-light dark:text-heading-dark">System Settings</h1>
        <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-1">Configure global platform settings.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
        className="card-surface p-7 space-y-5"
      >
        <div>
          <label className="text-sm font-medium text-heading-light dark:text-heading-dark">Platform Name</label>
          <input
            defaultValue="AWS Student Builders Group"
            className="mt-2 w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-heading-light dark:text-heading-dark">Allow new registrations</p>
            <p className="text-xs text-paragraph-light dark:text-paragraph-dark">Students can sign up without an invite.</p>
          </div>
          <input type="checkbox" defaultChecked className="accent-orange h-5 w-5" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-heading-light dark:text-heading-dark">Maintenance mode</p>
            <p className="text-xs text-paragraph-light dark:text-paragraph-dark">Temporarily disable the public site.</p>
          </div>
          <input type="checkbox" className="accent-orange h-5 w-5" />
        </div>
        <button type="submit" className="btn-primary">{saved ? "Saved!" : "Save Changes"}</button>
      </form>
    </div>
  );
}
