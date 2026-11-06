# GuriHel — Real Estate App (repo skeleton · WP0)

Monorepo: **API** (NestJS) · **Admin** (Next.js) · **Mobile** (Flutter) · **infra** (Docker) · **CI** (GitHub Actions).

> Skeleton = gogol shaqeynaya, ma aha app dhammaystiran. Eeg `docs/ROADMAP.md` (waxa la sameeyay iyo waxa weli dhiman) iyo `docs/VERIFICATION.md` (waxa la tijaabiyay iyo waxa aan la tijaabin).

## Folders

```
gurihel/
├─ apps/
│  ├─ api/      NestJS 11 · /api/v1/health · Swagger · migrations (db/migrations) · 13 module stubs
│  ├─ admin/    Next.js 16 · shell + sidebar + login (disabled) · API status check
│  └─ mobile/   Flutter · 6-tab shell (Profile · Listings · Projects · Bookings · Chat · Services)
├─ infra/       docker-compose.yml (Postgres+PostGIS, Redis, MinIO — localhost kaliya)
├─ packages/    design-tokens
├─ scripts/     init-env.sh
├─ docs/        ADR-0001-stack.md · ROADMAP.md · VERIFICATION.md
└─ .github/     workflows/ci.yml
```

## Shuruudaha

Node ≥ 20 (22 la tijaabiyay) · Docker · Flutter stable · `openssl` · `make`

## Bilow degdeg

```bash
make init            # abuur .env oo leh sirro random ah (ha commit gareyn)
make up              # Postgres+PostGIS, Redis, MinIO (127.0.0.1 kaliya)

cd apps/api && npm ci && cd ../..
make migrate         # ku dar database schema
make api             # http://localhost:3000/api/v1/health   ·  Swagger: /api/docs

cd apps/admin && npm ci && cd ../..
make admin           # http://localhost:3001

cd apps/mobile       # eeg apps/mobile/README.md (flutter create . ; flutter test)
```

Hubi: `curl localhost:3000/api/v1/health/ready` → `{"status":"ready","db":"up"}`

**Auth (dev):** `POST /api/v1/auth/otp/request {"phone":"+252..."}` → koodhka waxaad ka akhrisaa **logs-ka API-ga** (`DEV-SMS`) → `POST /auth/otp/verify` → tokens → `GET /me` (`Authorization: Bearer …`). Route kasta waa XIRAN ilaa `@Public()` la saaro.

**E2E (Postgres dhab ah):** `TEST_DATABASE_URL=postgres://…/gurihel_test npm run test:e2e` (magaca DB waa inuu ku jiraa "test" — TRUNCATE ayaa la sameeyaa). Haddii aan la dejin, tijaabooyinka auth waa la boodayaa.

## Amniga — aqri `SECURITY.md`

`.env` ha commit gareyn · dekedaha docker waa localhost · production: `JWT_SECRET` ≥ 32 xaraf, CORS liis cad, Swagger OFF.

## Habka shaqada

- Branches: `main` (deployable) · `develop` · feature branches gaagaaban
- Commits: Conventional Commits (`feat(api): …`)
- Migration hore la fuliyay **ha la wax-ka-beddelin** (checksum ayaa diidaya) — samee mid cusub
- PR kasta: lint + tests cagaar (CI)
