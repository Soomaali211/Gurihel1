import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { USER_ROLES, type AccessClaims } from './auth.types';
import { IS_PUBLIC } from './decorators';

/** Global guard: token-ka Bearer waa qasab marka route-ku aanu ahayn @Public(). */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [ctx.getHandler(), ctx.getClass()]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest();
    const header: unknown = req.headers?.authorization;
    const [scheme, token] = typeof header === 'string' ? header.split(' ') : [];
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedException();

    try {
      const claims = await this.jwt.verifyAsync<AccessClaims>(token); // algorithm/issuer/audience: JwtModule config
      if (typeof claims.sub !== 'string' || !USER_ROLES.includes(claims.role)) throw new Error('claims');
      req.user = { id: claims.sub, role: claims.role };
      return true;
    } catch {
      throw new UnauthorizedException(); // ha sheegin sababta (dhacay / been / ...)
    }
  }
}
