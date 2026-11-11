-- Shepard Croft: enquiry intake only, NOT confirmed bookings.
-- Deploy manually to the connected Neon PostgreSQL database after review.
-- VoxelBooking remains the availability and booking source of truth.

CREATE TABLE IF NOT EXISTS public.booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type text NOT NULL CHECK (request_type IN (
    'companion', 'healthcare_support', 'transport', 'accessible_transport',
    'airport_transfer', 'grocery', 'vending'
  )),
  full_name varchar(120) NOT NULL,
  email varchar(254) NOT NULL,
  phone varchar(32),
  requested_date date,
  requested_time time without time zone,
  privacy_acknowledged_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'received'
    CHECK (status IN ('received', 'reviewing', 'closed')),
  voxel_booking_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS booking_requests_created_at_idx
  ON public.booking_requests (created_at DESC);

COMMENT ON TABLE public.booking_requests IS
  'Customer service enquiries; no availability holds or confirmed appointments. Do not store clinical details here.';
