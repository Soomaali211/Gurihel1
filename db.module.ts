import { Global, Inject, Injectable, Module, OnApplicationShutdown } from '@nestjs/common';
import { Pool } from 'pg';
import { ENV, Env, loadEnv } from '../config/env';

export const PG_POOL = 'PG_POOL';

@Injectable()
class PoolCloser implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}

@Global()
@Module({
  providers: [
    { provide: ENV, useFactory: (): Env => loadEnv() },
    {
      provide: PG_POOL,
      inject: [ENV],
      // Pool-ku wuxuu ku xirmaa si "caajis" ah (lazy): API wuu bilaabmaa xitaa haddii DB ay dhacsan tahay;
      // /health/ready ayaa sheegaya xaaladda DB.
      useFactory: (env: Env): Pool =>
        new Pool({
          connectionString: env.databaseUrl || undefined,
          max: 10,
          connectionTimeoutMillis: 3000,
          idleTimeoutMillis: 30000,
          statement_timeout: 10000,
        }),
    },
    PoolCloser,
  ],
  exports: [ENV, PG_POOL],
})
export class DbModule {}
