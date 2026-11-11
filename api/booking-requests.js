import { neon } from "@neondatabase/serverless";
import { validateBookingRequest } from "../src/lib/booking-request.js";

const MAX_BODY_BYTES = 16 * 1024;

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "method_not_allowed" });
  }

  // Fail closed until an approved privacy notice, anti-abuse controls and
  // the reviewed Neon migration are in place.
  if (process.env.SHPRD_BOOKING_REQUESTS_ENABLED !== "true") {
    return response.status(503).json({ error: "enquiries_not_enabled" });
  }

  let body = request.body;
  try {
    if (typeof body === "string") body = JSON.parse(body);
    if (Buffer.byteLength(JSON.stringify(body ?? null), "utf8") > MAX_BODY_BYTES) {
      return response.status(413).json({ error: "payload_too_large" });
    }
  } catch {
    return response.status(400).json({ error: "invalid_json" });
  }

  const result = validateBookingRequest(body);
  if (!result.ok) return response.status(422).json({ error: "invalid_request", fields: result.errors });

  const connection = process.env.SHPRD_DATABASE_URL;
  if (!connection) return response.status(503).json({ error: "database_not_configured" });

  const { requestType, fullName, email, phone, requestedDate, requestedTime } = result.value;
  try {
    const sql = neon(connection);
    const rows = await sql`
      INSERT INTO public.booking_requests
        (request_type, full_name, email, phone, requested_date, requested_time)
      VALUES
        (${requestType}, ${fullName}, ${email}, ${phone},
         ${requestedDate}, ${requestedTime})
      RETURNING id, created_at
    `;
    return response.status(201).json({
      status: "enquiry_received",
      // This ID refers to a request, NOT an appointment or availability hold.
      requestId: rows[0].id
    });
  } catch (error) {
    console.error("booking_request_storage_failed", { code: error?.code ?? "unknown" });
    return response.status(503).json({ error: "temporarily_unavailable" });
  }
}
