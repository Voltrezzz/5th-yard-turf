import assert from "node:assert/strict";
import test from "node:test";

import { getDatabaseErrorCode } from "../src/lib/errors.ts";

test("maps database RPC failures to stable public error codes", () => {
  assert.equal(getDatabaseErrorCode(new Error("SLOT_CONFLICT")), "SLOT_CONFLICT");
  assert.equal(getDatabaseErrorCode(new Error("INVALID_DURATION")), "VALIDATION_ERROR");
  assert.equal(
    getDatabaseErrorCode(new Error("INVALID_STATE_TRANSITION")),
    "INVALID_STATE_TRANSITION",
  );
  assert.equal(getDatabaseErrorCode(new Error("database unavailable")), "INTERNAL_ERROR");
});
