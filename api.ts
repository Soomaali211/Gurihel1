// URL-ka API-ga (build-time). Ka beddel .env (NEXT_PUBLIC_API_URL). Halkan ha ku qorin sir — NEXT_PUBLIC_* browser-ka ayay gaadhaa.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";
