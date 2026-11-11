import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/booking-requests.js";

function responseDouble() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; }
  };
}

test("booking API module loads with its declared runtime dependencies", () => {
  assert.equal(typeof handler, "function");
});

test("GET returns 405 rather than a serverless invocation error", async () => {
  const response = responseDouble();
  await handler({method: "GET", headers: {host: "example.test"}}, response);
  assert.equal(response.statusCode, 405);
  assert.deepEqual(response.body, {error: "method_not_allowed"});
  assert.equal(response.headers.allow, "POST");
});

test("POST stays disabled until live storage and security are verified", async () => {
  const previous = process.env.SHPRD_BOOKING_REQUESTS_ENABLED;
  delete process.env.SHPRD_BOOKING_REQUESTS_ENABLED;
  try {
    const response = responseDouble();
    await handler({method: "POST", headers: {host: "example.test"}, body: {}}, response);
    assert.equal(response.statusCode, 503);
    assert.deepEqual(response.body, {error: "enquiries_not_enabled"});
  } finally {
    if (previous === undefined) delete process.env.SHPRD_BOOKING_REQUESTS_ENABLED;
    else process.env.SHPRD_BOOKING_REQUESTS_ENABLED = previous;
  }
});
