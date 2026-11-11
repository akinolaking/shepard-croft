import test from "node:test";
import assert from "node:assert/strict";
import { validateBookingRequest, REQUEST_TYPES } from "../src/lib/booking-request.js";

const good = {
  fullName: "Taylor Example",
  email: "Taylor@Example.com",
  phone: "+44 7700 900123",
  requestType: "companion",
  requestedDate: "2026-11-19",
  requestedTime: "09:30",
  privacyAcknowledged: true
};

test("accepts a properly formatted request without marking a booking", () => {
  const result = validateBookingRequest(good);
  assert.equal(result.ok, true);
  assert.equal(result.value.email, "taylor@example.com");
  assert.equal(result.value.requestedDate, "2026-11-19");
  assert.equal(Object.hasOwn(result.value, "bookingConfirmed"), false);
});

test("rejects unsupported service types", () => {
  assert.equal(REQUEST_TYPES.includes("clinical_diagnosis"), false);
  assert.ok(validateBookingRequest({ ...good, requestType: "clinical_diagnosis" }).errors.requestType);
});

test("requires an actual privacy acknowledgement", () => {
  assert.ok(validateBookingRequest({ ...good, privacyAcknowledged: false }).errors.privacyAcknowledged);
});

test("rejects malformed or impossible dates", () => {
  assert.ok(validateBookingRequest({ ...good, requestedDate: "2026-02-30" }).errors.requestedDate);
  assert.ok(validateBookingRequest({ ...good, requestedDate: "tomorrow" }).errors.requestedDate);
});

test("rejects invalid time", () => {
  assert.ok(validateBookingRequest({ ...good, requestedTime: "26:70" }).errors.requestedTime);
});

test("rejects invalid body", () => {
  assert.ok(validateBookingRequest([]).errors.body);
  assert.ok(validateBookingRequest(null).errors.body);
});

test("accepts an enquiry without a time or date", () => {
  const result = validateBookingRequest({ ...good, requestedDate: "", requestedTime: "" });
  assert.equal(result.ok, true);
  assert.equal(result.value.requestedDate, null);
});
