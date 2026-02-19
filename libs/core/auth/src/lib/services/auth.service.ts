import { Injectable, inject, signal, computed } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { take } from 'rxjs';
import { AuthState, INITIAL_AUTH_STATE } from '../models/auth-state.model';
import { AuthUser } from '../models/auth-user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oidc = inject(OidcSecurityService);

  private readonly state = signal<AuthState>(INITIAL_AUTH_STATE);

  /** L'utilisateur est-il authentifié ? */
  readonly isAuthenticated = computed(() => this.state().isAuthenticated);

  /** Utilisateur courant */
  readonly currentUser = computed(() => this.state().user);

  /** Token d'accès courant */
  readonly accessToken = computed(() => this.state().accessToken);

  /** Chargement en cours (check initial) */
  readonly isLoading = computed(() => this.state().isLoading);

  /** Wso2 subject ID (raccourci) */
  readonly userSub = computed(() => this.state().user?.sub ?? null);

  /**
   * Initialise l'auth — à appeler au démarrage de l'app.
   * Vérifie si l'utilisateur a déjà une session active.
   */
  init(): void {
    this.oidc.checkAuth().pipe(take(1)).subscribe({
      next: ({ isAuthenticated, userData, accessToken }) => {
        this.state.set({
          isAuthenticated,
          user: isAuthenticated ? this.mapUser(userData) : null,
          accessToken: accessToken ?? null,
          isLoading: false,
        });
      },
      error: () => {
        this.state.set({ ...INITIAL_AUTH_STATE, isLoading: false });
      },
    });
  }

  /** Redirige vers la page de login WSO2 IS */
  login(): void {
    this.oidc.authorize();
  }

  /** Déconnexion */
  logout(): void {
    this.oidc.logoff().pipe(take(1)).subscribe();
    this.state.set({ ...INITIAL_AUTH_STATE, isLoading: false });
  }

  /** Vérifie si l'utilisateur a une permission donnée */
  hasPermission(permission: string): boolean {
    return this.state().user?.permissions?.includes(permission) ?? false;
  }

  /** Vérifie si l'utilisateur a un rôle donné */
  hasRole(role: string): boolean {
    return this.state().user?.roles?.includes(role) ?? false;
  }

  /** Force le refresh du token */
  refreshToken(): void {
    this.oidc.forceRefreshSession().pipe(take(1)).subscribe({
      next: ({ isAuthenticated, userData, accessToken }) => {
        this.state.set({
          isAuthenticated,
          user: isAuthenticated ? this.mapUser(userData) : null,
          accessToken: accessToken ?? null,
          isLoading: false,
        });
      },
      error: () => {
        this.state.set({ ...INITIAL_AUTH_STATE, isLoading: false });
      },
    });
  }

  private mapUser(userData: unknown): AuthUser | null {
    if (!userData || typeof userData !== 'object') return null;

    const data = userData as Record<string, unknown>;

    return {
      sub: (data['sub'] as string) ?? '',
      email: (data['email'] as string) ?? '',
      displayName:
        (data['name'] as string) ??
        (data['preferred_username'] as string) ??
        (data['email'] as string) ??
        '',
      roles: Array.isArray(data['roles']) ? (data['roles'] as string[]) : [],
      permissions: Array.isArray(data['permissions'])
        ? (data['permissions'] as string[])
        : [],
    };
  }
}