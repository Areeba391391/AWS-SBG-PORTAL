"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Check } from "lucide-react";
import { EventItem } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useEventRegistration } from "@/context/EventRegistrationContext";

export function EventCard({ event, index = 0 }: { event: EventItem; index?: number }) {
  const date = new Date(event.date);
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = date.getDate();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { isRegistered, register } = useEventRegistration();
  const registered = user ? isRegistered(event.id) : false;

  function handleRegister() {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    register(event.id);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card-surface hover-lift p-5 flex items-center gap-5"
    >
      <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-navy dark:bg-white/10 flex flex-col items-center justify-center text-white">
        <span className="text-[10px] font-semibold text-orange">{month}</span>
        <span className="font-numbers text-xl font-bold">{day}</span>
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-orange">
          {event.type}
        </span>
        <h4 className="font-heading font-semibold text-heading-light dark:text-heading-dark truncate">
          {event.title}
        </h4>
        <p className="flex items-center gap-1.5 text-xs text-paragraph-light dark:text-paragraph-dark mt-1">
          <MapPin className="h-3.5 w-3.5" /> {event.mode}
        </p>
      </div>
      <button
        onClick={handleRegister}
        disabled={registered}
        className={`flex-shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-300 ${
          registered
            ? "bg-emerald-500/10 text-emerald-500"
            : "bg-orange/10 text-orange hover:bg-orange hover:text-white"
        }`}
      >
        {registered ? (
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5" /> Registered
          </span>
        ) : (
          "Register"
        )}
      </button>
    </motion.div>
  );
}
