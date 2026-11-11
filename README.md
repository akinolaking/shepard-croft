# Shepard Croft — Astryx website v1.1.0 (work in progress)

Revised from the source HTML/React archives previously delivered for Shepard Croft. Uses actual `@astryxdesign/core` Theme, Button and TextInput primitives with bespoke Figma-matched layouts. The Figma export is the visual specification; do not replace its styling with an unrelated design.

## Routes
`#/home`, `#/living`, `#/wealth`, `#/heritage`, `#/companion`, `#/transfer`, `#/accessible`, `#/grocery`, `#/grocery-form`, `#/vending`, `#/vending-form`, `#/contact`, `#/ready`.

## Run
`npm ci` (after generating a lockfile in a network-enabled environment), `npm run dev`, `npm test`, `npm run build`. Note: this archive presently does not include a generated lockfile. Use `npm install` once and commit the lockfile before CI/deployment.

## Status and privacy
The React forms submit generic enquiries to `/api/booking-requests` and display success only after a 201 response. The API is disabled until database schema, privacy and abuse controls are reviewed. On failure, the user may explicitly open an email draft. The form does not claim a confirmed booking. VoxelBooking is not installed and requires separate PHP/MySQL hosting; see docs/booking-integration.md.

## Test evidence
`npm test` checks input mappings, data minimisation, validation, mocked storage and disabled/offline API outcomes. This is NOT a live Neon/VoxelBooking end-to-end test.