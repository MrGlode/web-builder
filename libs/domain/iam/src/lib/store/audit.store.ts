import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { AuditApiService } from '../services/audit-api.service';
import { AuditState, INITIAL_AUDIT_STATE } from '../models/audit-state.model';
import type { AuditFilters } from '../models/audit-filters.model';

/**
 * Store pour la consultation des logs d'audit.
 * READ-ONLY : pas de create/update/delete.
 */
export const AuditStore = signalStore(
  { providedIn: 'root' },

  // â”€â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  withState<AuditState>(INITIAL_AUDIT_STATE),

  // â”€â”€â”€ Computed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  withComputed(state => ({
    totalPages: computed(() =>
      Math.ceil(state.total() / state.pageSize())
    ),
    hasLogs: computed(() => state.logs().length > 0),
    hasError: computed(() => state.error() !== null),
    logCount: computed(() => state.logs().length),
  })),

  // â”€â”€â”€ Methods â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  withMethods((store, auditApi = inject(AuditApiService)) => ({

    /** Charger les logs d'audit avec filtres */
    loadLogs: rxMethod<AuditFilters | void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((filters?: AuditFilters | void) =>
          auditApi.getAll((filters || undefined) as AuditFilters | undefined).pipe(
            tap(response => {
              patchState(store, {
                logs: response.data,
                total: response.total,
                page: response.page,
                pageSize: response.pageSize,
                isLoading: false,
              });
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors du chargement des logs d\'audit',
              });
              return of(null);
            })
          )
        )
      )
    ),

    clearError(): void {
      patchState(store, { error: null });
    },

    reset(): void {
      patchState(store, INITIAL_AUDIT_STATE);
    },
  })),
);
