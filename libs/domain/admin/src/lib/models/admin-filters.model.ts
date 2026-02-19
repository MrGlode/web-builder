export interface TranslationFilters {
  /** Filtrer par locale (ex: 'fr', 'en') */
  locale?: string;
  /** Filtrer par namespace (ex: 'common', 'site:xxx') */
  namespace?: string;
  /** Recherche textuelle sur la clé */
  search?: string;
}

export interface ThemeFilters {
  /** Recherche textuelle (nom, code) */
  search?: string;
}