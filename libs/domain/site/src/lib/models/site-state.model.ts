import { Site } from '@site-factory/shared-models';

export interface SiteState {
  /** Liste des sites chargés */
  sites: Site[];
  /** Site actuellement sélectionné */
  selectedSite: Site | null;
  /** Chargement en cours */
  isLoading: boolean;
  /** Erreur courante */
  error: string | null;
  /** Pagination */
  total: number;
  page: number;
  pageSize: number;
}

export const INITIAL_SITE_STATE: SiteState = {
  sites: [],
  selectedSite: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 20,
};