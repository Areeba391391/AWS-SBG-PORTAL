"use client";

import { LayoutDashboard, Users, BookOpen, Route, Globe, CalendarDays, Settings, Star, ClipboardList } from "lucide-react";
import { Sidebar, SidebarLink } from "@/components/dashboard/Sidebar";
import { MobileTopbar } from "@/components/dashboard/MobileTopbar";
import { RequireAuth } from "@/components/RequireAuth";
import { GlobalSearch } from "@/components/GlobalSearch";

const links: SidebarLink[] = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  { href: "/dashboard/admin/courses", label: "Courses & Resources", icon: BookOpen },
  { href: "/dashboard/admin/enrollments", label: "Enrollments", icon: ClipboardList },
  { href: "/dashboard/admin/learning-paths", label: "Learning Paths", icon: Route },
  { href: "/dashboard/admin/website-cms", label: "Website CMS", icon: Globe },
  { href: "/dashboard/admin/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/admin/events", label: "Events", icon: CalendarDays },
  { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth role="admin">
      <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
        <Sidebar links={links} roleLabel="Master Admin" />
        <div className="flex-1 min-w-0">
          <MobileTopbar links={links} roleLabel="Master Admin" />
          <div className="p-5 md:p-8 space-y-6">
            <GlobalSearch />
            {children}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
