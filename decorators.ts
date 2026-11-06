import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import type { AuthUser, UserRole } from './auth.types';

export const IS_PUBLIC = 'isPublic';
export const ROLES = 'roles';

/** Route furan (aan token u baahnayn). Dhammaan route-yada kale waa XIRAN yihiin (global guard). */
export const Public = () => SetMetadata(IS_PUBLIC, true);

/** Kaliya doorarkan (admin had iyo jeer ma aha ogolaansho toos ah — ku qor si cad). */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES, roles);

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthUser => {
  return ctx.switchToHttp().getRequest().user as AuthUser;
});
