"use client";

import { useEffect, useState } from "react";
import { Users, BookOpen, CalendarDays, FolderOpen, Award, UserCheck, UserX, TrendingUp, Star, Layers } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { readAllEnrollments, readAllEventRegistrations } from "@/lib/crossUserStores";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const growthData = [
  { month: "Jan", users: 900 },
  { month: "Feb", users: 1200 },
  { month: "Mar", users: 1450 },
  { month: "Apr", users: 1700 },
  { month: "May", users: 2000 },
  { month: "Jun", users: 2200 },
  { month: "Jul", users: 2350 },
];

const typeColors: Record<string, string> = {
  Workshop: "#FF9900",
  Hackathon: "#146EB4",
  Bootcamp: "#10B981",
  Seminar: "#8B5CF6",
};

export default function AdminOverviewPage() {
  const { courses, events, resources, reviews } = useData();
  const { users } = useAuth();

  const [enrollmentStore, setEnrollmentStore] = useState<Awaited<ReturnType<typeof readAllEnrollments>>>({});
  const [eventRegStore, setEventRegStore] = useState<Awaited<ReturnType<typeof readAllEventRegistrations>>>({});

  useEffect(() => {
    readAllEnrollments().then(setEnrollmentStore);
    readAllEventRegistrations().then(setEventRegStore);
  }, []);

  const allEnrollments = Object.values(enrollmentStore).flat();
  const allEventRegs = Object.values(eventRegStore).flat();

  const publishedCourses = courses.filter((c) => c.status === "Active").length;
  const draftCourses = courses.filter((c) => c.status === "Draft").length;
  const totalModules = courses.reduce((sum, c) => sum + c.syllabus.length, 0);
  const certificatesIssued = allEnrollments.filter((e) => e.certificateIssued).length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const inactiveUsers = users.filter((u) => u.status !== "Active").length;
  const completionRate = allEnrollments.length === 0 ? 0 : Math.round((certificatesIssued / allEnrollments.length) * 100);
  const avgRating = reviews.length === 0 ? 0 : Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;

  const eventsData = Object.entries(
    events.reduce<Record<string, number>>((acc, e) => {
      acc[e.type] = (acc[e.type] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value, color: typeColors[name] ?? "#9CA3AF" }));

  // Real recent signups — derived from each account's id (which embeds its
  // creation timestamp), not a hardcoded name.
  const recentUsers = [...users]
    .map((u) => ({ ...u, ts: u.id.startsWith("u_") ? Number(u.id.slice(2)) : 0 }))
    .filter((u) => u.ts > 0)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 5);

  const recentReviews = [...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-heading-light dark:text-heading-dark">Admin Overview</h1>
        <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-1">Welcome back, admin.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={Users} label="Total Users" value={users.length} accent="blue" index={0} />
        <StatCard icon={BookOpen} label="Published Courses" value={publishedCourses} accent="orange" index={1} />
        <StatCard icon={Layers} label="Draft Courses" value={draftCourses} accent="purple" index={2} />
        <StatCard icon={FolderOpen} label="Total Modules" value={totalModules} accent="green" index={3} />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={FolderOpen} label="Resources Uploaded" value={resources.length} accent="blue" index={0} />
        <StatCard icon={Award} label="Certificates Issued" value={certificatesIssued} accent="orange" index={1} />
        <StatCard icon={CalendarDays} label="Events" value={events.length} accent="green" index={2} />
        <StatCard icon={CalendarDays} label="Event Registrations" value={allEventRegs.length} accent="purple" index={3} />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={UserCheck} label="Active Users" value={activeUsers} accent="green" index={0} />
        <StatCard icon={UserX} label="Inactive Users" value={inactiveUsers} accent="purple" index={1} />
        <StatCard icon={TrendingUp} label="Completion Rate" value={`${completionRate}%`} accent="orange" index={2} />
        <StatCard icon={Star} label="Average Rating" value={avgRating || "—"} accent="blue" index={3} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-surface p-6">
          <h3 className="font-heading font-semibold text-heading-light dark:text-heading-dark mb-5">Users Growth</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={growthData}>
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }}
              />
              <Line type="monotone" dataKey="users" stroke="#FF9900" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-paragraph-light dark:text-paragraph-dark mt-2">
            Illustrative trend line — connect Supabase to show real signup history.
          </p>
        </div>

        <div className="card-surface p-6">
          <h3 className="font-heading font-semibold text-heading-light dark:text-heading-dark mb-5">Events Overview</h3>
          {eventsData.length === 0 ? (
            <p className="text-sm text-paragraph-light dark:text-paragraph-dark py-16 text-center">No events yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={eventsData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {eventsData.map((e) => (
                    <Cell key={e.name} fill={e.color} />
                  ))}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-surface p-6">
          <h3 className="font-heading font-semibold text-heading-light dark:text-heading-dark mb-5">Recent Signups</h3>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-paragraph-light dark:text-paragraph-dark">No signups yet.</p>
          ) : (
            <ul className="space-y-4">
              {recentUsers.map((u) => (
                <li key={u.id} className="flex items-center justify-between text-sm border-b last:border-0 border-border-light dark:border-border-dark pb-4 last:pb-0">
                  <div>
                    <p className="font-medium text-heading-light dark:text-heading-dark">{u.fullName}</p>
                    <p className="text-xs text-paragraph-light dark:text-paragraph-dark capitalize">{u.role} · {u.email}</p>
                  </div>
                  <span className="text-xs text-paragraph-light dark:text-paragraph-dark">
                    {new Date(u.ts).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-surface p-6">
          <h3 className="font-heading font-semibold text-heading-light dark:text-heading-dark mb-5">Latest Reviews</h3>
          {recentReviews.length === 0 ? (
            <p className="text-sm text-paragraph-light dark:text-paragraph-dark">No reviews yet.</p>
          ) : (
            <ul className="space-y-4">
              {recentReviews.map((r) => (
                <li key={r.id} className="border-b last:border-0 border-border-light dark:border-border-dark pb-4 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-heading-light dark:text-heading-dark">{r.userName}</p>
                    <span className="text-xs text-paragraph-light dark:text-paragraph-dark">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-orange text-orange" : "text-border-light dark:text-border-dark"}`} />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
