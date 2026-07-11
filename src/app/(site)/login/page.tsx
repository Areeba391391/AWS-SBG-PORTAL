"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Cloud, Eye, EyeOff, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types";

function dashboardPathForRole(role: Role) {
  if (role === "admin") return "/dashboard/admin";
  if (role === "team") return "/dashboard/team";
  return "/dashboard/student";
}

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { login, hasAccount } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const email = watch("email");
  const emailLooksNew = email && email.includes("@") && !hasAccount(email);

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const { error, user } = await login(values);
    if (error) {
      setServerError(error);
      return;
    }
    router.push(redirectTo || dashboardPathForRole(user?.role ?? "student"));
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
        <h1 className="text-2xl font-bold text-center text-heading-light dark:text-white">Welcome Back 👋</h1>
        <p className="text-sm text-center text-paragraph-light dark:text-white/60 mt-1">Login to your account</p>

        {redirectTo && (
          <div className="mt-5 flex items-start gap-2 rounded-xl bg-orange/10 px-4 py-3 text-xs text-orange">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
            Please login to continue where you left off.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-white">Email Address</label>
            <input
              {...register("email")}
              type="email"
              className="mt-2 w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange dark:text-white"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            {!errors.email && emailLooksNew && (
              <p className="text-xs text-orange mt-1.5">
                We don't see an account with this email —{" "}
                <Link href="/register" className="underline font-medium">
                  sign up instead?
                </Link>
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-heading-light dark:text-white">Password</label>
            <div className="relative mt-2">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className="w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 pr-11 text-sm outline-none transition-colors focus:border-orange dark:text-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-paragraph-light dark:text-white/50"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-paragraph-light dark:text-white/60">
              <input type="checkbox" className="accent-orange" /> Remember Me
            </label>
            <a href="#" className="text-orange font-medium">Forgot Password?</a>
          </div>

          {serverError && (
            <p className="text-sm text-red-500">
              {serverError}{" "}
              {serverError.includes("sign up") && (
                <Link href="/register" className="underline font-semibold">
                  Sign up now
                </Link>
              )}
            </p>
          )}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-paragraph-light dark:text-white/60 mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-orange font-semibold">Register</Link>
        </p>
      </motion.div>
    </div>
  );
}
