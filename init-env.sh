#!/bin/sh
# Abuur .env cusub oo leh sirro random ah. Ma dhaafo (ma dib-qoro) .env jira.
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="$ROOT/.env"

if [ -e "$TARGET" ]; then
  echo ".env hore ayuu u jiray — lama taabanin ($TARGET)"
  exit 0
fi

if ! command -v openssl >/dev/null 2>&1; then
  echo "KHALAD: openssl lama helin. Rakib openssl ama ka koobiyee .env.example gacanta." >&2
  exit 1
fi

PG_PASS="$(openssl rand -hex 16)"
REDIS_PASS="$(openssl rand -hex 16)"
MINIO_PASS="$(openssl rand -hex 16)"
JWT="$(openssl rand -hex 32)"

# umask 077 => faylku waa u akhrisan karaa isticmaalaha oo keliya
umask 077
cat > "$TARGET" <<EOF
POSTGRES_USER=gurihel
POSTGRES_PASSWORD=$PG_PASS
POSTGRES_DB=gurihel
REDIS_PASSWORD=$REDIS_PASS
MINIO_ROOT_USER=gurihel_minio
MINIO_ROOT_PASSWORD=$MINIO_PASS

NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://gurihel:$PG_PASS@127.0.0.1:5432/gurihel
CORS_ORIGINS=http://localhost:3001
JWT_SECRET=$JWT
SMS_PROVIDER=console
SWAGGER_ENABLED=true

NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
EOF

echo ".env waa la abuuray ($TARGET) — sirro random ah. Ha commit gareyn."
