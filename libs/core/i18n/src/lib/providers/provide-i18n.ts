import { APP_INITIALIZER, Provider } from '@angular/core';
import { I18N_CONFIG, I18nConfig } from '../models/i18n-config.model';
import { TranslationService } from '../services/translation.service';

/**
 * Configure le service i18n et charge les traductions au démarrage.
 *
 * Usage dans app.config.ts :
 * ```
 * provideI18n({
 *   defaultLocale: 'fr',
 *   availableLocales: ['fr', 'en'],
 *   translationBasePath: '/assets/i18n',
 *   debugMissing: !environment.production,
 * })
 * ```
 */
export function provideI18n(config: I18nConfig): Provider[] {
  return [
    { provide: I18N_CONFIG, useValue: config },
    {
      provide: APP_INITIALIZER,
      useFactory: (translationService: TranslationService) => {
        return () => translationService.init();
      },
      deps: [TranslationService],
      multi: true,
    },
  ];
}