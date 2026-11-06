# WP0 — Xaaladda skeleton-ka & tallaabooyinka xiga

Ku salaysan "Warbixinta Qaybaha Dhismaha" (WP0–WP10).

## WP0 — Hawlaha

| ID | Hawl | Xaalad |
|---|---|---|
| 0.1 | Monorepo + conventions | ✅ (folders, `.editorconfig`; branching = `main`/`develop`) |
| 0.2 | Docker Compose: Postgres+PostGIS, Redis, MinIO | ✅ la qoray — ⚠️ lama orodsiin (docker daemon ma jirin) |
| 0.3 | CI/CD: lint, test, build | ✅ `ci.yml` la qoray — ⚠️ weli lama orodsiin GitHub-ka; deploy staging ❌ |
| 0.4 | Environments + secrets manager | 🟡 `.env` dev kaliya; staging/prod ❌ |
| 0.5 | Observability (Sentry, logs, uptime) | ❌ |
| 0.6 | NestJS skeleton (health, OpenAPI, validation, error) | ✅ la tijaabiyay (unit+e2e+live) |
| 0.7 | Migrations + seed | ✅ migrations la tijaabiyay (Postgres 16 maxalli); ❌ seed data |
| 0.8 | Flutter skeleton | ✅ koodh la qoray — ⚠️ lama orodsiin (Flutter SDK ma jirin) |
| 0.9 | Akoonnada (Play, Apple, Firebase, Maps keys, domain) | ❌ (adiga ayaa sameyn doona) |

## WP2 — Auth, Users & Roles (backend)

| ID | Hawl | Xaalad |
|---|---|---|
| 2.1 | OTP request/verify + rate-limit | ✅ (HMAC hash, 5 daqiiqo, 5 isku-day, 3 codsi/10 daqiiqo/nambar + 5/10 daqiiqo/IP). ❌ **CAPTCHA** |
| 2.1b | **SMS provider dhab ah** | ❌ — `SmsSender` interface + `console` (dev) kaliya. Ku dar Twilio/Africa's Talking/WhatsApp |
| 2.2 | JWT access (15m) + refresh (30d) rotation + reuse-detection | ✅ ❌ device registry (push token) |
| 2.3 | users/profiles/roles | ✅ `/me` GET+PATCH (full_name, lang). Email, avatar ❌ |
| 2.4 | RBAC guards + audit_logs middleware | ✅ guard global (`@Public`, `@Roles`) — ❌ audit_logs middleware, ❌ endpoints ee beddelka doorka (admin) |
| 2.5 | KYC | ❌ |
| 2.6–2.7 | Mobile: login/profile | ❌ |
| 2.8 | Tests | ✅ 17 e2e DB dhab ah + mutation check |

**Xad la ogaado:** doorka iyo xaaladda (blocked) waxay ku dhaqmaan **access token-ka** ugu badnaan 15 daqiiqo (`/me` iyo refresh waa hubiyaan DB). Haddii loo baahdo kicin degdeg ah, ku dar hubin DB guard-ka dhexdiisa.

## Tallaabada xigta (Sprint 1 — WP2 + WP1)

1. `make init && make up && make migrate` → hubi API `/health/ready` = 200
2. Flutter: `flutter create .` + `flutter analyze` + `flutter test`
3. GitHub: push, daar CI, hubi 4 jobs cagaar
4. WP2 (hadhay): SMS provider dhab ah, CAPTCHA, KYC, audit log, Mobile login
5. WP1: hi-fi Figma → tokens (`packages/design-tokens`) → Flutter ThemeData
6. Admin: gelitaan dhab ah (SSO + 2FA) — halkan `(app)/layout.tsx` ayaa TODO leh

## Go'aamo furan

- Backend: ESM vs CommonJS (eeg ADR-0001)
- Migrations runner: sii wad runner-kan fudud, ama u wareeg Prisma/Flyway (go'aanso WP0.7)
- Isha xaqiiqda: ERD/migration vs Blueprint — migration-ku waa kan runta ah
