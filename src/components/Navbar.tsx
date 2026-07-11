"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Cloud, Menu, X, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/events", label: "Events" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";
  // The navbar is only ever transparent on the homepage hero, whose background
  // is always the dark navy gradient — so text there must always be white,
  // regardless of the light/dark theme toggle.
  const transparent = isHome && !scrolled;

  const textColor = transparent ? "text-white" : "text-heading-light dark:text-heading-dark";
  const mutedTextColor = transparent ? "text-white/90" : "text-heading-light dark:text-heading-dark";

  function handleLogout() {
    logout();
    setMenuOpen(false);
    router.push("/");
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent
          ? "bg-transparent"
          : "bg-white/90 dark:bg-navy-dark/90 backdrop-blur-md shadow-card border-b border-border-light dark:border-border-dark"
      }`}
    >
      <div className="container-page flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-heading font-bold text-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-orange text-white shadow-card">
            <Cloud className="h-5 w-5" />
          </span>
          <span className={textColor}>
            AWS <span className="text-orange">SBG</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-sm font-medium transition-colors duration-200 hover:text-orange group ${
                pathname === link.href ? "text-orange" : mutedTextColor
              }`}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-orange transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle className={transparent ? "border-white/30 hover:bg-white/10" : ""} />

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className={`flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1.5 border transition-colors duration-200 ${
                  transparent
                    ? "border-white/30 text-white hover:bg-white/10"
                    : "border-border-light dark:border-border-dark text-heading-light dark:text-heading-dark hover:bg-orange/10"
                }`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-orange text-white text-xs font-semibold">
                  {user.fullName.charAt(0)}
                </span>
                <span className="text-sm font-medium max-w-[100px] truncate">{user.fullName.split(" ")[0]}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark shadow-card overflow-hidden"
                  >
                    <Link
                      href={`/dashboard/${user.role}`}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-heading-light dark:text-heading-dark hover:bg-orange/10"
                    >
                      <LayoutDashboard className="h-4 w-4" /> My Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link href="/login" className={`text-sm font-medium transition-colors duration-200 hover:text-orange ${mutedTextColor}`}>
                Login
              </Link>
              <Link href="/register" className="btn-primary !py-2.5 !px-5 text-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle className={transparent ? "border-white/30" : ""} />
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
            className={`h-9 w-9 flex items-center justify-center rounded-lg border ${
              transparent ? "border-white/30" : "border-border-light dark:border-border-dark"
            }`}
          >
            {open ? <X className={`h-5 w-5 ${textColor}`} /> : <Menu className={`h-5 w-5 ${textColor}`} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-white dark:bg-navy-dark border-t border-border-light dark:border-border-dark"
          >
            <div className="container-page flex flex-col gap-1 py-4">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="py-2.5 text-sm font-medium text-heading-light dark:text-heading-dark hover:text-orange">
                  {link.label}
                </Link>
              ))}

              {user ? (
                <>
                  <Link href={`/dashboard/${user.role}`} className="py-2.5 text-sm font-medium text-heading-light dark:text-heading-dark hover:text-orange flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" /> My Dashboard
                  </Link>
                  <button onClick={handleLogout} className="py-2.5 text-sm font-medium text-red-500 flex items-center gap-2">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </>
              ) : (
                <div className="mt-2 flex flex-col gap-2">
                  <Link href="/register" className="btn-primary w-full text-sm">
                    Sign Up
                  </Link>
                  <Link href="/login" className="text-center py-2.5 text-sm font-medium text-heading-light dark:text-heading-dark">
                    Already have an account? Login
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
