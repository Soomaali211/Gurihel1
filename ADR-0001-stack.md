# ADR-0001 — Doorashada stack-ka

**Taariikh:** 2026-11-05 · **Xaalad:** La aqbalay (skeleton)

## Go'aanka

| Lakab | Doorasho | Sababta kooban |
|---|---|---|
| Mobile | Flutter + go_router | Hal code Android+iOS, RTL |
| API | **NestJS 11 (CommonJS)** + TypeScript 5.9 | Qaab moduul ah |
| DB | PostgreSQL 16 + PostGIS | Geo queries, EXCLUDE constraint ballan |
| Cache/Queue | Redis (la diyaariyay docker-ka; weli lama isticmaalo) | |
| Storage | MinIO (dev) / S3-R2 (prod) (weli lama isticmaalo) | |
| Admin | Next.js 16 (App Router) | |

## Sababaha nooca (versions) la xiray

- **NestJS 11, ma aha 12:** `@nestjs/*` v12 waa **ESM-only** (lama `require` kari karo). Skeleton-ku wuxuu isticmaalaa CommonJS (ts-jest + Nest CLI si fudud u shaqeeya). Haddii kooxdu rabto ESM, samee ADR cusub.
- **TypeScript 5.9.3, ma aha 6/7:** `ts-jest` wuxuu taageeraa `typescript <7`; 5.9 waa ugu xasilloon.
- **`multer` 2.5.0 (override):** `@nestjs/platform-express` 11.x wuxuu soo dhex qaadaa `multer` 2.0–2.4 oo leh daciifnimo DoS (GHSA-q7qp-rjg7-q26m). `overrides` ayaa lagu xiray 2.5.0. Ka saar override marka Nest uu cusboonaysiiyo.

## Raadinta xigta

Tan dib u eeg marka WP2 (auth) la bilaabo.
