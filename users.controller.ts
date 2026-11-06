import { BadRequestException, Body, Controller, Get, Inject, Patch, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Pool } from 'pg';
import type { AuthUser } from '../../common/auth.types';
import { CurrentUser } from '../../common/decorators';
import { PG_POOL } from '../../db/db.module';
import { UpdateMeDto } from './users.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('me')
export class UsersController {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  @Get()
  me(@CurrentUser() user: AuthUser) {
    return this.load(user.id);
  }

  @Patch()
  async update(@CurrentUser() user: AuthUser, @Body() dto: UpdateMeDto) {
    if (dto.full_name === undefined && dto.lang === undefined) {
      throw new BadRequestException('Ugu yaraan hal field (full_name ama lang)');
    }
    const c = await this.pool.connect();
    try {
      await c.query('BEGIN');
      if (dto.lang !== undefined) await c.query('UPDATE users SET lang = $2 WHERE id = $1', [user.id, dto.lang]);
      if (dto.full_name !== undefined) {
        await c.query(
          `INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)
           ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name`,
          [user.id, dto.full_name],
        );
      }
      await c.query('COMMIT');
    } catch (e) {
      await c.query('ROLLBACK').catch(() => undefined);
      throw e;
    } finally {
      c.release();
    }
    return this.load(user.id);
  }

  private async load(id: string) {
    const { rows } = await this.pool.query(
      `SELECT u.id, u.phone, u.email, u.role, u.lang, p.full_name, p.kyc_status
         FROM users u LEFT JOIN profiles p ON p.user_id = u.id
        WHERE u.id = $1 AND u.status = 'active'`,
      [id],
    );
    if (!rows[0]) throw new UnauthorizedException(); // isticmaale la xiray/tirtiray, token-ku weli sax yahay
    return rows[0];
  }
}
