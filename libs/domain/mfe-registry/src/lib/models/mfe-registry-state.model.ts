import type { MicroFrontend, MfeDeployment } from '@site-factory/shared-models';

export interface MfeRegistryState {
  /** Liste des micro-frontends enregistrés */
  mfes: MicroFrontend[];
  /** MFE actuellement sélectionné */
  selectedMfe: MicroFrontend | null;
  /** Déploiements du MFE sélectionné */
  deployments: MfeDeployment[];
  /** Chargement en cours */
  isLoading: boolean;
  /** Erreur courante */
  error: string | null;
  /** Pagination */
  total: number;
  page: number;
  pageSize: number;
}

export const INITIAL_MFE_REGISTRY_STATE: MfeRegistryState = {
  mfes: [],
  selectedMfe: null,
  deployments: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 20,
};