import type { UserProfile, Role, UserSiteRole } from '@site-factory/shared-models';

export interface IamState {
  /** Utilisateurs de la plateforme */
  users: UserProfile[];
  /** Utilisateur actuellement sélectionné */
  selectedUser: UserProfile | null;
  /** Rôles disponibles */
  roles: Role[];
  /** Assignations rôle/site de l'utilisateur sélectionné */
  userSiteRoles: UserSiteRole[];
  /** Chargement en cours */
  isLoading: boolean;
  /** Erreur courante */
  error: string | null;
  /** Pagination (utilisateurs) */
  total: number;
  page: number;
  pageSize: number;
}

export const INITIAL_IAM_STATE: IamState = {
  users: [],
  selectedUser: null,
  roles: [],
  userSiteRoles: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 20,
};