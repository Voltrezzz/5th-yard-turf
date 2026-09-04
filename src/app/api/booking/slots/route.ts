import { NextResponse } from "next/server";

import { formatTimeRange, SLOT_START_CHUNKS } from "@/lib/booking-utils";
import { errorResponse } from "@/lib/errors";
import {
  createAdminSupabaseClient,
  isSupabaseServerConfigured,
} from "@/lib/supabase/server";
import { slotsQuerySchema } from "@/lib/validation";
import type { SlotsResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const validation = slotsQuerySchema.safeParse({ date: url.searchParams.get("date") });
  if (!validation.success) {
    return errorResponse("VALIDATION_ERROR", 400, "Use a valid date in YYYY-MM-DD format.");
  }

  if (!isSupabaseServerConfigured()) {
    return errorResponse(
      "INTERNAL_ERROR",
      503,
      "Supabase is not configured for this environment.",
    );
  }

  const supabase = createAdminSupabaseClient();
  const now = new Date().toISOString();
  const { data: activeBookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("id")
    .eq("booking_date", validation.data.date)
    .or(`status.eq.confirmed,and(status.eq.pending,expires_at.gt.${now})`);

  if (bookingsError) {
    console.error(JSON.stringify({ event: "SLOTS_QUERY_FAILED", message: bookingsError.message }));
    return errorResponse("INTERNAL_ERROR", 500);
  }

  const activeBookingIds = activeBookings.map((booking) => booking.id);
  let lockedChunks: number[] = [];

  if (activeBookingIds.length > 0) {
    const { data: locks, error: locksError } = await supabase
      .from("slot_locks")
      .select("chunk_index")
      .eq("booking_date", validation.data.date)
      .in("booking_id", activeBookingIds)
      .order("chunk_index");

    if (locksError) {
      console.error(JSON.stringify({ event: "SLOT_LOCKS_QUERY_FAILED", message: locksError.message }));
      return errorResponse("INTERNAL_ERROR", 500);
    }
    lockedChunks = [...new Set(locks.map((lock) => lock.chunk_index))];
  }

  const locked = new Set(lockedChunks);
  const response: SlotsResponse = {
    date: validation.data.date,
    lockedChunks,
    slots: SLOT_START_CHUNKS.map((startChunk) => ({
      startChunk,
      endChunk: startChunk + 2,
      label: formatTimeRange(startChunk, startChunk + 2),
      available: !locked.has(startChunk) && !locked.has(startChunk + 1),
      isPast: false,
    })),
  };

  return NextResponse.json(response, {
    headers: { "Cache-Control": "no-store" },
  });
}
