import { Provider } from '@angular/core';
import { APP_CONFIG, AppConfig } from '../models/app-config.model';

/**
 * Fournit la configuration applicative a l'injection Angular.
 *
 * Usage dans app.config.ts :
 * `
 * import { environment } from '../environments/environment';
 * provideConfig(environment)
 * `
 */
export function provideConfig(config: AppConfig): Provider {
  return { provide: APP_CONFIG, useValue: config };
}
