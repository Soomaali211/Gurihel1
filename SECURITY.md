# Amniga (Security)

## Xeerarka repo-ga

- **Ha commit gareyn sirro.** `.env`, furayaal (`*.pem`, `*.key`), `google-services.json`, `GoogleService-Info.plist` waa ku jiraan `.gitignore`.
- `make init` wuxuu abuuraa `.env` oo leh sirro random ah (`openssl rand`), fayl-ka oo leh ogolaansho `600`.
- Dekedaha docker waxay ku xidhan yihiin **127.0.0.1** kaliya.
- Production-ka: sirrooyinka ka soo qaad secrets manager (AWS SM / Doppler), ma aha `.env`.

## Waxa API-gu hadda sameeyo

- `helmet` (headers amni), `x-powered-by` waa la damiyay
- CORS liis cad (`CORS_ORIGINS`); `*` waa la diidaa production-ka
- `ValidationPipe`: `whitelist` + `forbidNonWhitelisted`
- Rate-limit: 120 codsi/daqiiqad/IP (`/health` waa ka reeban yahay)
- `loadEnv`: app-ku ma bilaabmo production-ka haddii `JWT_SECRET` &lt; 32 xaraf ama CHANGE_ME, ama CORS `*`
- `/api/docs` (Swagger) default = OFF production-ka
- `/health/ready` ma muujiyo faahfaahinta khaladka DB

## Auth (WP2)

- Route kasta waa XIRAN default (global `JwtAuthGuard`); `@Public()` si cad ayaa loo qoraa
- JWT HS256 (algorithms la xaddiday), issuer + audience la hubiyo, 15 daqiiqo
- OTP: 6 lambar `crypto.randomInt`, HMAC hash, 5 daqiiqo, 5 isku-day, hal mar, 3/10 daqiiqo/nambar
- Refresh: random 256-bit, hash SHA-256 kaliya DB-ga, rotation + reuse-detection (silsilad oo dhan ayaa la xidhaa)
- `/me` kaliya `full_name` iyo `lang` ayuu beddelayaa; `role` waa 400
- `SMS_PROVIDER=console` (OTP logs-ka) looma ogolo production-ka

## Weli lama sameynin (ha u malayn inay jiraan)

SMS provider dhab ah, CAPTCHA, KYC, audit_logs, CSP (Admin), cert pinning (Mobile), WAF, pen-test, backups. Eeg `docs/ROADMAP.md`.

## Soo sheeg daciifnimo

La xiriir mas'uulka mashruuca si gooni ah (ha u furin issue dadweyne).
