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
import type { Site } from '@site-factory/shared-models';
import { SiteApiService } from '../services/site-api.service';
import { SiteState, INITIAL_SITE_STATE } from '../models/site-state.model';
import { SiteFilters } from '../models/site-filters.model';

export const SiteStore = signalStore(
  { providedIn: 'root' },

  // ─── State ──────────────────────────────────────
  withState<SiteState>(INITIAL_SITE_STATE),

  // ─── Computed ───────────────────────────────────
  withComputed(state => ({
    /** Nombre total de pages */
    totalPages: computed(() =>
      Math.ceil(state.total() / state.pageSize())
    ),

    /** Y a-t-il des sites chargés ? */
    hasSites: computed(() => state.sites().length > 0),

    /** Le store est-il dans un état d'erreur ? */
    hasError: computed(() => state.error() !== null),

    /** Nombre de sites chargés */
    siteCount: computed(() => state.sites().length),
  })),

  // ─── Methods ────────────────────────────────────
  withMethods((store, siteApi = inject(SiteApiService)) => ({

    /** Charger la liste des sites avec filtres optionnels */
    loadSites: rxMethod<SiteFilters | void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((filters?: SiteFilters | void) =>
          siteApi.getAll(filters ?? undefined).pipe(
            tap(response => {
              patchState(store, {
                sites: response.data,
                total: response.total,
                page: response.page,
                pageSize: response.pageSize,
                isLoading: false,
              });
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors du chargement des sites',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Charger un site par son ID */
    loadSiteById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(id =>
          siteApi.getById(id).pipe(
            tap(response => {
              patchState(store, {
                selectedSite: response.data,
                isLoading: false,
              });
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors du chargement du site',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Créer un nouveau site */
    createSite: rxMethod<{ payload: import('@site-factory/shared-models').CreateSitePayload; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ payload, onSuccess }) =>
          siteApi.create(payload).pipe(
            tap(response => {
              patchState(store, {
                sites: [...store.sites(), response.data],
                total: store.total() + 1,
                isLoading: false,
              });
              onSuccess?.();
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors de la création du site',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Mettre à jour un site */
    updateSite: rxMethod<{ id: string; payload: import('@site-factory/shared-models').UpdateSitePayload; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, payload, onSuccess }) =>
          siteApi.update(id, payload).pipe(
            tap(response => {
              patchState(store, {
                sites: store.sites().map(s =>
                  s.id === id ? response.data : s
                ),
                selectedSite:
                  store.selectedSite()?.id === id
                    ? response.data
                    : store.selectedSite(),
                isLoading: false,
              });
              onSuccess?.();
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors de la mise à jour du site',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Supprimer un site (soft delete) */
    deleteSite: rxMethod<{ id: string; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, onSuccess }) =>
          siteApi.delete(id).pipe(
            tap(() => {
              patchState(store, {
                sites: store.sites().filter(s => s.id !== id),
                selectedSite:
                  store.selectedSite()?.id === id
                    ? null
                    : store.selectedSite(),
                total: store.total() - 1,
                isLoading: false,
              });
              onSuccess?.();
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors de la suppression du site',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Sélectionner un site */
    selectSite(site: Site | null): void {
      patchState(store, { selectedSite: site });
    },

    /** Effacer l'erreur */
    clearError(): void {
      patchState(store, { error: null });
    },

    /** Réinitialiser le store */
    reset(): void {
      patchState(store, INITIAL_SITE_STATE);
    },
  })),
);