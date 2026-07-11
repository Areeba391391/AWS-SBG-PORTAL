"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Download, Trash2 } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { readAllEnrollments, removeEnrollment, revokeCertificate, reissueCertificate, StoredEnrollment } from "@/lib/crossUserStores";

interface Row {
  userId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  progress: string;
  status: "Completed" | "In Progress";
}

export default function AdminEnrollmentsPage() {
  const { courses } = useData();
  const { users } = useAuth();
  const [store, setStore] = useState<Record<string, StoredEnrollment[]>>({});
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    readAllEnrollments().then(setStore);
  }, []);

  const rows: Row[] = useMemo(() => {
    const list: Row[] = [];
    Object.entries(store).forEach(([userId, enrs]) => {
      const u = users.find((x) => x.id === userId);
      if (!u) return;
      enrs.forEach((e) => {
        const c = courses.find((cc) => cc.id === e.courseId);
        if (!c) return;
        const totalLessons = c.syllabus.reduce((s, m) => s + m.lessons.length, 0);
        const totalQuizzes = c.syllabus.filter((m) => m.quiz.length > 0).length;
        const total = totalLessons + totalQuizzes;
        const done =
          c.syllabus.reduce((s, m) => s + m.lessons.filter((l) => e.completedLessonIds.includes(l.id)).length, 0) +
          c.syllabus.filter((m) => m.quiz.length > 0 && e.quizResults[m.id]?.passed).length;
        const pct = total === 0 ? 0 : Math.round((done / total) * 100);
        list.push({
          userId,
          studentName: u.fullName,
          studentEmail: u.email,
          courseId: c.id,
          courseTitle: c.title,
          enrolledAt: e.enrolledAt,
          progress: `${pct}%`,
          status: e.certificateIssued ? "Completed" : "In Progress",
        });
      });
    });
    return list.sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime());
  }, [store, users, courses]);

  const filtered = rows.filter((r) => {
    const matchesSearch = !search || r.studentName.toLowerCase().includes(search.toLowerCase()) || r.studentEmail.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = !courseFilter || r.courseId === courseFilter;
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  async function handleRemove(row: Row) {
    await removeEnrollment(row.userId, row.courseId);
    setStore(await readAllEnrollments());
  }

  async function handleRevoke(row: Row) {
    await revokeCertificate(row.userId, row.courseId);
    setStore(await readAllEnrollments());
  }

  async function handleReissue(row: Row) {
    await reissueCertificate(row.userId, row.courseId);
    setStore(await readAllEnrollments());
  }

  function exportCsv() {
    const header = ["Student", "Email", "Course", "Enrolled Date", "Progress", "Status"];
    const lines = filtered.map((r) => [r.studentName, r.studentEmail, r.courseTitle, new Date(r.enrolledAt).toLocaleDateString(), r.progress, r.status]);
    const csv = [header, ...lines].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enrollments.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-heading-light dark:text-heading-dark">Enrollment Management</h1>
          <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-1">
            Every real enrollment, across every course — search, filter, remove, or export.
          </p>
        </div>
        <button onClick={exportCsv} className="btn-primary !py-2.5 !px-5 text-sm">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-paragraph-light dark:text-paragraph-dark" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student name or email..."
            className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent pl-10 pr-4 py-2.5 text-sm outline-none focus:border-orange"
          />
        </div>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange"
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange"
        >
          <option value="">All Statuses</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div className="card-surface overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="bg-bg-light dark:bg-white/5 text-left text-xs uppercase text-paragraph-light dark:text-paragraph-dark">
            <tr>
              <th className="px-5 py-3 font-medium">Student</th>
              <th className="px-5 py-3 font-medium">Course</th>
              <th className="px-5 py-3 font-medium">Enrolled</th>
              <th className="px-5 py-3 font-medium">Progress</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-paragraph-light dark:text-paragraph-dark">
                  No enrollments match.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={`${r.userId}-${r.courseId}`} className="border-t border-border-light dark:border-border-dark hover:bg-orange/5">
                <td className="px-5 py-3">
                  <p className="font-medium text-heading-light dark:text-heading-dark">{r.studentName}</p>
                  <p className="text-xs text-paragraph-light dark:text-paragraph-dark">{r.studentEmail}</p>
                </td>
                <td className="px-5 py-3 text-paragraph-light dark:text-paragraph-dark">{r.courseTitle}</td>
                <td className="px-5 py-3 text-paragraph-light dark:text-paragraph-dark">{new Date(r.enrolledAt).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-paragraph-light dark:text-paragraph-dark">{r.progress}</td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.status === "Completed" ? "bg-emerald-500/10 text-emerald-500" : "bg-orange/10 text-orange"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {r.status === "Completed" ? (
                      <button onClick={() => handleRevoke(r)} className="text-xs font-semibold text-red-500 hover:text-red-600" title="Revoke certificate">
                        Revoke
                      </button>
                    ) : (
                      <button onClick={() => handleReissue(r)} className="text-xs font-semibold text-emerald-500 hover:text-emerald-600" title="Issue certificate now">
                        Issue
                      </button>
                    )}
                    <button onClick={() => handleRemove(r)} className="text-red-500 hover:text-red-600" title="Remove enrollment">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
