import { InjectionToken } from '@angular/core';

/**
 * Noms d'environnement supportes.
 */
export type EnvironmentName = 'development' | 'staging' | 'production';

/**
 * Configuration applicative globale.
 * Contrat unique - chaque environnement doit l'implementer entierement.
 */
export interface AppConfig {
  /** Nom de l'environnement courant */
  readonly environment: EnvironmentName;

  /** Indique si on est en mode production */
  readonly production: boolean;

  /** Base URL de l'API backend (sans trailing slash) - ex: 'https://api.company.com' ou '' en dev */
  readonly apiBaseUrl: string;

  /** Configuration WSO2 IS */
  readonly auth: {
    readonly issuerUrl: string;
    readonly clientId: string;
    readonly scopes: string;
    readonly securedApiUrls: readonly string[];
  };

  /** Configuration WSO2 APIM (lecture catalogue) */
  readonly apim: {
    readonly portalUrl: string;
  };

  /** Feature flags */
  readonly features: {
    readonly enableMocks: boolean;
    readonly enableDebugTools: boolean;
  };
}

/**
 * Token d'injection pour la configuration applicative.
 */
export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
