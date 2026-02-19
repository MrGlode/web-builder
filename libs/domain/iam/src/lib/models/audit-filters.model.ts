export interface AuditFilters {
  /** Filtrer par type d'entité */
  entityType?: string;
  /** Filtrer par ID d'entité */
  entityId?: string;
  /** Filtrer par utilisateur (auteur) */
  userId?: string;
  /** Filtrer par site */
  siteId?: string;
  /** Filtrer par action */
  action?: string;
  /** Date de début (ISO) */
  dateFrom?: string;
  /** Date de fin (ISO) */
  dateTo?: string;
  /** Pagination */
  page?: number;
  pageSize?: number;
}