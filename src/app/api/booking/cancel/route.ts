import { NextResponse } from "next/server";

import { toBooking } from "@/lib/booking-data";
import { databaseErrorResponse, errorResponse } from "@/lib/errors";
import { siteConfig } from "@/lib/site-config";
import { getRequestIdentity } from "@/lib/supabase/auth";
import {
  createAdminSupabaseClient,
  isSupabaseServerConfigured,
} from "@/lib/supabase/server";
import { cancelBookingSchema } from "@/lib/validation";

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

  const validation = cancelBookingSchema.safeParse(body);
  if (!validation.success) return errorResponse("VALIDATION_ERROR", 400);

  const supabase = createAdminSupabaseClient();
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id,user_id,status")
    .eq("id", validation.data.bookingId)
    .maybeSingle();

  if (bookingError) return errorResponse("INTERNAL_ERROR", 500);
  if (!booking) return errorResponse("NOT_FOUND", 404);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", identity.userId)
    .maybeSingle();

  if (profileError) return errorResponse("INTERNAL_ERROR", 500);
  const isAdmin = profile?.role === "admin";
  if (!isAdmin && booking.user_id !== identity.userId) {
    return errorResponse("FORBIDDEN", 403);
  }
  if (!["pending", "confirmed"].includes(booking.status)) {
    return errorResponse("INVALID_STATE_TRANSITION", 409);
  }

  const { error: cancelError } = await supabase.rpc("cancel_booking", {
    p_booking_id: booking.id,
    p_user_id: identity.userId,
    p_is_admin: isAdmin,
  });

  if (cancelError) return databaseErrorResponse(cancelError);

  const { data: cancelledBooking, error: readError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", booking.id)
    .single();

  if (readError || !cancelledBooking) return errorResponse("INTERNAL_ERROR", 500);

  console.info(
    JSON.stringify({
      event: "BOOKING_CANCELLED",
      bookingId: booking.id,
      actor: identity.userId,
      wasConfirmed: booking.status === "confirmed",
    }),
  );

  return NextResponse.json(
    {
      booking: toBooking(cancelledBooking),
      refund: {
        automatic: false,
        amount: 0,
        policy: siteConfig.booking.cancellationPolicy,
      },
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
