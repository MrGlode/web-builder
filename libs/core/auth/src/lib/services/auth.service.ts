import { Injectable, inject, signal, computed } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { take } from 'rxjs';
import { AuthState, INITIAL_AUTH_STATE } from '../models/auth-state.model';
import { AuthUser } from '../models/auth-user.model';
import { APP_CONFIG } from '@site-factory/core-config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oidc = inject(OidcSecurityService);
  private readonly config = inject(APP_CONFIG);

  private readonly state = signal<AuthState>(INITIAL_AUTH_STATE);

  readonly isAuthenticated = computed(() => this.state().isAuthenticated);
  readonly currentUser = computed(() => this.state().user);
  readonly accessToken = computed(() => this.state().accessToken);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly userSub = computed(() => this.state().user?.sub ?? null);

  /**
   * Initialise l'auth — à appeler au démarrage de l'app.
   * En mode mock, simule un utilisateur authentifié sans contacter WSO2.
   */
  init(): void {
    // ─── Mode mock : pas de WSO2, on simule un user ───
    if (this.config.features.enableMocks) {
      this.state.set({
        isAuthenticated: true,
        user: {
          sub: 'mock-user-001',
          email: 'dev@site-factory.local',
          displayName: 'Dev User',
          roles: ['admin'],
          permissions: ['*'],
        },
        accessToken: 'mock-access-token',
        isLoading: false,
      });
      return;
    }

    // ─── Mode réel : check auth WSO2 IS ───
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