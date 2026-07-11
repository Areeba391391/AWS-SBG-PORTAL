"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function dashboardPathForRole(role: string) {
  if (role === "admin") return "/dashboard/admin/resources";
  if (role === "team") return "/dashboard/team/resources";
  return "/dashboard/student/resources";
}

// Learning resources are only for registered students/team/admins now — not
// public. Anyone hitting this old public URL is sent to login, or straight
// to their dashboard's Resources section if already signed in.
export default function PublicResourcesRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? dashboardPathForRole(user.role) : "/login?redirect=/dashboard/student/resources");
  }, [loading, user, router]);

  return null;
}
