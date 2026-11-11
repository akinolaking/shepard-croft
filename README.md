# Shepard Croft — Astryx React website v1.2.0 (development preview)

Built using recovered Shepard Croft HTML versions and React/Astryx components. The original Figma screens are the visual source of truth; **design fidelity is not yet approved**.

## Local development

- `npm install` and commit the generated lockfile before using `npm ci`.
- `npm test` runs contract, privacy, admin-routing and SEO configuration tests.
- `npm run build` runs TypeScript, Vite, build-time HTML SEO generation and the generated-site SEO audit.
- `npm run seo:audit` validates `dist` after a build.

## Website routes

The public URLs are `/`, `/living/`, `/wealth/`, `/heritage/`, `/companion/`, `/transfer/`, `/accessible/`, `/grocery/`, `/grocery-form/`, `/vending/`, `/vending-form/` and `/contact/`. Search engines can read build-time text snapshots without JavaScript. The React app enhances the content and preserves existing Figma layouts. Legacy `#/path` links still render.

Private routes `/ready/` and `/book-companion/` are noindexed. `/admin` redirects **only when** the VoxelBooking PHP/MySQL base URL is configured; otherwise it returns a secure `503`, not a fake booking dashboard.

## SEO status

See `docs/seo-release.md`. Unique titles, descriptions, canonicals, social image, JSON-LD, sitemap, robots and optional `llms.txt` are generated. Preview deployments and unapproved sites are **noindex** by default; enable `SEO_INDEXABLE=true` only when the approved production domain is live, and set `SEO_SITE_URL` to its canonical origin.

## Booking status

The generic enquiry API is deliberately disabled (`SHPRD_BOOKING_REQUESTS_ENABLED=false`) until the Neon migration, privacy and abuse controls are complete. No form should report an actual booking confirmation from Neon.

VoxelBooking must be installed separately on a production-grade PHP 8.3+/MySQL 8+ host. The public booking UI is guarded by `VITE_VOXEL_BOOKING_LIVE=false` by default; its review and commit route require `SHPRD_VOXELBOOKING_ENABLED=true` and a valid installation. A customer must read and approve the trusted booking review page before commit. No real appointment has been created or tested on the user's VoxelBooking installation yet.

**Production launch gates:** Figma visual sign-off, real Neon read/write tests, anti-spam and privacy checks, VoxelBooking installation and business/service config, real email delivery, appointment lifecycle and double-booking tests, accessible UI checks, Lighthouse, Search Console and Rich Results validation.

## Visual QA v1.3.0
The design review standardizes text/label contrast, Astryx input-shell and native-field radii (8 px), accessible focus states and low-contrast step numerals. Run `npm run build` then `npm run qa:visual` (Playwright Chromium must be installed). The browser script captures 13 routes at 390 / 768 / 1440 px and produces two 4×4 contact sheets plus individual full-page screenshots, with a machine-readable `qa/summary.json`. GitHub Actions uploads these captures as a short-lived artifact. See `docs/visual-qa-review.md`. Booking endpoints remain disabled until VoxelBooking's PHP/MySQL installation and live tests are verified.