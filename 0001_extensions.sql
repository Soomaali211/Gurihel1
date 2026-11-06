-- Extensions loo baahan yahay. (Waxay u baahan yihiin superuser — docker image-ka POSTGRES_USER waa superuser.)
CREATE EXTENSION IF NOT EXISTS postgis;     -- GEOGRAPHY, ST_* (khariidad)
CREATE EXTENSION IF NOT EXISTS citext;      -- email case-insensitive
CREATE EXTENSION IF NOT EXISTS btree_gist;  -- EXCLUDE constraint (ballan-labajibaar ka hortag)

-- Trigger caam ah: updated_at si otomaatig ah
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
