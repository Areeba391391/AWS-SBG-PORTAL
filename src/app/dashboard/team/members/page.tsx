"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function TeamMembersPage() {
  const { users } = useAuth();
  const staff = users.filter((u) => u.role === "team" || u.role === "admin");

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading-light dark:text-heading-dark">Team Members</h1>
        <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-1">
          Everyone contributing to AWS SBG. Only Master Admin can add, promote, or remove accounts —
          reach out to your admin to update this list.
        </p>
      </div>

      <div className="card-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-light dark:bg-white/5 text-left text-xs uppercase text-paragraph-light dark:text-paragraph-dark">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Department</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-paragraph-light dark:text-paragraph-dark">
                  No team members yet.
                </td>
              </tr>
            )}
            {staff.map((m, i) => (
              <motion.tr
                key={m.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="border-t border-border-light dark:border-border-dark hover:bg-orange/5 transition-colors"
              >
                <td className="px-5 py-3.5 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-orange flex items-center justify-center text-white text-xs font-semibold">
                    {m.fullName.charAt(0)}
                  </div>
                  {m.fullName}
                </td>
                <td className="px-5 py-3.5">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-skyblue capitalize">
                    {m.role === "admin" && <ShieldCheck className="h-3.5 w-3.5" />}
                    {m.role}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-paragraph-light dark:text-paragraph-dark">{m.department || "—"}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      m.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
