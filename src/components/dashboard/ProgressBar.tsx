"use client";

import { motion } from "framer-motion";

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs mb-1.5 text-paragraph-light dark:text-paragraph-dark">
          <span>{label}</span>
          <span className="font-numbers font-semibold text-heading-light dark:text-heading-dark">
            {value}%
          </span>
        </div>
      )}
      <div className="h-2.5 w-full rounded-full bg-border-light dark:bg-border-dark overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-orange"
        />
      </div>
    </div>
  );
}
