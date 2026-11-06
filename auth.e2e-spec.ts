import { Controller, Get } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import * as jwtlib from 'jsonwebtoken';
import { Pool } from 'pg';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { Roles } from '../src/common/decorators';
import { ENV, loadEnv } from '../src/config/env';
import { SmsSender } from '../src/modules/auth/sms.sender';

// Controller tijaabo kaliya: RBAC
@Controller('test-rbac')
class RbacProbeController {
  @Get('admin')
  @Roles('admin')
  admin() {
    return { ok: true };
  }
  @Get('staff')
  @Roles('moderator', 'admin')
  staff() {
    return { ok: true };
  }
}

const DB = process.env.TEST_DATABASE_URL;
const suite = DB ? describe : describe.skip; // DB dhab ah ayaa loo baahan yahay: TEST_DATABASE_URL=postgres://.../gurihel_test

const SECRET = 'e2e-secret-'.padEnd(48, 'z');
const PHONE = '+252630000001';
const PHONE2 = '+252630000002';

suite('Auth + Users + RBAC (e2e, Postgres dhab ah)', () => {
  let app: NestExpressApplication;
  let pool: Pool;
  let sent: { phone: string; text: string }[];
  const env = () => loadEnv({ NODE_ENV: 'test', CORS_ORIGINS: 'http://localhost:3001', JWT_SECRET: SECRET, DATABASE_URL: DB });
  const http = () => request(app.getHttpServer());
  const lastCode = (phone: string) => {
    const m = [...sent].reverse().find((s) => s.phone === phone);
    return (m?.text.match(/\b(\d{6})\b/) ?? [])[1] as string;
  };
  const login = async (phone = PHONE) => {
    await http().post('/api/v1/auth/otp/request').send({ phone }).expect(202);
    const res = await http().post('/api/v1/auth/otp/verify').send({ phone, code: lastCode(phone) }).expect(200);
    return res.body as { access_token: string; refresh_token: string };
  };
  const bearer = (t: string) => ({ Authorization: `Bearer ${t}` });

  beforeAll(() => {
    if (!/test/i.test(new URL(DB as string).pathname)) throw new Error('TEST_DATABASE_URL waa inuu magaca DB ku jiraa "test" (TRUNCATE ayaa la sameeyaa)');
    pool = new Pool({ connectionString: DB });
  });
  afterAll(async () => pool?.end());

  beforeEach(async () => {
    await pool.query('TRUNCATE otp_codes, refresh_tokens, profiles, users RESTART IDENTITY CASCADE');
    sent = [];
    const mod = await Test.createTestingModule({ imports: [AppModule], controllers: [RbacProbeController] })
      .overrideProvider(ENV)
      .useValue(env())
      .overrideProvider(SmsSender)
      .useValue({ send: async (phone: string, text: string) => void sent.push({ phone, text }) })
      .compile();
    app = mod.createNestApplication<NestExpressApplication>();
    configureApp(app, env());
    await app.init();
  });
  afterEach(async () => app?.close());

  // ------------------------------------------------------------------ route-yada xiran
  it('/me token la\'aan → 401; token been → 401; alg=none → 401; secret kale → 401; token dhacay → 401', async () => {
    await http().get('/api/v1/me').expect(401);
    await http().get('/api/v1/me').set(bearer('abc.def.ghi')).expect(401);
    const none = Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url') + '.' + Buffer.from(JSON.stringify({ sub: 'x', role: 'admin' })).toString('base64url') + '.';
    await http().get('/api/v1/me').set(bearer(none)).expect(401);
    const wrongSecret = jwtlib.sign({ sub: 'x', role: 'admin' }, 'another-secret'.padEnd(40, 'q'), { issuer: 'gurihel-api', audience: 'gurihel-clients', expiresIn: 60 });
    await http().get('/api/v1/me').set(bearer(wrongSecret)).expect(401);
    const expired = jwtlib.sign({ sub: 'x', role: 'seeker' }, SECRET, { issuer: 'gurihel-api', audience: 'gurihel-clients', expiresIn: -10 });
    await http().get('/api/v1/me').set(bearer(expired)).expect(401);
    const wrongAud = jwtlib.sign({ sub: 'x', role: 'seeker' }, SECRET, { issuer: 'gurihel-api', audience: 'other', expiresIn: 60 });
    await http().get('/api/v1/me').set(bearer(wrongAud)).expect(401);
  });

  it('/health iyo / waa furan yihiin (Public)', async () => {
    await http().get('/api/v1').expect(200);
  });

  // ------------------------------------------------------------------ OTP
  it('OTP request: phone aan sax ahayn → 400; fields dheeraad ah → 400', async () => {
    await http().post('/api/v1/auth/otp/request').send({ phone: '0630000001' }).expect(400);
    await http().post('/api/v1/auth/otp/request').send({ phone: PHONE, role: 'admin' }).expect(400);
    expect(sent).toHaveLength(0);
  });

  it('OTP: DB-ga kuma kaydsana koodhka cad (hash kaliya); SMS wuu dhacay', async () => {
    await http().post('/api/v1/auth/otp/request').send({ phone: PHONE }).expect(202);
    const code = lastCode(PHONE);
    expect(code).toMatch(/^\d{6}$/);
    const { rows } = await pool.query('SELECT code_hash FROM otp_codes');
    expect(rows[0].code_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(rows[0].code_hash).not.toContain(code);
  });

  it('OTP: koodh qaldan → 401; isku-dayo 5 kadib koodhka saxda ahna waa la xidhaa', async () => {
    await http().post('/api/v1/auth/otp/request').send({ phone: PHONE }).expect(202);
    const good = lastCode(PHONE);
    const bad = good === '000000' ? '111111' : '000000';
    for (let i = 0; i < 5; i++) await http().post('/api/v1/auth/otp/verify').send({ phone: PHONE, code: bad }).expect(401);
    await http().post('/api/v1/auth/otp/verify').send({ phone: PHONE, code: good }).expect(401);
  });

  it('OTP: hal mar kaliya la isticmaali karaa; dhacay → 401', async () => {
    await http().post('/api/v1/auth/otp/request').send({ phone: PHONE }).expect(202);
    const code = lastCode(PHONE);
    await http().post('/api/v1/auth/otp/verify').send({ phone: PHONE, code }).expect(200);
    await http().post('/api/v1/auth/otp/verify').send({ phone: PHONE, code }).expect(401);

    await http().post('/api/v1/auth/otp/request').send({ phone: PHONE2 }).expect(202);
    await pool.query(`UPDATE otp_codes SET expires_at = now() - interval '1 second' WHERE phone = $1`, [PHONE2]);
    await http().post('/api/v1/auth/otp/verify').send({ phone: PHONE2, code: lastCode(PHONE2) }).expect(401);
  });

  it('OTP: koodhka nambar kale ma isticmaali karo', async () => {
    await http().post('/api/v1/auth/otp/request').send({ phone: PHONE }).expect(202);
    await http().post('/api/v1/auth/otp/request').send({ phone: PHONE2 }).expect(202);
    await http().post('/api/v1/auth/otp/verify').send({ phone: PHONE2, code: lastCode(PHONE) === lastCode(PHONE2) ? '000001' : lastCode(PHONE) }).expect(401);
  });

  it('OTP request: 4aad ee nambar isku mid ah 10 daqiiqo gudahood → 429 (xad DB)', async () => {
    for (let i = 0; i < 3; i++) await http().post('/api/v1/auth/otp/request').send({ phone: PHONE }).expect(202);
    await http().post('/api/v1/auth/otp/request').send({ phone: PHONE }).expect(429);
    expect(sent).toHaveLength(3);
  });

  it('OTP request: IP rate-limit → 429 kadib 5 codsi (nambarro kala duwan)', async () => {
    for (let i = 0; i < 5; i++) await http().post('/api/v1/auth/otp/request').send({ phone: `+25263000010${i}` }).expect(202);
    await http().post('/api/v1/auth/otp/request').send({ phone: '+252630000199' }).expect(429);
  });

  // ------------------------------------------------------------------ Login + /me
  it('login → tokens; /me wuxuu soo celiyaa seeker; role/status/phone lama beddeli karo (mass assignment)', async () => {
    const t = await login();
    const me = await http().get('/api/v1/me').set(bearer(t.access_token)).expect(200);
    expect(me.body).toMatchObject({ phone: PHONE, role: 'seeker', lang: 'so' });

    const upd = await http().patch('/api/v1/me').set(bearer(t.access_token)).send({ full_name: 'Faadumo Axmed', lang: 'en' }).expect(200);
    expect(upd.body).toMatchObject({ full_name: 'Faadumo Axmed', lang: 'en' });

    await http().patch('/api/v1/me').set(bearer(t.access_token)).send({ role: 'admin' }).expect(400);
    await http().patch('/api/v1/me').set(bearer(t.access_token)).send({ status: 'active', phone: '+1' }).expect(400);
    await http().patch('/api/v1/me').set(bearer(t.access_token)).send({}).expect(400);
    await http().patch('/api/v1/me').set(bearer(t.access_token)).send({ lang: 'fr' }).expect(400);
    const { rows } = await pool.query('SELECT role FROM users WHERE phone = $1', [PHONE]);
    expect(rows[0].role).toBe('seeker');
  });

  it('Refresh tokens: DB-ga kuma kaydsana cad (hash kaliya)', async () => {
    const t = await login();
    const { rows } = await pool.query('SELECT token_hash FROM refresh_tokens');
    expect(rows[0].token_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(rows[0].token_hash).not.toBe(t.refresh_token);
  });

  // ------------------------------------------------------------------ Refresh rotation
  it('refresh: token cusub; kan hore dib loo isticmaalo → 401 + silsiladda oo dhan waa la xidhaa', async () => {
    const t1 = await login();
    const r = await http().post('/api/v1/auth/refresh').send({ refresh_token: t1.refresh_token }).expect(200);
    expect(r.body.refresh_token).not.toBe(t1.refresh_token);
    await http().get('/api/v1/me').set(bearer(r.body.access_token)).expect(200);

    // Reuse (hubaal: lagu tuhmay xad) → 401 iyo kan cusubna wuu dhacayaa
    await http().post('/api/v1/auth/refresh').send({ refresh_token: t1.refresh_token }).expect(401);
    await http().post('/api/v1/auth/refresh').send({ refresh_token: r.body.refresh_token }).expect(401);
  });

  it('refresh: laba codsi isku mar ah isla token → hal keliya ayaa guuleysta', async () => {
    const t = await login();
    const [a, b] = await Promise.all([
      http().post('/api/v1/auth/refresh').send({ refresh_token: t.refresh_token }),
      http().post('/api/v1/auth/refresh').send({ refresh_token: t.refresh_token }),
    ]);
    expect([a.status, b.status].sort()).toEqual([200, 401]);
  });

  it('refresh: token been / gaaban → 401 / 400; dhacay → 401', async () => {
    const t = await login();
    await http().post('/api/v1/auth/refresh').send({ refresh_token: 'x'.repeat(43) }).expect(401);
    await http().post('/api/v1/auth/refresh').send({ refresh_token: 'short' }).expect(400);
    await pool.query(`UPDATE refresh_tokens SET expires_at = now() - interval '1 second'`);
    await http().post('/api/v1/auth/refresh').send({ refresh_token: t.refresh_token }).expect(401);
  });

  // ------------------------------------------------------------------ Logout
  it('logout: silsiladda waa la xidhaa; token-ka isticmaale kale waxba ma xidho', async () => {
    const a = await login(PHONE);
    const b = await login(PHONE2);
    // B wuxuu isku dayaa inuu xidho A token-kiisa → waxba (204 laakiin A wuu shaqeynayaa)
    await http().post('/api/v1/auth/logout').set(bearer(b.access_token)).send({ refresh_token: a.refresh_token }).expect(204);
    const ra = await http().post('/api/v1/auth/refresh').send({ refresh_token: a.refresh_token }).expect(200);

    await http().post('/api/v1/auth/logout').set(bearer(a.access_token)).send({ refresh_token: ra.body.refresh_token }).expect(204);
    await http().post('/api/v1/auth/refresh').send({ refresh_token: ra.body.refresh_token }).expect(401);
    await http().post('/api/v1/auth/logout').send({ refresh_token: ra.body.refresh_token }).expect(401); // token la'aan
  });

  // ------------------------------------------------------------------ Isticmaale la xiray
  it('isticmaale blocked: verify → 403; refresh → 401; /me → 401', async () => {
    const t = await login();
    await pool.query(`UPDATE users SET status = 'blocked' WHERE phone = $1`, [PHONE]);
    await http().get('/api/v1/me').set(bearer(t.access_token)).expect(401);
    await http().post('/api/v1/auth/refresh').send({ refresh_token: t.refresh_token }).expect(401);

    await http().post('/api/v1/auth/otp/request').send({ phone: PHONE }).expect(202);
    await http().post('/api/v1/auth/otp/verify').send({ phone: PHONE, code: lastCode(PHONE) }).expect(403);
  });

  // ------------------------------------------------------------------ RBAC
  it('RBAC: seeker → 403 admin route; admin → 200; moderator → staff 200 / admin 403', async () => {
    const t = await login();
    await http().get('/api/v1/test-rbac/admin').expect(401);
    await http().get('/api/v1/test-rbac/admin').set(bearer(t.access_token)).expect(403);
    await http().get('/api/v1/test-rbac/staff').set(bearer(t.access_token)).expect(403);

    await pool.query(`UPDATE users SET role = 'moderator' WHERE phone = $1`, [PHONE]);
    const m = await login(); // login cusub → role cusub token-ka
    await http().get('/api/v1/test-rbac/staff').set(bearer(m.access_token)).expect(200);
    await http().get('/api/v1/test-rbac/admin').set(bearer(m.access_token)).expect(403);

    await pool.query(`UPDATE users SET role = 'admin' WHERE phone = $1`, [PHONE]);
    const rr = await http().post('/api/v1/auth/refresh').send({ refresh_token: m.refresh_token }).expect(200); // refresh → role cusub
    await http().get('/api/v1/test-rbac/admin').set(bearer(rr.body.access_token)).expect(200);
  });
});
