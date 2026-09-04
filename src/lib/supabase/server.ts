import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

export class SupabaseConfigurationError extends Error {
  constructor(message = "Supabase server configuration is missing.") {
    super(message);
    this.name = "SupabaseConfigurationError";
  }
}

export function isSupabasePublicConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isSupabaseServerConfigured() {
  return Boolean(
    isSupabasePublicConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function requireEnvironmentValue(name: string) {
  const value = process.env[name];
  if (!value) throw new SupabaseConfigurationError(`${name} is not configured.`);
  return value;
}

export async function createServerSupabaseClient() {
  const url = requireEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnvironmentValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot always write cookies. Phase 5's proxy
          // performs the authoritative refresh before protected rendering.
        }
      },
    },
  });
}

export function createAdminSupabaseClient() {
  const url = requireEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnvironmentValue("SUPABASE_SERVICE_ROLE_KEY");

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
