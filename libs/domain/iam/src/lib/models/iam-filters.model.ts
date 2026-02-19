export interface IamFilters {
  /** Recherche textuelle (email, nom) */
  search?: string;
  /** Filtrer par rôle */
  roleId?: string;
  /** Filtrer par site */
  siteId?: string;
  /** Filtrer par statut actif */
  isActive?: boolean;
  /** Pagination */
  page?: number;
  pageSize?: number;
}