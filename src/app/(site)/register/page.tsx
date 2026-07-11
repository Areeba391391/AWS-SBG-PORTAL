"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Cloud, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const schema = z
  .object({
    fullName: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { signUp } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const { error } = await signUp(values);
    if (error) {
      setServerError(error);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push(redirectTo || "/dashboard/student"), 1200);
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-28 pb-16 px-4 bg-gradient-navy relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md card-surface !bg-white dark:!bg-navy-light p-8 md:p-10"
      >
        <div className="flex items-center gap-2 mb-8 justify-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-orange">
            <Cloud className="h-5 w-5 text-white" />
          </span>
          <span className="font-heading font-bold text-lg text-heading-light dark:text-white">
            AWS <span className="text-orange">SBG</span>
          </span>
        </div>

        {success ? (
          <div className="flex flex-col items-center text-center py-10">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
            <h3 className="font-heading font-semibold text-lg text-heading-light dark:text-white">Account created!</h3>
            <p className="text-sm text-paragraph-light dark:text-white/60 mt-2">Taking you to your dashboard...</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center text-heading-light dark:text-white">Create Account</h1>
            <p className="text-sm text-center text-paragraph-light dark:text-white/60 mt-1">Join the AWS SBG Community</p>

            {redirectTo && (
              <div className="mt-5 rounded-xl bg-orange/10 px-4 py-3 text-xs text-orange">
                Create a free account to continue where you left off.
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-heading-light dark:text-white">Full Name</label>
                <input
                  {...register("fullName")}
                  className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange dark:text-white"
                  placeholder="Your full name"
                />
                {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-heading-light dark:text-white">Email</label>
                <input
                  {...register("email")}
                  type="email"
                  className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange dark:text-white"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-heading-light dark:text-white">Password</label>
                <input
                  {...register("password")}
                  type="password"
                  className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange dark:text-white"
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-heading-light dark:text-white">Confirm Password</label>
                <input
                  {...register("confirmPassword")}
                  type="password"
                  className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange dark:text-white"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
              </div>

              {serverError && (
                <p className="text-sm text-red-500">
                  {serverError}{" "}
                  {serverError.includes("login") && (
                    <Link href="/login" className="underline font-semibold">
                      Login now
                    </Link>
                  )}
                </p>
              )}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
                {isSubmitting ? "Creating account..." : "Register"}
              </button>
            </form>

            <p className="text-center text-sm text-paragraph-light dark:text-white/60 mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-orange font-semibold">Login</Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
