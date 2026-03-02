/**
 * Définition d'une colonne pour sf-data-table.
 */
export interface TableColumn {
  /** Clé de la propriété dans l'objet data (supporte dot notation: 'seo.title') */
  key: string;

  /** Libellé affiché dans le header */
  label: string;

  /** Colonne triable */
  sortable?: boolean;

  /** Largeur CSS (ex: '200px', '30%') */
  width?: string;

  /** Alignement du contenu */
  align?: 'left' | 'center' | 'right';
}

/**
 * Événement de tri émis par sf-data-table.
 */
export interface SortEvent {
  column: string;
  direction: 'asc' | 'desc';
}

/**
 * Élément de fil d'ariane pour sf-page-header.
 */
export interface Breadcrumb {
  label: string;
  route?: string | string[];
}