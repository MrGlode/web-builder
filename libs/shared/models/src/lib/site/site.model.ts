import { AuditableEntity } from '../common';
import { SiteStatus } from '../common';

export interface Site extends AuditableEntity {
  tenantId: string;
  name: string;
  slug: string;
  domain?: string | null;
  description?: string | null;
  themeId: string;
  defaultLocale: string;
  status: SiteStatus;
  config?: Record<string, unknown> | null;
}

export interface CreateSitePayload {
  tenantId: string;
  name: string;
  slug: string;
  domain?: string;
  description?: string;
  themeId: string;
  defaultLocale?: string;
}

export interface UpdateSitePayload {
  name?: string;
  slug?: string;
  domain?: string;
  description?: string;
  themeId?: string;
  defaultLocale?: string;
  status?: SiteStatus;
  config?: Record<string, unknown>;
}