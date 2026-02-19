import { Provider } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from '../interceptors/error.interceptor';
import { loadingInterceptor } from '../interceptors/loading.interceptor';

/**
 * Configure le client HTTP avec les interceptors de la plateforme.
 * À utiliser dans app.config.ts :
 *
 * ```typescript
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpCore(),
 *   ],
 * };
 * ```
 */
export function provideHttpCore(): Provider[] {
  return [
    provideHttpClient(
      withInterceptors([loadingInterceptor, errorInterceptor])
    ) as unknown as Provider,
  ];
}