"use client";

import { LayoutDashboard, BookOpen, FolderOpen, CalendarDays, Award, Settings } from "lucide-react";
import { Sidebar, SidebarLink } from "@/components/dashboard/Sidebar";
import { MobileTopbar } from "@/components/dashboard/MobileTopbar";
import { RequireAuth } from "@/components/RequireAuth";

const links: SidebarLink[] = [
  { href: "/dashboard/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/student/courses", label: "Courses", icon: BookOpen },
  { href: "/dashboard/student/resources", label: "Resources", icon: FolderOpen },
  { href: "/dashboard/student/events", label: "Events", icon: CalendarDays },
  { href: "/dashboard/student/certificates", label: "Certificates", icon: Award },
  { href: "/dashboard/student/settings", label: "Settings", icon: Settings },
];

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth role="student">
      <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
        <Sidebar links={links} roleLabel="Student Dashboard" />
        <div className="flex-1 min-w-0">
          <MobileTopbar links={links} roleLabel="Student Dashboard" />
          <div className="p-5 md:p-8">{children}</div>
        </div>
      </div>
    </RequireAuth>
  );
}
