import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { ENV, loadEnv } from '../src/config/env';
import { PG_POOL } from '../src/db/db.module';

const TEST_ENV = loadEnv({ NODE_ENV: 'test', CORS_ORIGINS: 'http://localhost:3001', JWT_SECRET: 'x'.repeat(48) });

async function makeApp(query: () => Promise<unknown>): Promise<NestExpressApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(ENV)
    .useValue(TEST_ENV)
    .overrideProvider(PG_POOL)
    .useValue({ query, end: async () => undefined })
    .compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>();
  configureApp(app, TEST_ENV);
  await app.init();
  return app;
}

describe('Health (e2e)', () => {
  let app: NestExpressApplication;
  afterEach(async () => app?.close());

  it('GET /api/v1/health → 200 + headers amni (helmet), x-powered-by la dami', async () => {
    app = await makeApp(async () => ({ rows: [{ '?column?': 1 }] }));
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    expect(res.body.status).toBe('ok');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('GET /api/v1/health/ready → 200 marka DB nool tahay', async () => {
    app = await makeApp(async () => ({ rows: [] }));
    const res = await request(app.getHttpServer()).get('/api/v1/health/ready').expect(200);
    expect(res.body).toEqual({ status: 'ready', db: 'up' });
  });

  it('GET /api/v1/health/ready → 503 marka DB dhacdo, SIRTA khaladka lama muujiyo', async () => {
    app = await makeApp(async () => {
      throw new Error('password authentication failed for user "secret_user"');
    });
    const res = await request(app.getHttpServer()).get('/api/v1/health/ready').expect(503);
    expect(res.body.db).toBe('down');
    expect(JSON.stringify(res.body)).not.toContain('secret_user');
  });

  it('route aan jirin → 404', async () => {
    app = await makeApp(async () => ({ rows: [] }));
    await request(app.getHttpServer()).get('/api/v1/nope').expect(404);
  });

  it('rate-limit: GET /api/v1 → 429 kadib 120 codsi/daqiiqad; /health waa ka reeban yahay', async () => {
    app = await makeApp(async () => ({ rows: [] }));
    const server = app.getHttpServer();
    for (let i = 0; i < 120; i++) await request(server).get('/api/v1').expect(200);
    await request(server).get('/api/v1').expect(429);
    await request(server).get('/api/v1/health').expect(200); // SkipThrottle
  });

  it('CORS: origin aan liiska ku jirin ma helo Access-Control-Allow-Origin', async () => {
    app = await makeApp(async () => ({ rows: [] }));
    const bad = await request(app.getHttpServer()).get('/api/v1/health').set('Origin', 'https://evil.example');
    expect(bad.headers['access-control-allow-origin']).toBeUndefined();
    const good = await request(app.getHttpServer()).get('/api/v1/health').set('Origin', 'http://localhost:3001');
    expect(good.headers['access-control-allow-origin']).toBe('http://localhost:3001');
  });
});
