import type { AuditLog } from '@site-factory/shared-models';

export interface AuditState {
  /** Entrées d'audit chargées */
  logs: AuditLog[];
  /** Chargement en cours */
  isLoading: boolean;
  /** Erreur courante */
  error: string | null;
  /** Pagination */
  total: number;
  page: number;
  pageSize: number;
}

export const INITIAL_AUDIT_STATE: AuditState = {
  logs: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 50,
};