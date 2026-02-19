import { InjectionToken } from '@angular/core';

/**
 * Locales supportées par la plateforme.
 */
export type SupportedLocale = 'fr' | 'en';

/**
 * Configuration du service i18n.
 */
export interface I18nConfig {
  /** Locale par défaut au démarrage */
  readonly defaultLocale: SupportedLocale;
  /** Locales disponibles */
  readonly availableLocales: readonly SupportedLocale[];
  /** Chemin de base vers les fichiers JSON de traduction (sans trailing slash) */
  readonly translationBasePath: string;
  /** Afficher les clés manquantes dans la console (dev) */
  readonly debugMissing: boolean;
}

/**
 * Token d'injection pour la configuration i18n.
 */
export const I18N_CONFIG = new InjectionToken<I18nConfig>('I18N_CONFIG');