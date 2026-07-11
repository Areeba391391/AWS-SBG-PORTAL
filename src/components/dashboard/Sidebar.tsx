"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Cloud, LogOut, LucideIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { NotificationBell } from "@/components/NotificationBell";

export interface SidebarLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function Sidebar({
  links,
  roleLabel,
}: {
  links: SidebarLink[];
  roleLabel: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <aside className="hidden md:flex md:flex-col w-64 flex-shrink-0 h-screen sticky top-0 bg-navy dark:bg-navy-dark text-white border-r border-white/10">
      <div className="h-16 flex items-center gap-2 px-6 border-b border-white/10">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-orange">
          <Cloud className="h-5 w-5 text-white" />
        </span>
        <div>
          <p className="font-heading font-bold text-sm leading-none">AWS SBG</p>
          <p className="text-[11px] text-white/50 mt-1">{roleLabel}</p>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-orange text-sm font-semibold flex-shrink-0">
            {user.fullName.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{user.fullName}</p>
            <p className="text-[11px] text-white/50 truncate">{user.email}</p>
          </div>
          <NotificationBell dark />
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-orange text-white shadow-lift"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 transition-transform duration-200 ${active ? "" : "group-hover:translate-x-0.5"}`} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 flex items-center justify-between">
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-medium text-white/60 hover:text-orange transition-colors"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
