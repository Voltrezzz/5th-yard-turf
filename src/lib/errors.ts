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

export function errorResponse(
  code: ApiErrorCode,
  message: string,
  status = 400,
) {
  const body: ApiError = { error: { code, message } };
  return Response.json(body, { status });
}
