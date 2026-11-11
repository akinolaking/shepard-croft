# Shepard Croft

Source repository for the Shepard Croft website and booking integrations.

## Delivery guardrails

- Recreate the approved Shepard Croft Figma designs exactly. Do not substitute a new template or a generic frontend.
- The React/Astryx website source from earlier preview work **has not yet been imported**. This repository does not presently contain an approved site or production deployment.
- Vercel project: `shepard-croft` (existing, not yet deployed).
- Neon PostgreSQL is the planned application-side data store for enquiries and coordination, not the source of truth for appointment availability.
- VoxelBooking is a separate self-hosted PHP 8.3+/MySQL 8.0+ booking engine. Its bookings and availability remain authoritative; it cannot run inside Neon or on Vercel's Node runtime.
- Never label an enquiry as a confirmed booking. Confirm only after a successful VoxelBooking operation.
- Do not put database credentials, customer details, or care-related sensitive information in Git.

## Work in progress

A draft backend-only implementation is maintained on a feature branch for review. Deploying the website requires importing the approved React/Astryx frontend and verifying its Figma fidelity and booking flows.

Reference documentation:
- https://voxelbooking.com/docs/agent-api/transport-and-authentication
- https://voxelbooking.com/docs/customization/embed
