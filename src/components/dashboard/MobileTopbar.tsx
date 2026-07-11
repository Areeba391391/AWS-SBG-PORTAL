"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Cloud, LogOut } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { NotificationBell } from "@/components/NotificationBell";
import type { SidebarLink } from "./Sidebar";

export function MobileTopbar({ links, roleLabel }: { links: SidebarLink[]; roleLabel: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div className="md:hidden sticky top-0 z-40 bg-navy dark:bg-navy-dark text-white border-b border-white/10">
      <div className="h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-orange">
            <Cloud className="h-4 w-4 text-white" />
          </span>
          <p className="font-heading font-bold text-sm">{roleLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell dark />
          <ThemeToggle />
          <button onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" className="h-8 w-8 flex items-center justify-center">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-white/10"
          >
            <div className="p-3 space-y-1">
              {links.map((l) => {
                const Icon = l.icon;
                return (
                  <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-white/10">
                    <Icon className="h-4 w-4" /> {l.label}
                  </Link>
                );
              })}
              <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
