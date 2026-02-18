export interface Role {
  id: string;
  name: string;
  description?: string | null;
  permissions: string[];
  isSystem: boolean;
  createdAt: Date;
}

export interface UserSiteRole {
  id: string;
  userId: string;
  siteId?: string | null;
  roleId: string;
  grantedBy: string;
  createdAt: Date;
}

export type Permission =
  | 'site:read'
  | 'site:write'
  | 'site:delete'
  | 'page:read'
  | 'page:write'
  | 'page:publish'
  | 'page:delete'
  | 'block:read'
  | 'block:write'
  | 'block:delete'
  | 'user:read'
  | 'user:write'
  | 'user:delete'
  | 'role:manage'
  | 'config:read'
  | 'config:write'
  | 'mfe:read'
  | 'mfe:write'
  | 'version:read'
  | 'version:approve'
  | 'version:publish';