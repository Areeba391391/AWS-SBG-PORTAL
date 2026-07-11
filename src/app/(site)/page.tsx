"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Hero } from "@/components/Hero";
import { SectionHeading } from "@/components/SectionHeading";
import { FeatureCard } from "@/components/FeatureCard";
import { CourseCard } from "@/components/CourseCard";
import { EventCard } from "@/components/EventCard";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Cloud, Presentation, FlaskConical, Users2, ArrowRight, Quote, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function dashboardPathForRole(role: string) {
  if (role === "admin") return "/dashboard/admin";
  if (role === "team") return "/dashboard/team";
  return "/dashboard/student";
}

const features = [
  { icon: Cloud, title: "Cloud Learning", description: "Structured learning paths from Cloud Practitioner to Solutions Architect." },
  { icon: Presentation, title: "AWS Workshops", description: "Live sessions with hands-on guidance from experienced mentors." },
  { icon: FlaskConical, title: "Hands-on Labs", description: "Practice on real AWS environments, not just theory." },
  { icon: Users2, title: "Student Community", description: "Connect, collaborate, and grow with fellow cloud builders." },
];

// Placeholder testimonials — replace with real quotes from real students once
// you have them (there's no fake data pretending to be real people below).
const testimonials = [
  { name: "Cloud Practitioner Graduate", role: "Sample testimonial", quote: "Add a real quote from a graduate here.", rating: 5 },
  { name: "Developer Track Student", role: "Sample testimonial", quote: "Add a real quote from a student here.", rating: 5 },
  { name: "Security Track Student", role: "Sample testimonial", quote: "Add a real quote from a student here.", rating: 5 },
];

export default function HomePage() {
  const { courses, events, siteSettings, reviews } = useData();
  const { user, loading } = useAuth();
  const router = useRouter();

  const realTestimonials = [...reviews]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
    .map((r) => ({
      name: r.userName,
      role: courses.find((c) => c.id === r.courseId)?.title ?? "Graduate",
      quote: r.comment || "Great course, learned a lot!",
      rating: r.rating,
    }));
  const showingRealReviews = realTestimonials.length > 0;
  const displayedTestimonials = showingRealReviews ? realTestimonials : testimonials;

  useEffect(() => {
    if (!loading && user) {
      router.replace(dashboardPathForRole(user.role));
    }
  }, [loading, user, router]);

  if (loading || user) return null;
  return (
    <>
      <Hero />

      {/* Features */}
      <section className="section-padding bg-bg-light dark:bg-bg-dark">
        <div className="container-page">
          <SectionHeading
            eyebrow="Why AWS SBG"
            title="Everything you need to grow on AWS"
            description="From guided learning paths to real hands-on labs, we equip student builders with practical cloud skills."
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured courses */}
      <section className="section-padding bg-card-light dark:bg-navy-dark/40">
        <div className="container-page">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <SectionHeading eyebrow="Learning Paths" title="Featured courses" />
            <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange hover:gap-2.5 transition-all duration-300">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.slice(0, 4).map((c, i) => (
              <Link key={c.id} href={`/courses/${c.id}`} className="block">
                <CourseCard course={c} index={i} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming events */}
      <section className="section-padding bg-bg-light dark:bg-bg-dark">
        <div className="container-page grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <SectionHeading
              eyebrow="Stay Updated"
              title="Upcoming events"
              description="Workshops, hackathons, and bootcamps happening across our community — online and onsite."
            />
            <div className="mt-8 space-y-4">
              {events.slice(0, 3).map((e, i) => (
                <EventCard key={e.id} event={e} index={i} />
              ))}
            </div>
            <Link href="/events" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-orange hover:gap-2.5 transition-all duration-300">
              View all events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative hidden lg:block">
            <Image
              src="/images/banner-team.png"
              alt="Team of student builders working together"
              width={760}
              height={560}
              className="rounded-3xl w-full h-auto animate-float [animation-delay:0.5s]"
            />
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="section-padding bg-gradient-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]" />
        <div className="container-page relative grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[
            { label: "Members", value: siteSettings.statMembers },
            { label: "Events", value: siteSettings.statEvents },
            { label: "Certificates", value: siteSettings.statCertificates },
            { label: "Projects", value: siteSettings.statProjects },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-numbers text-3xl md:text-4xl font-extrabold text-gradient">{s.value}</p>
              <p className="mt-2 text-sm text-white/60">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-card-light dark:bg-navy-dark/40">
        <div className="container-page">
          <SectionHeading eyebrow="Testimonials" title="What our builders say" center />
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {displayedTestimonials.map((t) => (
              <div key={t.name} className="card-surface hover-lift p-7">
                <Quote className="h-7 w-7 text-orange/40 mb-4" />
                {"rating" in t && (
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < t.rating ? "fill-orange text-orange" : "text-border-light dark:text-border-dark"}`} />
                    ))}
                  </div>
                )}
                <p className="text-sm leading-relaxed text-paragraph-light dark:text-paragraph-dark">
                  “{t.quote}”
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-orange flex items-center justify-center text-white text-sm font-semibold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-heading-light dark:text-heading-dark">{t.name}</p>
                    <p className="text-xs text-paragraph-light dark:text-paragraph-dark">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-page">
          <div className="rounded-3xl bg-gradient-orange p-10 md:p-16 text-center relative overflow-hidden">
            <h2 className="text-3xl md:text-4xl font-bold text-white max-w-xl mx-auto">
              Ready to build your cloud future?
            </h2>
            <p className="mt-4 text-white/90 max-w-md mx-auto">
              Join the AWS Student Builders Group today — it's free.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-navy px-7 py-3.5 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
