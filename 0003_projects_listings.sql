CREATE TABLE projects (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     UUID NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  city           TEXT,
  district       TEXT,
  address        TEXT,
  geom           GEOGRAPHY(Point, 4326),
  stage          VARCHAR(12) NOT NULL DEFAULT 'off_plan' CHECK (stage IN ('off_plan', 'building', 'ready')),
  starting_price NUMERIC(14, 2) CHECK (starting_price IS NULL OR starting_price >= 0),
  currency       CHAR(3) NOT NULL DEFAULT 'USD',
  hero_url       TEXT,
  featured_until TIMESTAMPTZ,
  handover_date  DATE,
  status         VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'live', 'rejected', 'archived')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX projects_city_ix ON projects (city, status);

CREATE TABLE units (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  code       TEXT,
  type       TEXT,
  area_m2    NUMERIC(10, 2) CHECK (area_m2 IS NULL OR area_m2 > 0),
  bedrooms   SMALLINT CHECK (bedrooms IS NULL OR bedrooms >= 0),
  price      NUMERIC(14, 2) CHECK (price IS NULL OR price >= 0),
  floor      SMALLINT,
  status     VARCHAR(10) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold'))
);

CREATE TYPE listing_purpose AS ENUM ('sale', 'rent', 'booking');
CREATE TYPE listing_status AS ENUM ('draft', 'pending', 'live', 'rejected', 'sold', 'expired');

CREATE TABLE listings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id       UUID NOT NULL REFERENCES users (id),
  company_id     UUID REFERENCES companies (id) ON DELETE SET NULL,
  project_id     UUID REFERENCES projects (id) ON DELETE SET NULL,
  purpose        listing_purpose NOT NULL,
  property_type  VARCHAR(20) NOT NULL,
  title          TEXT,
  description    TEXT,
  price          NUMERIC(14, 2) NOT NULL CHECK (price >= 0),
  currency       CHAR(3) NOT NULL DEFAULT 'USD',
  price_unit     VARCHAR(10) NOT NULL DEFAULT 'total' CHECK (price_unit IN ('total', 'month', 'year', 'night')),
  area_m2        NUMERIC(10, 2) CHECK (area_m2 IS NULL OR area_m2 > 0),
  bedrooms       SMALLINT CHECK (bedrooms IS NULL OR bedrooms >= 0),
  living_rooms   SMALLINT CHECK (living_rooms IS NULL OR living_rooms >= 0),
  bathrooms      SMALLINT CHECK (bathrooms IS NULL OR bathrooms >= 0),
  amenities      JSONB NOT NULL DEFAULT '{}'::jsonb,
  city           TEXT,
  district       TEXT,
  address        TEXT,
  geom           GEOGRAPHY(Point, 4326) NOT NULL,
  verified       BOOLEAN NOT NULL DEFAULT false,
  featured_until TIMESTAMPTZ,
  status         listing_status NOT NULL DEFAULT 'pending',
  views          INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX listings_geom_gix ON listings USING GIST (geom);
CREATE INDEX listings_search_ix ON listings (status, purpose, property_type, price);
CREATE INDEX listings_city_ix ON listings (city, district);
CREATE INDEX listings_owner_ix ON listings (owner_id);

CREATE TABLE media (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings (id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects (id) ON DELETE CASCADE,
  kind       VARCHAR(8) NOT NULL CHECK (kind IN ('image', 'video', 'plan', 'tour360')),
  url        TEXT NOT NULL,
  thumb_url  TEXT,
  blurhash   TEXT,
  position   SMALLINT NOT NULL DEFAULT 0,
  CHECK (listing_id IS NOT NULL OR project_id IS NOT NULL)
);
CREATE INDEX media_listing_ix ON media (listing_id, position);

CREATE TABLE favorites (
  user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);
