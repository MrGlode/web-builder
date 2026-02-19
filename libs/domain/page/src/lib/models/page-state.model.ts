import type { Page } from '@site-factory/shared-models';

export interface PageState {
  /** Pages chargées pour le site courant */
  pages: Page[];
  /** Page actuellement sélectionnée */
  selectedPage: Page | null;
  /** Site courant (contexte) */
  selectedSiteId: string | null;
  /** Chargement en cours */
  isLoading: boolean;
  /** Erreur courante */
  error: string | null;
  /** Pagination */
  total: number;
  page: number;
  pageSize: number;
}

export const INITIAL_PAGE_STATE: PageState = {
  pages: [],
  selectedPage: null,
  selectedSiteId: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 50,
};