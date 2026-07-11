"use client";

import { motion } from "framer-motion";
import { Cloud, Code2, BrainCircuit, ShieldCheck, ArrowUpRight, LucideIcon } from "lucide-react";
import { Course } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  Cloud,
  Code2,
  BrainCircuit,
  ShieldCheck,
};

const levelStyles: Record<Course["level"], string> = {
  Beginner: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Intermediate: "bg-skyblue/10 text-skyblue",
  Advanced: "bg-orange/10 text-orange",
};

export function CourseCard({ course, index = 0 }: { course: Course; index?: number }) {
  const Icon = iconMap[course.icon] ?? Cloud;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="card-surface hover-lift p-6 group cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="h-12 w-12 rounded-xl bg-navy dark:bg-white/10 flex items-center justify-center transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
          <Icon className="h-6 w-6 text-orange" />
        </div>
        <ArrowUpRight className="h-5 w-5 text-paragraph-light dark:text-paragraph-dark opacity-0 -translate-x-1 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-orange" />
      </div>
      <h3 className="mt-5 font-heading font-semibold text-lg text-heading-light dark:text-heading-dark">
        {course.title}
      </h3>
      <p className="mt-2 text-sm text-paragraph-light dark:text-paragraph-dark leading-relaxed line-clamp-2">
        {course.description}
      </p>
      <div className="mt-5 flex items-center justify-between text-xs">
        <span className={`px-2.5 py-1 rounded-full font-semibold ${levelStyles[course.level]}`}>
          {course.level}
        </span>
        <span className="text-paragraph-light dark:text-paragraph-dark">
          {course.modules} Modules
        </span>
      </div>
    </motion.div>
  );
}
