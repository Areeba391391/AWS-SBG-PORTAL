"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Role } from "@/types";
import { createClient } from "@/lib/supabase/client";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  department?: string;
  status: "Active" | "Inactive";
}

interface NewUserInput {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  department?: string;
  status?: "Active" | "Inactive";
}

interface AuthContextValue {
  user: AuthUser | null;
  users: AuthUser[];
  loading: boolean;
  signUp: (data: { fullName: string; email: string; password: string }) => Promise<{ error?: string }>;
  login: (data: { email: string; password: string }) => Promise<{ error?: string; user?: AuthUser }>;
  logout: () => void;
  hasAccount: (email: string) => boolean;
  adminAddUser: (data: NewUserInput) => Promise<{ error?: string }>;
  adminUpdateUser: (id: string, data: Partial<Omit<NewUserInput, "password">> & { password?: string }) => Promise<void>;
  adminDeleteUser: (id: string) => Promise<void>;
  updateProfile: (data: { fullName: string; department?: string }) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  department: string | null;
  status: "Active" | "Inactive";
};

function toAuthUser(p: ProfileRow): AuthUser {
  return {
    id: p.id,
    fullName: p.full_name,
    email: p.email,
    role: p.role,
    department: p.department ?? undefined,
    status: p.status,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (data) setUser(toAuthUser(data as ProfileRow));
    },
    [supabase]
  );

  const refreshUsers = useCallback(async () => {
    // Only staff (team/admin) can read every profile — RLS enforces this.
    // For a plain student this simply comes back empty, which is fine.
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (data) setUsers((data as ProfileRow[]).map(toAuthUser));
  }, [supabase]);

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user && active) await loadProfile(session.user.id);
      if (active) setLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    refreshUsers();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  async function signUp({ fullName, email, password }: { fullName: string; email: string; password: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: "student" } },
    });
    if (error) return { error: error.message };
    if (!data.session) {
      // Email confirmation is turned on in this Supabase project's Auth
      // settings — the account exists but needs to be confirmed by email
      // before a session is issued.
      return { error: "Account created — please check your email to confirm before logging in." };
    }
    await loadProfile(data.user!.id);
    return {};
  }

  async function login({ email, password }: { email: string; password: string }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: "Incorrect email or password. Please try again, or sign up first." };
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
    if (!profile) return { error: "Account found but no profile exists yet — contact your admin." };
    if ((profile as ProfileRow).status === "Inactive") {
      await supabase.auth.signOut();
      return { error: "This account has been deactivated. Contact your admin." };
    }
    const authUser = toAuthUser(profile as ProfileRow);
    setUser(authUser);
    return { user: authUser };
  }

  function logout() {
    supabase.auth.signOut();
    setUser(null);
  }

  function hasAccount(email: string) {
    // Supabase intentionally doesn't expose a "does this email exist" check
    // to the client (that would let anyone enumerate accounts). This is now
    // best-effort only, from whatever profiles this session is allowed to
    // see (empty for a plain student) — used purely as a UI hint.
    return users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  // ---- Admin-only user management (Dashboard → Users) ----
  // Creating a user with a chosen password requires the Supabase Admin API
  // (service role key), which must never be exposed to the browser. These
  // calls go through the server-side route at /api/admin/users.

  async function adminAddUser(data: NewUserInput) {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const text = await res.text();
    const json = text ? (() => { try { return JSON.parse(text); } catch { return {}; } })() : {};
    if (!res.ok) return { error: json.error || `Failed to create user (server returned ${res.status}). Check SUPABASE_SERVICE_ROLE_KEY is set in .env.local.` };
    await refreshUsers();
    return {};
  }

  async function adminUpdateUser(id: string, data: Partial<Omit<NewUserInput, "password">> & { password?: string }) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    await refreshUsers();
    if (user && user.id === id) await loadProfile(id);
  }

  async function adminDeleteUser(id: string) {
    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await refreshUsers();
  }

  async function updateProfile(data: { fullName: string; department?: string }) {
    if (!user) return;
    await supabase.from("profiles").update({ full_name: data.fullName, department: data.department }).eq("id", user.id);
    await loadProfile(user.id);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        loading,
        signUp,
        login,
        logout,
        hasAccount,
        adminAddUser,
        adminUpdateUser,
        adminDeleteUser,
        updateProfile,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
