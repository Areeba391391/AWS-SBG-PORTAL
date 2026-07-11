"use client";

import Image from "next/image";
import { SectionHeading } from "@/components/SectionHeading";
import { Target, Eye, HeartHandshake, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const values = [
  { icon: Target, title: "Our Mission", desc: "Empower students with real-world cloud skills and hands-on experience." },
  { icon: Eye, title: "Our Vision", desc: "Build the next generation of cloud experts and innovators." },
  { icon: HeartHandshake, title: "Why Join Us", desc: "Learn, build, and grow with a supportive builder community." },
];

const journey = [
  { year: "2021", label: "Group Founded" },
  { year: "2022", label: "First Workshop" },
  { year: "2023", label: "500+ Members" },
  { year: "2024", label: "Global Impact" },
];

export default function AboutPage() {
  const { users } = useAuth();
  // The team shown here is real — it's whoever is registered with the
  // "team" or "admin" role in Dashboard → Admin → Users. No placeholder
  // names: add your founding team there and they appear here automatically.
  const team = users.filter((u) => u.role === "team" || u.role === "admin");

  return (
    <div className="pt-32 pb-20">
      <section className="container-page grid md:grid-cols-2 gap-14 items-center">
        <div>
          <SectionHeading
            eyebrow="About AWS SBG"
            title="A community of student builders on AWS Cloud"
            description="AWS Student Builders Group is a passionate community of students learning and building on AWS Cloud — from first-time learners to future solutions architects."
          />
        </div>
        <Image
          src="/images/banner-team.png"
          alt="AWS Student Builders Group community"
          width={700}
          height={520}
          className="rounded-3xl w-full h-auto"
        />
      </section>

      <section className="container-page mt-20 grid sm:grid-cols-3 gap-6">
        {values.map((v) => (
          <div key={v.title} className="card-surface hover-lift p-7">
            <div className="h-12 w-12 rounded-xl bg-orange/10 flex items-center justify-center mb-5">
              <v.icon className="h-6 w-6 text-orange" />
            </div>
            <h3 className="font-heading font-semibold text-lg text-heading-light dark:text-heading-dark">{v.title}</h3>
            <p className="mt-2 text-sm text-paragraph-light dark:text-paragraph-dark leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </section>

      <section className="container-page mt-24">
        <SectionHeading eyebrow="Our Journey" title="Milestones so far" center />
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {journey.map((j, i) => (
            <div key={j.year} className="relative text-center">
              <p className="font-numbers text-3xl font-extrabold text-orange">{j.year}</p>
              <p className="mt-2 text-sm text-paragraph-light dark:text-paragraph-dark">{j.label}</p>
              {i < journey.length - 1 && (
                <div className="hidden md:block absolute top-4 left-[60%] w-full h-px bg-border-light dark:bg-border-dark" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="container-page mt-24">
        <SectionHeading eyebrow="Meet the Team" title="Our core team" center />
        {team.length === 0 ? (
          <div className="mt-10 text-center">
            <Users className="h-8 w-8 text-orange mx-auto mb-3" />
            <p className="text-sm text-paragraph-light dark:text-paragraph-dark">
              No team members added yet. Add accounts with the "Team" or "Admin" role from Dashboard → Admin → Users and they'll appear here.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((m) => (
              <div key={m.id} className="card-surface hover-lift p-6 text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-gradient-orange flex items-center justify-center text-white text-lg font-bold mb-4">
                  {m.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <p className="font-heading font-semibold text-sm text-heading-light dark:text-heading-dark">{m.fullName}</p>
                <p className="text-xs text-paragraph-light dark:text-paragraph-dark mt-1 capitalize">
                  {m.role === "admin" ? "Admin" : m.department || "Team"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
