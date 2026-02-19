export interface MfeRegistryFilters {
  /** Recherche textuelle (nom, code) */
  search?: string;
  /** Filtrer par statut actif/inactif */
  isActive?: boolean;
  /** Pagination */
  page?: number;
  pageSize?: number;
}