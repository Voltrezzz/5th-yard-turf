import { NextResponse } from "next/server";

import { toBooking } from "@/lib/booking-data";
import { databaseErrorResponse, errorResponse } from "@/lib/errors";
import { getRequestIdentity } from "@/lib/supabase/auth";
import {
  createAdminSupabaseClient,
  isSupabaseServerConfigured,
} from "@/lib/supabase/server";
import { createBookingSchema } from "@/lib/validation";
import type { BookingResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return errorResponse(
      "INTERNAL_ERROR",
      503,
      "Supabase is not configured for this environment.",
    );
  }

  const identity = await getRequestIdentity();
  if (!identity) return errorResponse("UNAUTHENTICATED", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", 400, "Request body must be valid JSON.");
  }

  const validation = createBookingSchema.safeParse(body);
  if (!validation.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      400,
      validation.error.issues[0]?.message,
    );
  }

  const supabase = createAdminSupabaseClient();
  const { count, error: countError } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", identity.userId)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString());

  if (countError) {
    console.error(JSON.stringify({ event: "PENDING_COUNT_FAILED", message: countError.message }));
    return errorResponse("INTERNAL_ERROR", 500);
  }
  if ((count ?? 0) >= 3) {
    return errorResponse(
      "RATE_LIMITED",
      429,
      "You have too many pending bookings. Complete or cancel an existing hold first.",
    );
  }

  const intent = validation.data;
  const { data: bookingId, error: rpcError } = await supabase.rpc(
    "create_booking_with_lock",
    {
      p_user_id: identity.userId,
      p_booking_date: intent.bookingDate,
      p_start_chunk: intent.startChunk,
      p_end_chunk: intent.endChunk,
      p_customer_name: intent.customerName,
      p_customer_phone: intent.customerPhone,
    },
  );

  if (rpcError || !bookingId) {
    const error = rpcError ?? new Error("Booking RPC returned no booking ID.");
    const code = String(rpcError?.message).includes("SLOT_CONFLICT")
      ? "SLOT_CONFLICT"
      : "BOOKING_CREATE_FAILED";
    console[code === "SLOT_CONFLICT" ? "warn" : "error"](
      JSON.stringify({
        event: code,
        userId: identity.userId,
        date: intent.bookingDate,
        chunks: `${intent.startChunk}-${intent.endChunk}`,
      }),
    );
    return databaseErrorResponse(error);
  }

  const { data: bookingRow, error: bookingError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (bookingError || !bookingRow) {
    console.error(JSON.stringify({ event: "BOOKING_READBACK_FAILED", bookingId }));
    return errorResponse("INTERNAL_ERROR", 500);
  }

  console.info(
    JSON.stringify({
      event: "BOOKING_CREATED",
      bookingId,
      userId: identity.userId,
      date: intent.bookingDate,
      chunks: `${intent.startChunk}-${intent.endChunk}`,
    }),
  );

  const response: BookingResponse = {
    booking: toBooking(bookingRow),
    paymentRequired: false,
    message:
      "A 10-minute booking hold was created. Payment is not collected until the Razorpay phase.",
  };

  return NextResponse.json(response, {
    status: 200,
    headers: { "Cache-Control": "private, no-store" },
  });
}
