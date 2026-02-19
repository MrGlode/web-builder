import type { Theme, Translation, GlobalConfig } from '@site-factory/shared-models';

export interface AdminState {
  /** Thèmes Design System */
  themes: Theme[];
  /** Thème actuellement sélectionné */
  selectedTheme: Theme | null;
  /** Traductions chargées */
  translations: Translation[];
  /** Configuration globale plateforme */
  globalConfigs: GlobalConfig[];
  /** Chargement en cours */
  isLoading: boolean;
  /** Erreur courante */
  error: string | null;
}

export const INITIAL_ADMIN_STATE: AdminState = {
  themes: [],
  selectedTheme: null,
  translations: [],
  globalConfigs: [],
  isLoading: false,
  error: null,
};