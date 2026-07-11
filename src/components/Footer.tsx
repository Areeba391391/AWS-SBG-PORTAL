import Link from "next/link";
import { Cloud, Github, Linkedin, Youtube, Instagram } from "lucide-react";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "About", href: "/about" },
      { label: "Courses", href: "/courses" },
      { label: "Events", href: "/events" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Student Login", href: "/login" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-navy dark:bg-navy-dark text-white/80 border-t border-white/10">
      <div className="container-page section-padding !py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 font-heading font-bold text-lg text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-orange shadow-card">
              <Cloud className="h-5 w-5 text-white" />
            </span>
            AWS <span className="text-orange">SBG</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
            A community of student builders learning, building, and innovating
            together on AWS Cloud.
          </p>
          <div className="mt-5 flex gap-3">
            {[Github, Linkedin, Instagram, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="social link"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 transition-all duration-300 hover:bg-orange hover:border-orange hover:-translate-y-1"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-heading font-semibold text-white mb-4">{col.title}</h4>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/60 hover:text-orange transition-colors duration-200">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
        © {new Date().getFullYear()} AWS Student Builders Group. All rights reserved.
      </div>
    </footer>
  );
}
