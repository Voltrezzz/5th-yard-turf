export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "SLOT_CONFLICT"
  | "INVALID_STATE_TRANSITION"
  | "HOLD_EXPIRED"
  | "PAYMENT_VERIFICATION_FAILED"
  | "PAYMENT_GATEWAY_ERROR"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export interface ApiError {
  error: {
    code: ApiErrorCode;
    message: string;
  };
}

const errorMessages: Record<ApiErrorCode, string> = {
  VALIDATION_ERROR: "Invalid request data",
  UNAUTHENTICATED: "Authentication required",
  FORBIDDEN: "You do not have permission to perform this action",
  NOT_FOUND: "Resource not found",
  SLOT_CONFLICT: "This slot was just booked by someone else. Please select a different slot.",
  INVALID_STATE_TRANSITION: "This action cannot be performed on the booking in its current state",
  HOLD_EXPIRED: "Your booking hold has expired. Please try again.",
  PAYMENT_VERIFICATION_FAILED: "Payment verification failed",
  PAYMENT_GATEWAY_ERROR: "Payment service temporarily unavailable",
  RATE_LIMITED: "Too many requests. Please wait a moment.",
  INTERNAL_ERROR: "An unexpected error occurred",
};

export function errorResponse(
  code: ApiErrorCode,
  status: number,
  message?: string,
) {
  const body: ApiError = { error: { code, message: message ?? errorMessages[code] } };
  return Response.json(body, { status });
}

export function getDatabaseErrorCode(error: unknown) {
  const message =
    typeof error === "object" && error && "message" in error
      ? String(error.message)
      : String(error);

  if (message.includes("SLOT_CONFLICT")) return "SLOT_CONFLICT" as const;
  if (message.includes("NOT_FOUND")) return "NOT_FOUND" as const;
  if (message.includes("FORBIDDEN")) return "FORBIDDEN" as const;
  if (message.includes("INVALID_STATE_TRANSITION")) {
    return "INVALID_STATE_TRANSITION" as const;
  }
  if (
    message.includes("INVALID_CHUNKS") ||
    message.includes("INVALID_DURATION") ||
    message.includes("DATE_IN_PAST") ||
    message.includes("INVALID_CUSTOMER")
  ) {
    return "VALIDATION_ERROR" as const;
  }
  return "INTERNAL_ERROR" as const;
}

export function databaseErrorResponse(error: unknown) {
  const code = getDatabaseErrorCode(error);
  const statusByCode: Record<ReturnType<typeof getDatabaseErrorCode>, number> = {
    SLOT_CONFLICT: 409,
    NOT_FOUND: 404,
    FORBIDDEN: 403,
    INVALID_STATE_TRANSITION: 409,
    VALIDATION_ERROR: 400,
    INTERNAL_ERROR: 500,
  };
  return errorResponse(code, statusByCode[code]);
}
