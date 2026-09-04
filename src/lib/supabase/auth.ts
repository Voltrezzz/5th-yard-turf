import "server-only";

import { createServerSupabaseClient, isSupabasePublicConfigured } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface RequestIdentity {
  userId: string;
  source: "supabase" | "development";
}

export async function getRequestIdentity(): Promise<RequestIdentity | null> {
  if (isSupabasePublicConfigured()) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.getClaims();
    const subject = data?.claims.sub;

    if (!error && typeof subject === "string" && UUID_PATTERN.test(subject)) {
      return { userId: subject, source: "supabase" };
    }
  }

  // Phase 4 precedes the OTP UI. A developer may point local requests at one
  // real Supabase auth user/profile by setting this UUID. It is never accepted
  // in production and is not inferred from a browser-controlled header.
  const developmentUserId = process.env.SUPABASE_DEV_USER_ID;
  if (
    process.env.NODE_ENV !== "production" &&
    developmentUserId &&
    UUID_PATTERN.test(developmentUserId)
  ) {
    return { userId: developmentUserId, source: "development" };
  }

  return null;
}
