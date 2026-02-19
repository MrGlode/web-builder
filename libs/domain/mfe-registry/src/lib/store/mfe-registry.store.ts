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
import type {
  MicroFrontend,
  CreateMfePayload,
  CreateMfeDeploymentPayload,
} from '@site-factory/shared-models';
import { MfeRegistryApiService } from '../services/mfe-registry-api.service';
import { MfeRegistryState, INITIAL_MFE_REGISTRY_STATE } from '../models/mfe-registry-state.model';
import type { MfeRegistryFilters } from '../models/mfe-registry-filters.model';

export const MfeRegistryStore = signalStore(
  { providedIn: 'root' },

  // â”€â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  withState<MfeRegistryState>(INITIAL_MFE_REGISTRY_STATE),

  // â”€â”€â”€ Computed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  withComputed(state => ({
    totalPages: computed(() =>
      Math.ceil(state.total() / state.pageSize())
    ),
    hasMfes: computed(() => state.mfes().length > 0),
    hasError: computed(() => state.error() !== null),
    mfeCount: computed(() => state.mfes().length),
    activeMfes: computed(() => state.mfes().filter(m => m.isActive)),
    activeDeployments: computed(() =>
      state.deployments().filter(d => d.isActive)
    ),
  })),

  // â”€â”€â”€ Methods â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  withMethods((store, mfeApi = inject(MfeRegistryApiService)) => ({

    /** Charger la liste des MFE */
    loadMfes: rxMethod<MfeRegistryFilters | void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((filters?: MfeRegistryFilters | void) =>
          mfeApi.getAll((filters || undefined) as MfeRegistryFilters | undefined).pipe(
            tap(response => {
              patchState(store, {
                mfes: response.data,
                total: response.total,
                page: response.page,
                pageSize: response.pageSize,
                isLoading: false,
              });
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors du chargement des MFE',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Charger un MFE par ID */
    loadMfeById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(id =>
          mfeApi.getById(id).pipe(
            tap(response => {
              patchState(store, {
                selectedMfe: response.data,
                isLoading: false,
              });
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors du chargement du MFE',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** CrÃ©er un MFE */
    createMfe: rxMethod<{ payload: CreateMfePayload; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ payload, onSuccess }) =>
          mfeApi.create(payload).pipe(
            tap(response => {
              patchState(store, {
                mfes: [...store.mfes(), response.data],
                total: store.total() + 1,
                isLoading: false,
              });
              onSuccess?.();
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors de la creation du MFE',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Mettre Ã  jour un MFE */
    updateMfe: rxMethod<{ id: string; payload: Partial<CreateMfePayload>; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, payload, onSuccess }) =>
          mfeApi.update(id, payload).pipe(
            tap(response => {
              patchState(store, {
                mfes: store.mfes().map(m =>
                  m.id === id ? response.data : m
                ),
                selectedMfe:
                  store.selectedMfe()?.id === id
                    ? response.data
                    : store.selectedMfe(),
                isLoading: false,
              });
              onSuccess?.();
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors de la mise a jour du MFE',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Supprimer un MFE */
    deleteMfe: rxMethod<{ id: string; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, onSuccess }) =>
          mfeApi.delete(id).pipe(
            tap(() => {
              patchState(store, {
                mfes: store.mfes().filter(m => m.id !== id),
                selectedMfe:
                  store.selectedMfe()?.id === id
                    ? null
                    : store.selectedMfe(),
                total: store.total() - 1,
                isLoading: false,
              });
              onSuccess?.();
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors de la suppression du MFE',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Charger les dÃ©ploiements d'un MFE */
    loadDeployments: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(mfeId =>
          mfeApi.getDeployments(mfeId).pipe(
            tap(response => {
              patchState(store, {
                deployments: response.data,
                isLoading: false,
              });
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors du chargement des deploiements',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** CrÃ©er un dÃ©ploiement */
    createDeployment: rxMethod<{ mfeId: string; payload: CreateMfeDeploymentPayload; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ mfeId, payload, onSuccess }) =>
          mfeApi.createDeployment(mfeId, payload).pipe(
            tap(response => {
              patchState(store, {
                deployments: [...store.deployments(), response.data],
                isLoading: false,
              });
              onSuccess?.();
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors de la creation du deploiement',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** SÃ©lectionner un MFE */
    selectMfe(mfe: MicroFrontend | null): void {
      patchState(store, { selectedMfe: mfe, deployments: [] });
    },

    clearError(): void {
      patchState(store, { error: null });
    },

    reset(): void {
      patchState(store, INITIAL_MFE_REGISTRY_STATE);
    },
  })),
);
