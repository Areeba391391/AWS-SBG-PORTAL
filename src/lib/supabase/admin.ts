import { createClient } from "@supabase/supabase-js";

/**
 * SERVER-ONLY admin client using the Supabase service role key.
 * This key bypasses Row Level Security entirely — never import this file
 * from a "use client" component, never send this key to the browser, and
 * never call this from anywhere except server routes under src/app/api.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase Dashboard -> Project Settings -> API -> service_role secret)."
    );
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
