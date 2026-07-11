import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Admin-only user management (Dashboard → Users).
 *
 * Creating an account with an admin-chosen password, or force-deleting an
 * account, requires Supabase's Admin API — which needs the SERVICE ROLE key.
 * That key must never reach the browser, so this whole operation lives in a
 * server route. Every request is re-checked here: we look up the caller's
 * own session + profile role and reject anything from a non-admin, even if
 * someone crafts the request by hand.
 */
async function requireAdmin() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, status: 401, error: "Not authenticated." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") {
    return { ok: false as const, status: 403, error: "Admin access required." };
  }
  return { ok: true as const };
}

export async function POST(req: NextRequest) {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await req.json();
  const { fullName, email, password, role, department, status } = body;
  if (!fullName || !email || !password) {
    return NextResponse.json({ error: "Full name, email, and password are required." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: role ?? "student" },
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // The DB trigger (handle_new_user) already created a basic profile row —
  // fill in the extra admin-provided fields (role/department/status).
  await admin
    .from("profiles")
    .update({ role: role ?? "student", department: department ?? null, status: status ?? "Active" })
    .eq("id", data.user.id);

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await req.json();
  const { id, fullName, role, department, status, password } = body;
  if (!id) return NextResponse.json({ error: "Missing user id." }, { status: 400 });

  const admin = createAdminClient();

  const profileUpdate: Record<string, unknown> = {};
  if (fullName !== undefined) profileUpdate.full_name = fullName;
  if (role !== undefined) profileUpdate.role = role;
  if (department !== undefined) profileUpdate.department = department;
  if (status !== undefined) profileUpdate.status = status;
  if (Object.keys(profileUpdate).length > 0) {
    await admin.from("profiles").update(profileUpdate).eq("id", id);
  }

  if (password) {
    const { error } = await admin.auth.admin.updateUserById(id, { password });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing user id." }, { status: 400 });

  const admin = createAdminClient();
  // Deleting the auth user cascades to the profiles row (on delete cascade).
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
