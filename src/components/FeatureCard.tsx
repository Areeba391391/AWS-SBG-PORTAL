"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export function FeatureCard({
  icon: Icon,
  title,
  description,
  index = 0,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card-surface hover-lift p-7 group"
    >
      <div className="h-12 w-12 rounded-xl bg-orange/10 flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-orange group-hover:scale-110">
        <Icon className="h-6 w-6 text-orange transition-colors duration-300 group-hover:text-white" />
      </div>
      <h3 className="font-heading font-semibold text-lg text-heading-light dark:text-heading-dark mb-2">
        {title}
      </h3>
      <p className="text-sm text-paragraph-light dark:text-paragraph-dark leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
