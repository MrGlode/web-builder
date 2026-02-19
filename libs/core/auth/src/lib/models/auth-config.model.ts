import { InjectionToken } from '@angular/core';

export interface SfAuthConfig {
  /** WSO2 IS issuer URL (ex: https://is.company.com/oauth2/token) */
  issuerUrl: string;
  /** Client ID enregistré dans WSO2 IS */
  clientId: string;
  /** Redirect URI après login (ex: http://localhost:4200) */
  redirectUri: string;
  /** Post-logout redirect URI */
  postLogoutRedirectUri: string;
  /** Scopes demandés */
  scopes: string;
  /** URL de l'API protégée (pour le token interceptor) */
  securedApiUrls: string[];
}

export const SF_AUTH_CONFIG = new InjectionToken<SfAuthConfig>('SF_AUTH_CONFIG');

export const DEFAULT_AUTH_CONFIG: SfAuthConfig = {
  issuerUrl: 'https://is.placeholder.company.com/oauth2/token',
  clientId: 'site-factory-cms',
  redirectUri: 'http://localhost:4200',
  postLogoutRedirectUri: 'http://localhost:4200',
  scopes: 'openid profile email',
  securedApiUrls: ['https://api.placeholder.company.com'],
};