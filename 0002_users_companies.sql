CREATE TYPE user_role AS ENUM ('seeker', 'owner', 'broker', 'developer', 'support', 'moderator', 'admin');

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       VARCHAR(20) NOT NULL UNIQUE,
  email       CITEXT UNIQUE,
  role        user_role NOT NULL DEFAULT 'seeker',
  lang        CHAR(2) NOT NULL DEFAULT 'so' CHECK (lang IN ('so', 'en', 'ar')),
  status      VARCHAR(12) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'deleted')),
  verified_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE profiles (
  user_id    UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  full_name  TEXT,
  avatar_url TEXT,
  license_no TEXT,
  district   TEXT,
  bio        TEXT,
  kyc_status VARCHAR(10) NOT NULL DEFAULT 'none' CHECK (kyc_status IN ('none', 'pending', 'approved', 'rejected'))
);

CREATE TABLE companies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   UUID REFERENCES users (id) ON DELETE SET NULL,
  name       TEXT NOT NULL,
  logo_url   TEXT,
  type       VARCHAR(12) NOT NULL CHECK (type IN ('agency', 'developer')),
  verified   BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id         BIGSERIAL PRIMARY KEY,
  actor_id   UUID REFERENCES users (id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  entity     TEXT NOT NULL,
  entity_id  TEXT,
  diff       JSONB,
  ip         INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_entity_ix ON audit_logs (entity, entity_id);
CREATE INDEX audit_logs_actor_ix ON audit_logs (actor_id, created_at DESC);
