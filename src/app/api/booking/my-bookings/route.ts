import { NextResponse } from "next/server";

import { toBooking } from "@/lib/booking-data";
import { errorResponse } from "@/lib/errors";
import { getRequestIdentity } from "@/lib/supabase/auth";
import {
  createAdminSupabaseClient,
  isSupabaseServerConfigured,
} from "@/lib/supabase/server";
import type { MyBookingsResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseServerConfigured()) {
    return errorResponse(
      "INTERNAL_ERROR",
      503,
      "Supabase is not configured for this environment.",
    );
  }

  const identity = await getRequestIdentity();
  if (!identity) return errorResponse("UNAUTHENTICATED", 401);

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", identity.userId)
    .order("booking_date", { ascending: false })
    .order("start_chunk", { ascending: true });

  if (error) {
    console.error(JSON.stringify({ event: "MY_BOOKINGS_QUERY_FAILED", message: error.message }));
    return errorResponse("INTERNAL_ERROR", 500);
  }

  const response: MyBookingsResponse = { bookings: data.map(toBooking) };
  return NextResponse.json(response, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
