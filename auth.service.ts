import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import type { AccessClaims, UserRole } from '../../common/auth.types';
import { ENV, type Env } from '../../config/env';
import { PG_POOL } from '../../db/db.module';
import { SmsSender } from './sms.sender';

export const OTP_TTL_S = 300; // 5 daqiiqo
export const OTP_MAX_ATTEMPTS = 5; // isku-dayo qaldan oo ugu badan koodh kasta
export const OTP_MAX_PER_WINDOW = 3; // codsi OTP ah / nambar / 10 daqiiqo
export const ACCESS_TTL_S = 900; // 15 daqiiqo
export const REFRESH_TTL_DAYS = 30;

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

type VerifyOutcome = { kind: 'ok'; tokens: TokenPair } | { kind: 'bad' } | { kind: 'forbidden' };
type RefreshOutcome = { kind: 'ok'; tokens: TokenPair } | { kind: 'bad' };

@Injectable()
export class AuthService {
  private readonly log = new Logger(AuthService.name);

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    @Inject(ENV) private readonly env: Env,
    private readonly jwt: JwtService,
    private readonly sms: SmsSender,
  ) {}

  // ---------------------------------------------------------------- OTP request
  async requestOtp(phone: string, ip?: string): Promise<{ status: 'sent'; expires_in: number }> {
    const { rows } = await this.pool.query<{ n: string }>(
      `SELECT count(*) AS n FROM otp_codes WHERE phone = $1 AND created_at > now() - interval '10 minutes'`,
      [phone],
    );
    if (Number(rows[0].n) >= OTP_MAX_PER_WINDOW) {
      throw new HttpException('Codsiyo aad u badan. Isku day mar kale daqiiqado gudahood.', HttpStatus.TOO_MANY_REQUESTS);
    }

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const ins = await this.pool.query<{ id: string }>(
      `INSERT INTO otp_codes (phone, code_hash, expires_at, ip)
       VALUES ($1, $2, now() + make_interval(secs => $3), $4) RETURNING id`,
      [phone, this.otpHash(phone, code), OTP_TTL_S, ip ?? null],
    );

    try {
      await this.sms.send(phone, `GuriHel: koodhkaaga waa ${code}. Wuxuu dhacayaa ${OTP_TTL_S / 60} daqiiqo gudahood. Ha la wadaagin.`);
    } catch (err) {
      await this.pool.query('DELETE FROM otp_codes WHERE id = $1', [ins.rows[0].id]).catch(() => undefined);
      this.log.error(`SMS dirista way fashilantay: ${err instanceof Error ? err.message : 'unknown'}`); // ma qorno nambarka/koodhka
      throw err instanceof HttpException ? err : new HttpException('SMS lama diri karo', HttpStatus.SERVICE_UNAVAILABLE);
    }
    return { status: 'sent', expires_in: OTP_TTL_S };
  }

  // ---------------------------------------------------------------- OTP verify
  async verifyOtp(phone: string, code: string, userAgent?: string): Promise<TokenPair> {
    const out = await this.tx<VerifyOutcome>(async (c) => {
      const { rows } = await c.query<{ id: string; code_hash: string; attempts: number }>(
        `SELECT id, code_hash, attempts FROM otp_codes
          WHERE phone = $1 AND consumed_at IS NULL AND expires_at > now()
          ORDER BY created_at DESC, id DESC LIMIT 1 FOR UPDATE`,
        [phone],
      );
      const otp = rows[0];
      if (!otp) return { kind: 'bad' };

      if (otp.attempts >= OTP_MAX_ATTEMPTS) {
        await c.query('UPDATE otp_codes SET consumed_at = now() WHERE id = $1', [otp.id]);
        return { kind: 'bad' };
      }
      await c.query('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1', [otp.id]);

      const a = Buffer.from(otp.code_hash, 'hex');
      const b = Buffer.from(this.otpHash(phone, code), 'hex');
      if (a.length !== b.length || !timingSafeEqual(a, b)) return { kind: 'bad' }; // attempts waa la kaydiyaa (commit)

      await c.query('UPDATE otp_codes SET consumed_at = now() WHERE phone = $1 AND consumed_at IS NULL', [phone]);

      const u = await c.query<{ id: string; role: UserRole; status: string }>(
        `INSERT INTO users (phone, verified_at) VALUES ($1, now())
         ON CONFLICT (phone) DO UPDATE SET verified_at = COALESCE(users.verified_at, now())
         RETURNING id, role, status`,
        [phone],
      );
      const user = u.rows[0];
      if (user.status !== 'active') return { kind: 'forbidden' };

      await c.query('INSERT INTO profiles (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [user.id]);
      const tokens = await this.issue(c, user.id, user.role, undefined, userAgent);
      return { kind: 'ok', tokens };
    });

    if (out.kind === 'ok') return out.tokens;
    if (out.kind === 'forbidden') throw new ForbiddenException('Akoonkan lama isticmaali karo');
    throw new UnauthorizedException('Koodh aan sax ahayn ama dhacay');
  }

  // ---------------------------------------------------------------- Refresh (rotation + reuse detection)
  async refresh(refreshToken: string, userAgent?: string): Promise<TokenPair> {
    const hash = sha256(refreshToken);
    const out = await this.tx<RefreshOutcome>(async (c) => {
      const { rows } = await c.query<{
        id: string;
        user_id: string;
        family_id: string;
        expired: boolean;
        revoked_at: Date | null;
        role: UserRole;
        status: string;
      }>(
        `SELECT rt.id, rt.user_id, rt.family_id, (rt.expires_at <= now()) AS expired, rt.revoked_at, u.role, u.status
           FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id
          WHERE rt.token_hash = $1 FOR UPDATE OF rt`,
        [hash],
      );
      const t = rows[0];
      if (!t) return { kind: 'bad' };

      // Token la isticmaalay hore (revoked) = lagu tuhmanayaa in la xaday → xidh silsiladda oo dhan.
      if (t.revoked_at || t.status !== 'active') {
        await this.revokeFamily(c, t.family_id);
        return { kind: 'bad' };
      }
      if (t.expired) return { kind: 'bad' };

      const tokens = await this.issue(c, t.user_id, t.role, t.family_id, userAgent, t.id);
      return { kind: 'ok', tokens };
    });
    if (out.kind === 'ok') return out.tokens;
    throw new UnauthorizedException();
  }

  // ---------------------------------------------------------------- Logout
  async logout(userId: string, refreshToken: string): Promise<void> {
    // Silsiladda token-kan waa la xidhaa, kaliya haddii uu leeyahay isticmaalaha hadda. Wax khalad ah lama sheego.
    await this.pool.query(
      `UPDATE refresh_tokens SET revoked_at = now()
        WHERE revoked_at IS NULL
          AND family_id = (SELECT family_id FROM refresh_tokens WHERE token_hash = $1 AND user_id = $2)`,
      [sha256(refreshToken), userId],
    );
  }

  // ---------------------------------------------------------------- Helpers
  private otpHash(phone: string, code: string): string {
    return createHmac('sha256', this.env.jwtSecret).update(`otp:${phone}:${code}`).digest('hex');
  }

  private async revokeFamily(c: PoolClient, familyId: string): Promise<void> {
    await c.query('UPDATE refresh_tokens SET revoked_at = now() WHERE family_id = $1 AND revoked_at IS NULL', [familyId]);
  }

  /** Abuur access + refresh. Haddii `rotateFrom` la helo, token-kii hore waa la xidhaa oo la xiriiriyaa kan cusub. */
  private async issue(
    c: PoolClient,
    userId: string,
    role: UserRole,
    familyId?: string,
    userAgent?: string,
    rotateFrom?: string,
  ): Promise<TokenPair> {
    const claims: AccessClaims = { sub: userId, role };
    const access = await this.jwt.signAsync(claims);
    const refresh = randomBytes(32).toString('base64url');
    const ins = await c.query<{ id: string }>(
      `INSERT INTO refresh_tokens (user_id, family_id, token_hash, expires_at, user_agent)
       VALUES ($1, COALESCE($2::uuid, gen_random_uuid()), $3, now() + make_interval(days => $4), $5) RETURNING id`,
      [userId, familyId ?? null, sha256(refresh), REFRESH_TTL_DAYS, (userAgent ?? '').slice(0, 300) || null],
    );
    if (rotateFrom) {
      await c.query('UPDATE refresh_tokens SET revoked_at = now(), replaced_by = $2 WHERE id = $1', [rotateFrom, ins.rows[0].id]);
    }
    return { access_token: access, refresh_token: refresh, token_type: 'Bearer', expires_in: ACCESS_TTL_S };
  }

  /** Transaction: COMMIT haddii fn soo celiyo qiime (xitaa 'bad' — si attempts/revocations u kaydsamaan); ROLLBACK haddii ay tuurto. */
  private async tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    const c = await this.pool.connect();
    try {
      await c.query('BEGIN');
      const r = await fn(c);
      await c.query('COMMIT');
      return r;
    } catch (e) {
      await c.query('ROLLBACK').catch(() => undefined);
      throw e;
    } finally {
      c.release();
    }
  }
}
