export const USER_ROLES = ['seeker', 'owner', 'broker', 'developer', 'support', 'moderator', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Waxa ku jira access token-ka (JWT payload). Ha ku darin xog xasaasi ah. */
export interface AccessClaims {
  sub: string; // user id
  role: UserRole;
}

export interface AuthUser {
  id: string;
  role: UserRole;
}
