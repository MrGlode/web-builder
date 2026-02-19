export interface ApiConnectorFilters {
  /** Recherche textuelle (nom, description) */
  search?: string;
  /** Filtrer par tags */
  tags?: string[];
  /** Filtrer par disponibilité */
  isAvailable?: boolean;
  /** Pagination */
  page?: number;
  pageSize?: number;
}