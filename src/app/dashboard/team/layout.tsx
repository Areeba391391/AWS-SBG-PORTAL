"use client";

import { LayoutDashboard, Users, CalendarDays, FolderOpen, Megaphone, FileBarChart } from "lucide-react";
import { Sidebar, SidebarLink } from "@/components/dashboard/Sidebar";
import { MobileTopbar } from "@/components/dashboard/MobileTopbar";
import { RequireAuth } from "@/components/RequireAuth";

const links: SidebarLink[] = [
  { href: "/dashboard/team", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/team/members", label: "Members", icon: Users },
  { href: "/dashboard/team/events", label: "Events", icon: CalendarDays },
  { href: "/dashboard/team/resources", label: "Resources", icon: FolderOpen },
  { href: "/dashboard/team/announcements", label: "Announcements", icon: Megaphone },
  { href: "/dashboard/team/reports", label: "Reports", icon: FileBarChart },
];

export default function TeamDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth role="team">
      <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
        <Sidebar links={links} roleLabel="Team Dashboard" />
        <div className="flex-1 min-w-0">
          <MobileTopbar links={links} roleLabel="Team Dashboard" />
          <div className="p-5 md:p-8">{children}</div>
        </div>
      </div>
    </RequireAuth>
  );
}
