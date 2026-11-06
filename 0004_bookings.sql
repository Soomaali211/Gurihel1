CREATE TABLE booking_calendar (
  listing_id UUID NOT NULL REFERENCES listings (id) ON DELETE CASCADE,
  day        DATE NOT NULL,
  price      NUMERIC(10, 2) CHECK (price IS NULL OR price >= 0),
  blocked    BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (listing_id, day)
);

CREATE TABLE bookings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   UUID NOT NULL REFERENCES listings (id),
  guest_id     UUID NOT NULL REFERENCES users (id),
  stay         DATERANGE NOT NULL CHECK (NOT isempty(stay) AND upper(stay) > lower(stay)), -- [check_in, check_out)
  nights       INTEGER GENERATED ALWAYS AS (upper(stay) - lower(stay)) STORED,
  subtotal     NUMERIC(12, 2) CHECK (subtotal IS NULL OR subtotal >= 0),
  fee          NUMERIC(12, 2) CHECK (fee IS NULL OR fee >= 0),
  tax          NUMERIC(12, 2) CHECK (tax IS NULL OR tax >= 0),
  total        NUMERIC(12, 2) CHECK (total IS NULL OR total >= 0),
  status       VARCHAR(12) NOT NULL DEFAULT 'held'
               CHECK (status IN ('held', 'paid', 'confirmed', 'cancelled', 'completed', 'refunded', 'expired')),
  hold_expires TIMESTAMPTZ,
  policy       VARCHAR(10) NOT NULL DEFAULT 'moderate' CHECK (policy IN ('flexible', 'moderate', 'strict')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Ka hortag ballan-labajibaar HEERKA DATABASE-KA: laba ballan oo firfircoon ma ku dhici karaan isla taariikh.
  CONSTRAINT bookings_no_overlap
    EXCLUDE USING GIST (listing_id WITH =, stay WITH &&) WHERE (status IN ('held', 'paid', 'confirmed'))
);
CREATE INDEX bookings_guest_ix ON bookings (guest_id, created_at DESC);

CREATE TABLE payments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id   UUID REFERENCES bookings (id),
  user_id      UUID NOT NULL REFERENCES users (id),
  provider     VARCHAR(12) NOT NULL,
  provider_ref TEXT NOT NULL,
  amount       NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency     CHAR(3) NOT NULL,
  status       VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  raw          JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Idempotency: webhook isla provider_ref labo-jeer ma abuuri karo lacag-bixin labaad
  CONSTRAINT payments_provider_ref_uniq UNIQUE (provider, provider_ref)
);
