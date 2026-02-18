import { AuditableEntity } from '../common';
import { PageStatus } from '../common';

export interface SeoConfig {
  title?: string;
  description?: string;
  ogImage?: string;
  robots?: string;
  canonical?: string;
}

export interface Page extends AuditableEntity {
  siteId: string;
  parentId?: string | null;
  layoutId: string;
  title: string;
  slug: string;
  path: string;
  position: number;
  status: PageStatus;
  seoConfig?: SeoConfig | null;
  config?: Record<string, unknown> | null;
}

export interface CreatePagePayload {
  siteId: string;
  parentId?: string;
  layoutId: string;
  title: string;
  slug: string;
  position?: number;
  seoConfig?: SeoConfig;
}

export interface UpdatePagePayload {
  parentId?: string | null;
  layoutId?: string;
  title?: string;
  slug?: string;
  position?: number;
  status?: PageStatus;
  seoConfig?: SeoConfig;
  config?: Record<string, unknown>;
}