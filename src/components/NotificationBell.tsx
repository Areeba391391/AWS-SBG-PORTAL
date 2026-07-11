"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, BookOpen, Award, CalendarClock, Star, FileText, Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Notification } from "@/types";

const iconMap: Record<Notification["type"], typeof Bell> = {
  resource: FileText,
  course: BookOpen,
  certificate: Award,
  event: CalendarClock,
  review: Star,
  system: Info,
};

export function NotificationBell({ dark = false }: { dark?: boolean }) {
  const { user } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();
  const [open, setOpen] = useState(false);

  if (!user) return null;
  const mine = notifications.filter((n) => n.userId === user.id).slice(0, 20);
  const unread = mine.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`relative h-8 w-8 flex items-center justify-center rounded-lg ${dark ? "text-white hover:bg-white/10" : "text-heading-light dark:text-white hover:bg-bg-light dark:hover:bg-white/10"}`}
        aria-label="Notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-orange text-[10px] font-bold text-white flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-80 max-h-96 overflow-y-auto rounded-2xl bg-white dark:bg-navy-light shadow-xl border border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-light dark:border-border-dark">
              <p className="text-sm font-semibold text-heading-light dark:text-heading-dark">Notifications</p>
              {unread > 0 && (
                <button onClick={() => markAllNotificationsRead(user.id)} className="text-xs text-orange font-semibold">
                  Mark all read
                </button>
              )}
            </div>
            {mine.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-paragraph-light dark:text-paragraph-dark">No notifications yet.</p>
            ) : (
              mine.map((n) => {
                const Icon = iconMap[n.type];
                const body = (
                  <div
                    className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 border-border-light dark:border-border-dark ${!n.read ? "bg-orange/5" : ""}`}
                    onClick={() => markNotificationRead(n.id)}
                  >
                    <Icon className="h-4 w-4 text-orange flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-heading-light dark:text-heading-dark">{n.title}</p>
                      <p className="text-xs text-paragraph-light dark:text-paragraph-dark mt-0.5">{n.body}</p>
                      <p className="text-[10px] text-paragraph-light dark:text-paragraph-dark mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                );
                return n.link ? (
                  <Link key={n.id} href={n.link} onClick={() => setOpen(false)}>
                    {body}
                  </Link>
                ) : (
                  <div key={n.id}>{body}</div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
