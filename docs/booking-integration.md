# Shepard Croft enquiry and booking implementation notes

## Two distinct backends

- **Neon PostgreSQL**: minimal contact/date/time enquiries only. The `POST /api/booking-requests` route stores only accepted contact information and returns `enquiry_received`, never `booking_confirmed`. It deliberately does not transmit access needs, care notes, free text, or clinical fields. Site is visually based on supplied Figma export and built on actual Astryx components.
- **VoxelBooking**: installed independently on PHP 8.3+/MySQL 8+. It is the future source of truth for staff availability, appointment bookings, cancellations and confirmations. Neon is **not** a substitute for its MySQL database.

## Current state

The Neon API exists in source but is disabled by default using `SHPRD_BOOKING_REQUESTS_ENABLED=false`. The SQL migration is *not* automatically executed. The source includes `npm test` contract tests with an injected in-memory store; they do not prove real Neon persistence or VoxelBooking confirmation.

## Required before enabling production

1. Deploy site and pass Figma screenshot review and build.
2. Complete and publish an appropriate UK privacy notice and retention policy; determine lawful basis and controller/processor arrangements, especially for special-category health information.
3. Review anti-abuse controls: production rate limit, spam protection, alerts and access controls. Keep contact-only intake; never store clinical notes in the generic enquiries table.
4. Apply `db/migrations/001_booking_requests.sql` on a **nonproduction** Neon branch, test rollback, execute insert/readback/delete with synthetic data; then carefully promote migration.
5. Verify Vercel secret is server-only, run production endpoint tests and configure email notifications.
6. Install VoxelBooking on PHP/MySQL at the root of its own HTTPS subdomain. Configure staff, service, timezone, email/cron and admin access.
7. Use the installed VoxelBooking API `/api/agent/v2/schema`; implement and test public session → preview → customer opens `review_url` and approves → commit with idempotency key. Never auto-approve a booking.
8. Test double-booking, cancellation, timezones, accessibility and email receipt. Change page confirmation only on actual booking receipt.

Docs: https://voxelbooking.com/docs/agent-api/book-an-appointment

## Optional public booking adapter (disabled)

`api/voxel-preview.js` and `api/voxel-commit.js` implement a reviewed two-step public booking flow using the documented v2 HTTP endpoints. It requires a live VoxelBooking HTTPS installation and a configured business slug and service ID. The preview endpoint returns a review URL; the customer must personally open that URL and approve the proposal, then explicitly ask for commit. VoxelBooking is authoritative and can reject a stale or unapproved handle. The adapter is OFF unless `SHPRD_VOXELBOOKING_ENABLED=true`. Do not enable without testing against the installed OpenAPI schema and approved consent language. See tests/voxel-booking.test.js for mocked contract tests; these tests are NOT a live booking.