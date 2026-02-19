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
import type { ApiReference } from '@site-factory/shared-models';
import { ApiConnectorApiService } from '../services/api-connector-api.service';
import { ApiConnectorState, INITIAL_API_CONNECTOR_STATE } from '../models/api-connector-state.model';
import type { ApiConnectorFilters } from '../models/api-connector-filters.model';

export const ApiConnectorStore = signalStore(
  { providedIn: 'root' },

  // â”€â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  withState<ApiConnectorState>(INITIAL_API_CONNECTOR_STATE),

  // â”€â”€â”€ Computed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  withComputed(state => ({
    totalPages: computed(() =>
      Math.ceil(state.total() / state.pageSize())
    ),
    hasApiRefs: computed(() => state.apiReferences().length > 0),
    hasError: computed(() => state.error() !== null),
    apiRefCount: computed(() => state.apiReferences().length),
    availableApis: computed(() =>
      state.apiReferences().filter(api => api.isAvailable)
    ),
  })),

  // â”€â”€â”€ Methods â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  withMethods((store, apiService = inject(ApiConnectorApiService)) => ({

    /** Charger les rÃ©fÃ©rences API avec filtres optionnels */
    loadApiReferences: rxMethod<ApiConnectorFilters | void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((filters?: ApiConnectorFilters | void) =>
          apiService.getAll((filters || undefined) as ApiConnectorFilters | undefined).pipe(
            tap(response => {
              patchState(store, {
                apiReferences: response.data,
                total: response.total,
                page: response.page,
                pageSize: response.pageSize,
                isLoading: false,
              });
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors du chargement des API',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Charger une rÃ©fÃ©rence API par ID */
    loadApiRefById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(id =>
          apiService.getById(id).pipe(
            tap(response => {
              patchState(store, {
                selectedApiRef: response.data,
                isLoading: false,
              });
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors du chargement de l\'API',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Synchroniser le cache local depuis WSO2 APIM */
    syncFromWso2: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isSyncing: true, error: null })),
        switchMap(() =>
          apiService.syncFromWso2().pipe(
            tap(() => {
              patchState(store, { isSyncing: false });
            }),
            catchError(error => {
              patchState(store, {
                isSyncing: false,
                error: error?.message ?? 'Erreur lors de la synchronisation WSO2',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** SÃ©lectionner une API */
    selectApiRef(apiRef: ApiReference | null): void {
      patchState(store, { selectedApiRef: apiRef });
    },

    /** Effacer l'erreur */
    clearError(): void {
      patchState(store, { error: null });
    },

    /** RÃ©initialiser le store */
    reset(): void {
      patchState(store, INITIAL_API_CONNECTOR_STATE);
    },
  })),
);
