"use client";

import { Users, CalendarDays, FolderOpen, GraduationCap } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

export default function TeamDashboardPage() {
  const { events, resources } = useData();
  const { users } = useAuth();
  const activeMembers = users.filter((u) => u.role !== "student" && u.status === "Active").length;
  const totalStudents = users.filter((u) => u.role === "student").length;

  const recentUsers = [...users]
    .map((u) => ({ ...u, ts: u.id.startsWith("u_") ? Number(u.id.slice(2)) : 0 }))
    .filter((u) => u.ts > 0)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 5);

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-heading-light dark:text-heading-dark">Team Dashboard</h1>
        <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-1">Manage your team's activity.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={Users} label="Active Members" value={activeMembers} accent="blue" index={0} />
        <StatCard icon={GraduationCap} label="Students" value={totalStudents} accent="purple" index={1} />
        <StatCard icon={CalendarDays} label="Upcoming Events" value={events.length} accent="orange" index={2} />
        <StatCard icon={FolderOpen} label="Resources" value={resources.length} accent="green" index={3} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-surface p-6">
          <h3 className="font-heading font-semibold text-heading-light dark:text-heading-dark mb-5">Upcoming Event</h3>
          {events[0] ? (
            <div>
              <p className="font-semibold text-heading-light dark:text-heading-dark">{events[0].title}</p>
              <p className="text-xs text-paragraph-light dark:text-paragraph-dark mt-1">
                {new Date(events[0].date).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
          ) : (
            <p className="text-sm text-paragraph-light dark:text-paragraph-dark">No events scheduled yet.</p>
          )}
        </div>
        <div className="card-surface p-6">
          <h3 className="font-heading font-semibold text-heading-light dark:text-heading-dark mb-5">Recent Signups</h3>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-paragraph-light dark:text-paragraph-dark">No signups yet.</p>
          ) : (
            <ul className="space-y-4">
              {recentUsers.map((u) => (
                <li key={u.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-heading-light dark:text-heading-dark">{u.fullName}</p>
                    <p className="text-xs text-paragraph-light dark:text-paragraph-dark capitalize">{u.role}</p>
                  </div>
                  <span className="text-xs text-paragraph-light dark:text-paragraph-dark">
                    {new Date(u.ts).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
