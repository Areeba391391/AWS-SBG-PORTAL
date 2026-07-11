"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function StudentSettingsPage() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [department, setDepartment] = useState(user?.department ?? "");
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateProfile({ fullName, department });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading-light dark:text-heading-dark">Settings</h1>
        <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-1">Manage your account preferences.</p>
      </div>

      <form onSubmit={handleSubmit} className="card-surface p-7 space-y-5">
        <div>
          <label className="text-sm font-medium text-heading-light dark:text-heading-dark">Full Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-heading-light dark:text-heading-dark">Email</label>
          <input
            value={user?.email ?? ""}
            disabled
            className="mt-2 w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-2.5 text-sm outline-none opacity-60"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-heading-light dark:text-heading-dark">Department</label>
          <input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="mt-2 w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange"
            placeholder="Computer Science"
          />
        </div>
        <button type="submit" className="btn-primary">
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
