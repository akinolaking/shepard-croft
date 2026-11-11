# Booking integration notes (draft, not deployed)

## Separation of concerns

- Keep the approved Figma/Astryx React website unchanged until its original source is recovered and verified.
- **Neon PostgreSQL** tracks generic website *enquiries*, which are not confirmed bookings. The `booking_requests` table deliberately stores no clinical notes or care assessments.
- **VoxelBooking** (PHP 8.3+, MySQL 8+) manages actual inventory, staff availability, appointments and booking status on separate PHP-capable hosting. Do not translate MySQL schema to Neon and expect VoxelBooking to work. See https://voxelbooking.com/download.
- VoxelBooking 1.3.x supports the public booking interface and an [embeddable widget](https://voxelbooking.com/docs/customization/embed), but the iframe's form is not the Shepard Croft Figma form. The [Agent API v2](https://voxelbooking.com/docs/agent-api/transport-and-authentication) supports reviewed booking operations and explicit customer consent. Validate the installed version and its generated schema before integrating a custom form.

## Current draft API

- `POST /api/booking-requests`: accepts generic service enquiries; never claims to reserve a slot.
- Its server-only Neon connection is read from `SHPRD_DATABASE_URL`, which Vercel's Neon integration already supplies.
- The endpoint is **disabled by default**: `SHPRD_BOOKING_REQUESTS_ENABLED=true` is required after the migration, privacy review, anti-spam/rate-limiting controls and tests have been completed.
- `db/migrations/001_booking_requests.sql` is **not** executed by this branch; no live database was modified.
- No sensitive care details or open-ended clinical notes are accepted. Any future health-related data requires a separate privacy and security design.

## Before live customer submissions

1. Import the existing approved React/Astryx source and reproduce every Figma screen.
2. Run `npm test`, test the SQL migration on a nonproduction Neon branch, and perform a real insert/readback with test-only data.
3. Add rate limiting, spam prevention, privacy notice and data-retention policy; determine lawful basis and role-based access.
4. Install VoxelBooking on PHP/MySQL hosting; configure business, service, timezone, staff availability and email/cron.
5. Define and test a custom Figma-form flow using the installed VoxelBooking v2 contract, including preview, customer-controlled approval, commit receipt and retries, or use the official embedded page only where approved.
6. Verify separate outcome states: enquiry received, booking pending, booking confirmed and cancelled.
7. Verify production build, accessible interactions, visual regression and authenticated admin workflows before launch.
