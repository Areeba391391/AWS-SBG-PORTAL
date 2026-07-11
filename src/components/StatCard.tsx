"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  index = 0,
  accent = "orange",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  index?: number;
  accent?: "orange" | "blue" | "green" | "purple";
}) {
  const accents: Record<string, string> = {
    orange: "bg-orange/10 text-orange",
    blue: "bg-skyblue/10 text-skyblue",
    green: "bg-emerald-500/10 text-emerald-500",
    purple: "bg-violet-500/10 text-violet-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="card-surface p-5 flex items-center gap-4 hover-lift"
    >
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${accents[accent]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-numbers text-2xl font-bold text-heading-light dark:text-heading-dark">
          {value}
        </p>
        <p className="text-xs text-paragraph-light dark:text-paragraph-dark">{label}</p>
      </div>
    </motion.div>
  );
}
