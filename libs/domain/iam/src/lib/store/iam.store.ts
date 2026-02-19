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
import type { UserProfile, UserSiteRole } from '@site-factory/shared-models';
import { IamApiService } from '../services/iam-api.service';
import { IamState, INITIAL_IAM_STATE } from '../models/iam-state.model';
import type { IamFilters } from '../models/iam-filters.model';

export const IamStore = signalStore(
  { providedIn: 'root' },

  // â”€â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  withState<IamState>(INITIAL_IAM_STATE),

  // â”€â”€â”€ Computed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  withComputed(state => ({
    totalPages: computed(() =>
      Math.ceil(state.total() / state.pageSize())
    ),
    hasUsers: computed(() => state.users().length > 0),
    hasError: computed(() => state.error() !== null),
    userCount: computed(() => state.users().length),
    activeUsers: computed(() => state.users().filter(u => u.isActive)),
    systemRoles: computed(() => state.roles().filter(r => r.isSystem)),
    customRoles: computed(() => state.roles().filter(r => !r.isSystem)),
  })),

  // â”€â”€â”€ Methods â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  withMethods((store, iamApi = inject(IamApiService)) => ({

    /** Charger la liste des utilisateurs */
    loadUsers: rxMethod<IamFilters | void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((filters?: IamFilters | void) =>
          iamApi.getUsers((filters || undefined) as IamFilters | undefined).pipe(
            tap(response => {
              patchState(store, {
                users: response.data,
                total: response.total,
                page: response.page,
                pageSize: response.pageSize,
                isLoading: false,
              });
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors du chargement des utilisateurs',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Charger un utilisateur par ID */
    loadUserById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(id =>
          iamApi.getUserById(id).pipe(
            tap(response => {
              patchState(store, {
                selectedUser: response.data,
                isLoading: false,
              });
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors du chargement de l\'utilisateur',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Charger tous les rÃ´les disponibles */
    loadRoles: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          iamApi.getRoles().pipe(
            tap(response => {
              patchState(store, {
                roles: response.data,
                isLoading: false,
              });
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors du chargement des roles',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Charger les assignations rÃ´le/site d'un utilisateur */
    loadUserSiteRoles: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(userId =>
          iamApi.getUserSiteRoles(userId).pipe(
            tap(response => {
              patchState(store, {
                userSiteRoles: response.data,
                isLoading: false,
              });
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors du chargement des assignations',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** Assigner un rÃ´le Ã  un utilisateur */
    assignRole: rxMethod<{ userId: string; roleId: string; siteId?: string; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ userId, roleId, siteId, onSuccess }) =>
          iamApi.assignRole(userId, roleId, siteId).pipe(
            tap(response => {
              patchState(store, {
                userSiteRoles: [...store.userSiteRoles(), response.data],
                isLoading: false,
              });
              onSuccess?.();
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors de l\'assignation du role',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** RÃ©voquer un rÃ´le */
    revokeRole: rxMethod<{ userId: string; assignmentId: string; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ userId, assignmentId, onSuccess }) =>
          iamApi.revokeRole(userId, assignmentId).pipe(
            tap(() => {
              patchState(store, {
                userSiteRoles: store.userSiteRoles().filter(r => r.id !== assignmentId),
                isLoading: false,
              });
              onSuccess?.();
            }),
            catchError(error => {
              patchState(store, {
                isLoading: false,
                error: error?.message ?? 'Erreur lors de la revocation du role',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /** SÃ©lectionner un utilisateur */
    selectUser(user: UserProfile | null): void {
      patchState(store, { selectedUser: user, userSiteRoles: [] });
    },

    clearError(): void {
      patchState(store, { error: null });
    },

    reset(): void {
      patchState(store, INITIAL_IAM_STATE);
    },
  })),
);
