-- Draft schema; deliberately DO NOT apply to production without a reviewed privacy notice and abuse controls.
-- VoxelBooking (MySQL) is the separate source of truth for confirmed appointments.
CREATE TABLE IF NOT EXISTS public.booking_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 request_type text NOT NULL CHECK (request_type IN
  ('companion','healthcare_support','transport','accessible_transport','airport_transfer','grocery','vending','general')),
 full_name varchar(120) NOT NULL,
 email varchar(254),
 phone varchar(32),
 requested_date date,
 requested_time time without time zone,
 privacy_acknowledged_at timestamptz NOT NULL DEFAULT now(),
 status text NOT NULL DEFAULT 'received' CHECK (status IN('received','reviewing','closed')),
 voxel_booking_id text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT booking_requests_contact_required CHECK
   ((email IS NOT NULL AND email <> '') OR (phone IS NOT NULL AND phone <> ''))
);
CREATE INDEX IF NOT EXISTS booking_requests_created_at_idx ON public.booking_requests(created_at DESC);
COMMENT ON TABLE public.booking_requests IS 'Enquiries only, not appointments. No clinical notes, special-category data, or availability holds.';