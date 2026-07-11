"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { useData } from "@/context/DataContext";

export function Hero() {
  const { siteSettings } = useData();
  const stats = [
    { label: "Members", value: siteSettings.statMembers },
    { label: "Events", value: siteSettings.statEvents },
    { label: "Certificates", value: siteSettings.statCertificates },
    { label: "Projects", value: siteSettings.statProjects },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-navy pt-36 pb-24 md:pt-44 md:pb-32">
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]" />
      <div className="container-page relative grid md:grid-cols-2 gap-14 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-orange mb-6 border border-white/10">
            Student Builders Group
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            {siteSettings.heroTitle}
          </h1>
          <p className="mt-6 text-white/70 text-lg leading-relaxed max-w-lg">
            {siteSettings.heroDescription}
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/register" className="btn-primary">
              Join Community <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/20 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:-translate-y-0.5"
            >
              <PlayCircle className="h-4 w-4" /> Explore Learning
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-4 gap-4 max-w-lg">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 * i }}
              >
                <p className="font-numbers text-xl md:text-2xl font-extrabold text-white">
                  {s.value}
                </p>
                <p className="text-xs text-white/50 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="animate-float">
            <Image
              src="/images/banner-hero.png"
              alt="Students collaborating on cloud computing projects"
              width={800}
              height={600}
              priority
              className="w-full h-auto rounded-3xl"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden sm:block card-surface !bg-white/95 dark:!bg-navy-light/95 p-4 animate-float [animation-delay:1s]">
            <p className="text-xs text-paragraph-light dark:text-white/60">Certificates issued</p>
            <p className="font-numbers text-xl font-bold text-navy dark:text-white">{siteSettings.statCertificates}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
