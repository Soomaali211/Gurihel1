-- OTP codes: lambarka lama kaydiyo; kaliya HMAC hash (code_hash).
CREATE TABLE otp_codes (
  id          BIGSERIAL PRIMARY KEY,
  phone       VARCHAR(20) NOT NULL,
  code_hash   TEXT NOT NULL,
  attempts    SMALLINT NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  expires_at  TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  ip          INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX otp_codes_phone_ix ON otp_codes (phone, created_at DESC);

-- Refresh tokens: kaliya SHA-256 hash; family_id = silsilad rotation ah (reuse detection).
CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  family_id   UUID NOT NULL,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  replaced_by UUID,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX refresh_tokens_user_ix ON refresh_tokens (user_id);
CREATE INDEX refresh_tokens_family_ix ON refresh_tokens (family_id);
