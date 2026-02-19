export interface AuthUser {
  sub: string;
  email: string;
  displayName: string;
  roles?: string[];
  permissions?: string[];
}