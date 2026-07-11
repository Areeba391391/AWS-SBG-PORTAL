"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: only read the theme after mount
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className={`h-9 w-9 rounded-full ${className}`} />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative h-9 w-9 rounded-full border border-border-light dark:border-border-dark flex items-center justify-center transition-colors duration-300 hover:bg-orange/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Moon className="h-4 w-4 text-skyblue" />
          ) : (
            <Sun className="h-4 w-4 text-orange" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
