import type { PageStatus } from '@site-factory/shared-models';

export interface PageFilters {
  /** Site parent — OBLIGATOIRE */
  siteId: string;
  /** Filtrer par page parente (pour navigation arborescente) */
  parentId?: string | null;
  /** Filtrer par statut */
  status?: PageStatus;
  /** Recherche textuelle */
  search?: string;
  /** Pagination */
  page?: number;
  pageSize?: number;
}