import { SiteStatus } from '@site-factory/shared-models';

export interface SiteFilters {
  search?: string;
  tenantId?: string;
  status?: SiteStatus;
  page?: number;
  pageSize?: number;
}