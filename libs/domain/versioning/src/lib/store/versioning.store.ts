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
  EntityVersion,
  CreateVersionPayload,
  TransitionPayload,
} from '@site-factory/shared-models';
import { VersioningApiService } from '../services/versioning-api.service';
import { VersioningState, INITIAL_VERSIONING_STATE } from '../models/versioning-state.model';
import type { VersioningFilters } from '../models/versioning-filters.model';

export const VersioningStore = signalStore(
  { providedIn: 'root' },

  // ─── State ──────────────────────────────────────
  withState<VersioningState>(INITIAL_VERSIONING_STATE),

  // ─── Computed ───────────────────────────────────
  withComputed(state => ({
    totalPages: computed(() =>
      Math.ceil(state.total() / state.pageSize())
    ),
    hasVersions: computed(() => state.versions().length > 0),
    hasError: computed(() => state.error() !== null),
    versionCount: computed(() => state.versions().length),
    /** Dernière version publiée */
    latestPublished: computed(() =>
      state.versions().find(v => v.status === 'published') ?? null
    ),
    /** Version courante (plus haut numéro) */
    latestVersion: computed(() => {
      const sorted = [...state.versions()].sort(
        (a, b) => b.versionNumber - a.versionNumber
      );
      return sorted[0] ?? null;
    }),
  })),

  // ─── Methods ────────────────────────────────────
  withMethods((store, versionApi = inject(VersioningApiService)) => ({

    /** Charger les versions d'une entité */
    loadVersions: rxMethod<VersioningFilters>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((filters) =>
          versionApi.getAll(filters).pipe(
            tap(response => {
              patchState(store, {
                versions: response.data,
                total: response.total,
                page: response.page,
                pageSize: response.pageSize,
                isLoading: false,
              });
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors du chargement des versions',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Charger une version par ID */
    loadVersionById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(versionId =>
          versionApi.getById(versionId).pipe(
            tap(response => {
              patchState(store, {
                selectedVersion: response.data,
                isLoading: false,
              });
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors du chargement de la version',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Créer une nouvelle version (snapshot) */
    createVersion: rxMethod<{ payload: CreateVersionPayload; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ payload, onSuccess }) =>
          versionApi.create(payload).pipe(
            tap(response => {
              patchState(store, {
                versions: [response.data, ...store.versions()],
                total: store.total() + 1,
                isLoading: false,
              });
              onSuccess?.();
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors de la creation de la version',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Charger les transitions d'une version */
    loadTransitions: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(versionId =>
          versionApi.getTransitions(versionId).pipe(
            tap(response => {
              patchState(store, {
                transitions: response.data,
                isLoading: false,
              });
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors du chargement des transitions',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Effectuer une transition de statut sur une version */
    transitionVersion: rxMethod<{ versionId: string; payload: TransitionPayload; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ versionId, payload, onSuccess }) =>
          versionApi.transition(versionId, payload).pipe(
            tap(response => {
              patchState(store, {
                versions: store.versions().map(v =>
                  v.id === versionId ? response.data : v
                ),
                selectedVersion:
                  store.selectedVersion()?.id === versionId
                    ? response.data
                    : store.selectedVersion(),
                isLoading: false,
              });
              onSuccess?.();
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors de la transition',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Sélectionner une version */
    selectVersion(version: EntityVersion | null): void {
      patchState(store, { selectedVersion: version, transitions: [] });
    },

    clearError(): void {
      patchState(store, { error: null });
    },

    reset(): void {
      patchState(store, INITIAL_VERSIONING_STATE);
    },
  })),
);