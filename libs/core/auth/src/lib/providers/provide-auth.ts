import { APP_INITIALIZER, Provider } from '@angular/core';
import { provideAuth as provideOidc, LogLevel as OidcLogLevel } from 'angular-auth-oidc-client';
import {
  SfAuthConfig,
  SF_AUTH_CONFIG,
  DEFAULT_AUTH_CONFIG,
} from '../models/auth-config.model';
import { AuthService } from '../services/auth.service';

/**
 * Configure l'authentification WSO2 IS pour la plateforme.
 *
 * ```typescript
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     ...provideAuth({
 *       issuerUrl: environment.wso2.issuerUrl,
 *       clientId: environment.wso2.clientId,
 *       redirectUri: window.location.origin,
 *       postLogoutRedirectUri: window.location.origin,
 *       scopes: 'openid profile email',
 *       securedApiUrls: [environment.apiBaseUrl],
 *     }),
 *   ],
 * };
 * ```
 */
export function provideAuth(config?: Partial<SfAuthConfig>): Provider[] {
  const mergedConfig: SfAuthConfig = {
    ...DEFAULT_AUTH_CONFIG,
    ...config,
  };

  return [
    // Injecte la config SF
    {
      provide: SF_AUTH_CONFIG,
      useValue: mergedConfig,
    },

    // Configure angular-auth-oidc-client
    provideOidc({
      config: {
        authority: mergedConfig.issuerUrl,
        redirectUrl: mergedConfig.redirectUri,
        postLogoutRedirectUri: mergedConfig.postLogoutRedirectUri,
        clientId: mergedConfig.clientId,
        scope: mergedConfig.scopes,
        responseType: 'code',
        silentRenew: true,
        useRefreshToken: true,
        logLevel: OidcLogLevel.Warn,
      },
    }) as unknown as Provider,

    // Auto-init au démarrage de l'app
    {
      provide: APP_INITIALIZER,
      useFactory: (auth: AuthService) => () => auth.init(),
      deps: [AuthService],
      multi: true,
    },
  ];
}