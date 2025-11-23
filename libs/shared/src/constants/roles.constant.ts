export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  VENDOR = 'VENDOR',
  SUPPORT = 'SUPPORT',
}

export const ROLES = {
  USER: UserRole.USER,
  ADMIN: UserRole.ADMIN,
  VENDOR: UserRole.VENDOR,
  SUPPORT: UserRole.SUPPORT,
} as const;
