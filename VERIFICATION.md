# Waxa la tijaabiyay iyo waxa aan la tijaabin

Taariikh: 2026-11-06 · Deegaan: Linux container, Node 22, PostgreSQL 16 + PostGIS 3.4, **Docker daemon la'aan**, **Flutter la'aan**.

## ✅ La orodsiiyay oo guuleystay

| Qayb | Tijaabo | Natiijo |
|---|---|---|
| API | `tsc --noEmit`, `nest build` | OK |
| API | Unit tests (`loadEnv`: 11) | 11/11 |
| API | e2e (health, helmet, CORS, 503 DB-down iyo sir-ma-muujin, 404, rate-limit 429): 6 (DB mock) | 6/6 |
| **WP2 Auth** | e2e **Postgres dhab ah** (17): token been/alg=none/secret kale/dhacay/audience kale → 401; OTP hash-ka kaliya, 5 isku-day, hal-mar, dhacay, nambar kale, 429 (DB + IP); login, `/me`, mass-assignment (`role` → 400); refresh rotation + reuse → silsilad xidhan; 2 refresh isku-mar → 1 guuleysta; logout; blocked; RBAC (seeker/moderator/admin) | 17/17 |
| **WP2 Auth** | Mutation check: reuse-detection, attempts limit, `FOR UPDATE`, `forbidNonWhitelisted` mid walba la saaray → tijaabo ayaa fashilantay | 4/4 la qabtay |
| **WP2 Auth** | Bilaabis nool: OTP → verify → `/me` 200; production + `SMS_PROVIDER=console` → exit 1; production sms=none → 503 oo koodh logs ku ma jiro | OK |
| API | Bilaabis dhab ah (`node dist/main.js`) + curl: dev, production sax ah, production JWT_SECRET gaaban (exit 1), DB dhacsan (health 200 / ready 503) | OK |
| API | Production: Swagger OFF (`/api/docs` 404); dev: ON | OK |
| API | Rate-limit nool: 130 codsi → 120×200 + 10×429 | OK |
| DB | Migrations 0001–0005 ee **PostgreSQL 16 dhab ah**: run 1, run 2 (idempotent), checksum tamper → diidaa | OK |
| DB | Ballan-labajibaar (`EXCLUDE`): isku-dhac → diidaa; check-out = check-in xiga → ogolaan; cancel kadib dib-ballan → ogolaan; range madhan → diidaa | OK |
| DB | CHECK (qiime xun), payments `(provider, provider_ref)` unique, trigger `updated_at`, `nights` generated | OK |
| **DB (PostGIS 3.4 dhab ah)** | Migrations 0001–0005 **asalka ah** (`CREATE EXTENSION postgis`, `GEOGRAPHY(Point,4326)`, GIST) oo laga rakibay ZIP nadiif ah: run 1 + run 2 idempotent; bbox query → 3/4 saf; `ST_DWithin` 2km → 3; planner wuxuu isticmaalaa `listings_geom_gix`; ballan-labajibaar + `media` CHECK → diidaa | OK |
| **ZIP nadiif ah** | Soo saar → `npm ci` → API lint/unit(11)/e2e(23, PostGIS dhab ah)/build + Admin lint/build; `npm audit` labadaba 0 | OK |
| DB | Dhammaan SQL-ka oo lagu parse gareeyay parser-ka Postgres (`pglast`) | OK |
| Admin | `eslint`, `next build`, `next start`: `/`, `/login`, `/listings`, `/settings` = 200, `/nope` = 404; headers amni jiraan | OK |
| Admin | `npm audit --omit=dev` | 0 |
| API | `npm audit --omit=dev` (kadib multer 2.5.0 override) | 0 |
| Infra | `docker compose config` (syntax + variable required) | OK |
| Scripts | `init-env.sh`: mode 600, sirro random, mar-labaad ma dib-qoro | OK |
| Repo | YAML-yada oo dhan parse; secrets scan nadiif; `.env` waa la ignore-gareeyay | OK |

## ⚠️ Lama tijaabin (ha u qaadan inay shaqeynayaan)

| Qayb | Sababta | Maxaad samaynaysaa |
|---|---|---|
| **Docker** (`make up`, healthchecks, Dockerfile build) | Docker daemon ma jiray | `make up`; `docker build apps/api` |
| **Flutter** (`flutter analyze/test`) | SDK ma jiro oo lama rakibi karo (storage.googleapis.com, pub.dev, GitHub waa xiran yihiin deegaankan). Koodhka waa la qoray laakiin **lama compile gareyn**; nooca `go_router`/API-yada ayaa laga yaabaa inay u baahdaan hagaajin yar | `apps/mobile/README.md` |
| **GitHub Actions** `ci.yml` | YAML syntax kaliya ayaa la hubiyay | Push oo daawo |
| **SMS dhab ah** (Twilio, WhatsApp…) | Ma jiro; kaliya `console` (dev) | Ku dar `SmsSender` cusub |
| Auth: aan la tijaabin | CAPTCHA, KYC, audit_logs, hubinta doorka ee ku jira access token (≤15 daqiiqo), `trust proxy` (IP dhabta ah ka dambeeya Nginx/ALB) | Eeg ROADMAP WP2 |
| Redis, MinIO | Docker la'aan; API weli ma isticmaalo | — |
| Admin ↔ API (CORS browser-ka) | Browser lama isticmaalin | `make api` + `make admin`, fur Dashboard, eeg "API + DB waa nool yihiin" |

## Aan weli jirin (si ula kac ah)

Seed data, deploy staging, Sentry, CSP (Admin). 11 module oo API ah (marka laga reebo `auth`, `users`) waa **madhan** (stubs). Admin iyo Mobile login waa **disabled/ma jiro** — auth-ku waa backend kaliya.

## Go'aamo nooca (versions)

Eeg `docs/ADR-0001-stack.md` (NestJS 11 CommonJS, TypeScript 5.9.3, multer 2.5.0 override).
