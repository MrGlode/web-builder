// Public API — core/i18n

// Models
export type { I18nConfig, SupportedLocale } from './lib/models/i18n-config.model';
export { I18N_CONFIG } from './lib/models/i18n-config.model';

// Services
export { TranslationService } from './lib/services/translation.service';

// Pipes
export { TranslatePipe } from './lib/pipes/translate.pipe';

// Providers
export { provideI18n } from './lib/providers/provide-i18n';