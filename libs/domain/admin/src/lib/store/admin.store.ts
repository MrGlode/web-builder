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
  Theme,
  CreateThemePayload,
  UpsertTranslationPayload,
  UpdateGlobalConfigPayload,
} from '@site-factory/shared-models';
import { AdminApiService } from '../services/admin-api.service';
import { AdminState, INITIAL_ADMIN_STATE } from '../models/admin-state.model';
import type { TranslationFilters, ThemeFilters } from '../models/admin-filters.model';

export const AdminStore = signalStore(
  { providedIn: 'root' },

  // â”€â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  withState<AdminState>(INITIAL_ADMIN_STATE),

  // â”€â”€â”€ Computed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  withComputed(state => ({
    hasThemes: computed(() => state.themes().length > 0),
    hasTranslations: computed(() => state.translations().length > 0),
    hasError: computed(() => state.error() !== null),
    themeCount: computed(() => state.themes().length),
    defaultTheme: computed(() =>
      state.themes().find(t => t.isDefault) ?? null
    ),
    /** Traductions regroupÃ©es par locale */
    translationsByLocale: computed(() => {
      const map = new Map<string, number>();
      for (const t of state.translations()) {
        map.set(t.locale, (map.get(t.locale) ?? 0) + 1);
      }
      return map;
    }),
  })),

  // â”€â”€â”€ Methods â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  withMethods((store, adminApi = inject(AdminApiService)) => ({

    // â”€â”€â”€ Themes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /** Charger les thÃ¨mes */
    loadThemes: rxMethod<ThemeFilters | void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((filters?: ThemeFilters | void) =>
          adminApi.getThemes((filters || undefined) as ThemeFilters | undefined).pipe(
            tap(response => {
              patchState(store, {
                themes: response.data,
                isLoading: false,
              });
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors du chargement des themes',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** CrÃ©er un thÃ¨me */
    createTheme: rxMethod<{ payload: CreateThemePayload; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ payload, onSuccess }) =>
          adminApi.createTheme(payload).pipe(
            tap(response => {
              patchState(store, {
                themes: [...store.themes(), response.data],
                isLoading: false,
              });
              onSuccess?.();
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors de la creation du theme',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Mettre Ã  jour un thÃ¨me */
    updateTheme: rxMethod<{ id: string; payload: Partial<CreateThemePayload>; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, payload, onSuccess }) =>
          adminApi.updateTheme(id, payload).pipe(
            tap(response => {
              patchState(store, {
                themes: store.themes().map(t =>
                  t.id === id ? response.data : t
                ),
                selectedTheme:
                  store.selectedTheme()?.id === id
                    ? response.data
                    : store.selectedTheme(),
                isLoading: false,
              });
              onSuccess?.();
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors de la mise a jour du theme',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Supprimer un thÃ¨me */
    deleteTheme: rxMethod<{ id: string; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, onSuccess }) =>
          adminApi.deleteTheme(id).pipe(
            tap(() => {
              patchState(store, {
                themes: store.themes().filter(t => t.id !== id),
                selectedTheme:
                  store.selectedTheme()?.id === id
                    ? null
                    : store.selectedTheme(),
                isLoading: false,
              });
              onSuccess?.();
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors de la suppression du theme',
              });
              return of(null);
            })
          )
        )
      )
    ),

    // â”€â”€â”€ Translations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /** Charger les traductions */
    loadTranslations: rxMethod<TranslationFilters | void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((filters?: TranslationFilters | void) =>
          adminApi.getTranslations((filters || undefined) as TranslationFilters | undefined).pipe(
            tap(response => {
              patchState(store, {
                translations: response.data,
                isLoading: false,
              });
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors du chargement des traductions',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** CrÃ©er ou mettre Ã  jour une traduction (upsert) */
    upsertTranslation: rxMethod<{ payload: UpsertTranslationPayload; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ payload, onSuccess }) =>
          adminApi.upsertTranslation(payload).pipe(
            tap(response => {
              const existing = store.translations().find(
                t => t.locale === response.data.locale
                  && t.namespace === response.data.namespace
                  && t.key === response.data.key
              );
              const translations = existing
                ? store.translations().map(t =>
                    t.id === response.data.id ? response.data : t
                  )
                : [...store.translations(), response.data];

              patchState(store, { translations, isLoading: false });
              onSuccess?.();
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors de la sauvegarde de la traduction',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Supprimer une traduction */
    deleteTranslation: rxMethod<{ id: string; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, onSuccess }) =>
          adminApi.deleteTranslation(id).pipe(
            tap(() => {
              patchState(store, {
                translations: store.translations().filter(t => t.id !== id),
                isLoading: false,
              });
              onSuccess?.();
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors de la suppression de la traduction',
              });
              return of(null);
            })
          )
        )
      )
    ),

    // â”€â”€â”€ Global Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /** Charger la configuration globale */
    loadGlobalConfigs: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          adminApi.getGlobalConfigs().pipe(
            tap(response => {
              patchState(store, {
                globalConfigs: response.data,
                isLoading: false,
              });
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors du chargement de la configuration',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Mettre Ã  jour un paramÃ¨tre de config */
    updateGlobalConfig: rxMethod<{ key: string; payload: UpdateGlobalConfigPayload; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ key, payload, onSuccess }) =>
          adminApi.updateGlobalConfig(key, payload).pipe(
            tap(response => {
              patchState(store, {
                globalConfigs: store.globalConfigs().map(c =>
                  c.key === key ? response.data : c
                ),
                isLoading: false,
              });
              onSuccess?.();
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors de la mise a jour de la configuration',
              });
              return of(null);
            })
          )
        )
      )
    ),

    // â”€â”€â”€ Common â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    selectTheme(theme: Theme | null): void {
      patchState(store, { selectedTheme: theme });
    },

    clearError(): void {
      patchState(store, { error: null });
    },

    reset(): void {
      patchState(store, INITIAL_ADMIN_STATE);
    },
  })),
);
