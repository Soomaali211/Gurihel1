export interface Env {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  databaseUrl: string;
  corsOrigins: string[];
  jwtSecret: string;
  swaggerEnabled: boolean;
  smsProvider: 'console' | 'none';
}

export const ENV = 'APP_ENV';

type Source = Record<string, string | undefined>;

function parseBool(v: string | undefined, fallback: boolean): boolean {
  if (v === undefined || v === '') return fallback;
  const s = v.trim().toLowerCase();
  if (['1', 'true', 'yes'].includes(s)) return true;
  if (['0', 'false', 'no'].includes(s)) return false;
  throw new Error(`SWAGGER_ENABLED waa inuu noqdaa true ama false (la helay: "${v}")`);
}

/**
 * Akhri oo hubi environment-ka. WAXAA LA JOOJIYAA (fail-fast) haddii qiime khatar ah
 * ama maqan la helo — si aan app-ku ugu bilaabin nidaam aan ammaan ahayn.
 */
export function loadEnv(src: Source = process.env): Env {
  const nodeEnv = (src.NODE_ENV ?? 'development') as Env['nodeEnv'];
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error(`NODE_ENV aan sax ahayn: "${src.NODE_ENV}"`);
  }
  const isProd = nodeEnv === 'production';

  const port = Number(src.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT aan sax ahayn: "${src.PORT}"`);
  }

  const databaseUrl = src.DATABASE_URL ?? '';
  if (!databaseUrl && nodeEnv !== 'test') {
    throw new Error('DATABASE_URL waa loo baahan yahay (eeg .env.example)');
  }

  const corsOrigins = (src.CORS_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (isProd && corsOrigins.length === 0) {
    throw new Error('CORS_ORIGINS waa loo baahan yahay production-ka');
  }
  if (isProd && corsOrigins.includes('*')) {
    throw new Error("CORS_ORIGINS ma noqon karo '*' production-ka");
  }

  const jwtSecret = src.JWT_SECRET ?? '';
  if (nodeEnv !== 'test') {
    if (jwtSecret.length < 32) {
      throw new Error('JWT_SECRET waa inuu ugu yaraan 32 xaraf yahay (orod: make init)');
    }
    if (/CHANGE_ME/i.test(jwtSecret)) {
      throw new Error('JWT_SECRET weli waa tusaalaha (CHANGE_ME) — orod: make init');
    }
  } else if (jwtSecret.length > 0 && jwtSecret.length < 32) {
    throw new Error('JWT_SECRET waa inuu ugu yaraan 32 xaraf yahay');
  }

  // SMS: 'console' (OTP wuxuu ku qoran yahay logs — DEV KALIYA). Production-ka waa diidan yahay.
  const smsRaw = src.SMS_PROVIDER ?? (isProd ? 'none' : 'console');
  if (smsRaw !== 'console' && smsRaw !== 'none') {
    throw new Error(`SMS_PROVIDER aan la aqoon: "${smsRaw}" (console | none)`);
  }
  if (isProd && smsRaw === 'console') {
    throw new Error("SMS_PROVIDER=console looma ogolo production-ka (OTP wuxuu gali lahaa logs)");
  }
  const smsProvider = smsRaw;

  // Swagger: default = ON marka aan production ahayn, OFF production-ka.
  const swaggerEnabled = parseBool(src.SWAGGER_ENABLED, !isProd);

  return { nodeEnv, port, databaseUrl, corsOrigins, jwtSecret, swaggerEnabled, smsProvider };
}

/**
 * Dev kaliya: ka rar .env-ka root-ka (haddii jiro). Ma dib-qoro env-ka hore u jiray.
 * Production-ka waxba lama akhriyo — sirrooyinku waa inay ka yimaadaan deegaanka (secrets manager).
 */
export function loadDotenvForDev(): void {
  if (process.env.NODE_ENV === 'production') return;
  for (const f of ['.env', '../../.env']) {
    try {
      process.loadEnvFile(f);
    } catch {
      /* ma jiro — waa caadi */
    }
  }
}
