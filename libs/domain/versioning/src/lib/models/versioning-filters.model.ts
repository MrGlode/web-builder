import type { VersionStatus } from '@site-factory/shared-models';

export interface VersioningFilters {
  /** Type d'entité — OBLIGATOIRE */
  entityType: string;
  /** ID de l'entité — OBLIGATOIRE */
  entityId: string;
  /** Filtrer par statut */
  status?: VersionStatus;
  /** Pagination */
  page?: number;
  pageSize?: number;
}