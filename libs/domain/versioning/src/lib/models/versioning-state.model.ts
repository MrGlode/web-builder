import type { EntityVersion, WorkflowTransition } from '@site-factory/shared-models';

export interface VersioningState {
  /** Versions d'une entité donnée */
  versions: EntityVersion[];
  /** Version actuellement sélectionnée */
  selectedVersion: EntityVersion | null;
  /** Transitions de la version sélectionnée */
  transitions: WorkflowTransition[];
  /** Chargement en cours */
  isLoading: boolean;
  /** Erreur courante */
  error: string | null;
  /** Pagination */
  total: number;
  page: number;
  pageSize: number;
}

export const INITIAL_VERSIONING_STATE: VersioningState = {
  versions: [],
  selectedVersion: null,
  transitions: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 20,
};