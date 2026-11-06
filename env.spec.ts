import { loadEnv } from './env';

const base = {
  NODE_ENV: 'production',
  PORT: '3000',
  DATABASE_URL: 'postgres://u:p@127.0.0.1:5432/db',
  CORS_ORIGINS: 'https://admin.example.com',
  JWT_SECRET: 'a'.repeat(40),
};

describe('loadEnv', () => {
  it('aqbalaa qiimayaal production ah oo sax ah', () => {
    const env = loadEnv(base);
    expect(env.nodeEnv).toBe('production');
    expect(env.corsOrigins).toEqual(['https://admin.example.com']);
    expect(env.swaggerEnabled).toBe(false); // production default = OFF
  });

  it('swagger default = ON marka development', () => {
    expect(loadEnv({ ...base, NODE_ENV: 'development' }).swaggerEnabled).toBe(true);
  });

  it("diidaa JWT_SECRET gaaban production-ka", () => {
    expect(() => loadEnv({ ...base, JWT_SECRET: 'short' })).toThrow(/32/);
  });

  it('diidaa JWT_SECRET oo ah tusaalaha CHANGE_ME', () => {
    expect(() => loadEnv({ ...base, JWT_SECRET: 'CHANGE_ME_' + 'x'.repeat(40) })).toThrow(/CHANGE_ME/);
  });

  it("diidaa CORS '*' production-ka", () => {
    expect(() => loadEnv({ ...base, CORS_ORIGINS: '*' })).toThrow(/CORS/);
  });

  it('diidaa JWT_SECRET gaaban xitaa development', () => {
    expect(() => loadEnv({ ...base, NODE_ENV: 'development', JWT_SECRET: 'short' })).toThrow(/32/);
  });

  it('SMS_PROVIDER=console waa la diidaa production-ka; default dev = console, prod = none', () => {
    expect(() => loadEnv({ ...base, SMS_PROVIDER: 'console' })).toThrow(/SMS_PROVIDER/);
    expect(loadEnv({ ...base, NODE_ENV: 'development' }).smsProvider).toBe('console');
    expect(loadEnv(base).smsProvider).toBe('none');
    expect(() => loadEnv({ ...base, SMS_PROVIDER: 'twilio' })).toThrow(/aan la aqoon/);
  });

  it('diidaa DATABASE_URL maqan (ma aha test)', () => {
    expect(() => loadEnv({ ...base, DATABASE_URL: '' })).toThrow(/DATABASE_URL/);
  });

  it('ogolaanayaa DATABASE_URL maqan marka NODE_ENV=test', () => {
    expect(() => loadEnv({ NODE_ENV: 'test' })).not.toThrow();
  });

  it('diidaa PORT aan sax ahayn', () => {
    expect(() => loadEnv({ ...base, PORT: '99999' })).toThrow(/PORT/);
    expect(() => loadEnv({ ...base, PORT: 'abc' })).toThrow(/PORT/);
  });

  it('diidaa NODE_ENV aan la aqoon', () => {
    expect(() => loadEnv({ ...base, NODE_ENV: 'staging' })).toThrow(/NODE_ENV/);
  });
});
