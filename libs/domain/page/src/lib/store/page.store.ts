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
import type { Page, CreatePagePayload, UpdatePagePayload } from '@site-factory/shared-models';
import { PageApiService } from '../services/page-api.service';
import { PageState, INITIAL_PAGE_STATE } from '../models/page-state.model';
import type { PageFilters } from '../models/page-filters.model';

/**
 * Noeud d'arbre pour la représentation hiérarchique des pages.
 */
export interface PageTreeNode {
  page: Page;
  children: PageTreeNode[];
}

/**
 * Construit un arbre à partir d'une liste plate de pages.
 */
function buildPageTree(pages: Page[]): PageTreeNode[] {
  const map = new Map<string, PageTreeNode>();
  const roots: PageTreeNode[] = [];

  // Créer tous les noeuds
  for (const page of pages) {
    map.set(page.id, { page, children: [] });
  }

  // Relier parents → enfants
  for (const page of pages) {
    const node = map.get(page.id)!;
    if (page.parentId && map.has(page.parentId)) {
      map.get(page.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Trier par position à chaque niveau
  const sortByPosition = (nodes: PageTreeNode[]): void => {
    nodes.sort((a, b) => a.page.position - b.page.position);
    nodes.forEach(n => sortByPosition(n.children));
  };

  sortByPosition(roots);
  return roots;
}

export const PageStore = signalStore(
  { providedIn: 'root' },

  // ─── State ──────────────────────────────────────
  withState<PageState>(INITIAL_PAGE_STATE),

  // ─── Computed ───────────────────────────────────
  withComputed(state => ({
    /** Nombre total de pages (pagination) */
    totalPages: computed(() =>
      Math.ceil(state.total() / state.pageSize())
    ),

    /** Y a-t-il des pages chargées ? */
    hasPages: computed(() => state.pages().length > 0),

    /** Le store est-il dans un état d'erreur ? */
    hasError: computed(() => state.error() !== null),

    /** Nombre de pages chargées */
    pageCount: computed(() => state.pages().length),

    /** Arborescence calculée à partir de la liste plate */
    pageTree: computed(() => buildPageTree(state.pages())),

    /** Pages racines uniquement */
    rootPages: computed(() =>
      state.pages()
        .filter(p => !p.parentId)
        .sort((a, b) => a.position - b.position)
    ),
  })),

  // ─── Methods ────────────────────────────────────
  withMethods((store, pageApi = inject(PageApiService)) => ({

    /** Définir le site courant et charger ses pages */
    loadPages: rxMethod<PageFilters>(
      pipe(
        tap((filters) => patchState(store, {
          isLoading: true,
          error: null,
          selectedSiteId: filters.siteId,
        })),
        switchMap((filters) =>
          pageApi.getAll(filters).pipe(
            tap(response => {
              patchState(store, {
                pages: response.data,
                total: response.total,
                page: response.page,
                pageSize: response.pageSize,
                isLoading: false,
              });
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors du chargement des pages',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Charger une page par son ID */
    loadPageById: rxMethod<{ siteId: string; pageId: string }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ siteId, pageId }) =>
          pageApi.getById(siteId, pageId).pipe(
            tap(response => {
              patchState(store, {
                selectedPage: response.data,
                isLoading: false,
              });
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors du chargement de la page',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Créer une nouvelle page */
    createPage: rxMethod<{ siteId: string; payload: CreatePagePayload; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ siteId, payload, onSuccess }) =>
          pageApi.create(siteId, payload).pipe(
            tap(response => {
              patchState(store, {
                pages: [...store.pages(), response.data],
                total: store.total() + 1,
                isLoading: false,
              });
              onSuccess?.();
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors de la creation de la page',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Mettre à jour une page */
    updatePage: rxMethod<{ siteId: string; pageId: string; payload: UpdatePagePayload; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ siteId, pageId, payload, onSuccess }) =>
          pageApi.update(siteId, pageId, payload).pipe(
            tap(response => {
              patchState(store, {
                pages: store.pages().map(p =>
                  p.id === pageId ? response.data : p
                ),
                selectedPage:
                  store.selectedPage()?.id === pageId
                    ? response.data
                    : store.selectedPage(),
                isLoading: false,
              });
              onSuccess?.();
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors de la mise a jour de la page',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Supprimer une page */
    deletePage: rxMethod<{ siteId: string; pageId: string; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ siteId, pageId, onSuccess }) =>
          pageApi.delete(siteId, pageId).pipe(
            tap(() => {
              patchState(store, {
                pages: store.pages().filter(p => p.id !== pageId),
                selectedPage:
                  store.selectedPage()?.id === pageId
                    ? null
                    : store.selectedPage(),
                total: store.total() - 1,
                isLoading: false,
              });
              onSuccess?.();
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors de la suppression de la page',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Sélectionner une page */
    selectPage(page: Page | null): void {
      patchState(store, { selectedPage: page });
    },

    /** Effacer l'erreur */
    clearError(): void {
      patchState(store, { error: null });
    },

    /** Réinitialiser le store */
    reset(): void {
      patchState(store, INITIAL_PAGE_STATE);
    },
  })),
);