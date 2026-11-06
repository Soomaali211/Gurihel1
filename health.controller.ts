import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { Pool } from 'pg';
import { Public } from '../common/decorators';
import { PG_POOL } from '../db/db.module';

@ApiTags('health')
@Public()
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  /** Liveness: app-ku wuu nool yahay (ma taabto DB). */
  @Get()
  live() {
    return { status: 'ok', uptime_s: Math.round(process.uptime()), time: new Date().toISOString() };
  }

  /** Readiness: DB-ga wuu ka jawaabayaa? (503 haddii kale). Fariinta khaladka lama muujiyo. */
  @Get('ready')
  async ready() {
    try {
      await this.pool.query('SELECT 1');
      return { status: 'ready', db: 'up' };
    } catch {
      throw new ServiceUnavailableException({ status: 'not_ready', db: 'down' });
    }
  }
}
