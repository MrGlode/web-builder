import type { ApiReference } from '@site-factory/shared-models';

export interface ApiConnectorState {
  /** Références API en cache (depuis WSO2 APIM) */
  apiReferences: ApiReference[];
  /** API actuellement sélectionnée */
  selectedApiRef: ApiReference | null;
  /** Chargement en cours */
  isLoading: boolean;
  /** Synchronisation WSO2 en cours */
  isSyncing: boolean;
  /** Erreur courante */
  error: string | null;
  /** Pagination */
  total: number;
  page: number;
  pageSize: number;
}

export const INITIAL_API_CONNECTOR_STATE: ApiConnectorState = {
  apiReferences: [],
  selectedApiRef: null,
  isLoading: false,
  isSyncing: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 20,
};