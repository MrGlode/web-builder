import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideLogger, LogLevel } from '@site-factory/core-logger';
import { provideAuth } from '@site-factory/core-auth';
import { provideConfig } from '@site-factory/core-config';
import { errorInterceptor, loadingInterceptor } from '@site-factory/core-http';
import { mockApiInterceptor } from './mocks/mock.interceptor';
import { appRoutes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withComponentInputBinding()),

    // Configuration globale
    provideConfig(environment),

    // HTTP avec interceptors - mock uniquement si active
    provideHttpClient(
      withInterceptors([
        ...(environment.features.enableMocks ? [mockApiInterceptor] : []),
        loadingInterceptor,
        errorInterceptor,
      ])
    ),

    provideLogger({
      minLevel: environment.production ? LogLevel.Warn : LogLevel.Debug,
      enableConsole: !environment.production,
    }),

    ...provideAuth({
      issuerUrl: environment.auth.issuerUrl,
      clientId: environment.auth.clientId,
      redirectUri: window.location.origin,
      postLogoutRedirectUri: window.location.origin,
      scopes: environment.auth.scopes,
      securedApiUrls: [...environment.auth.securedApiUrls],
    }),
  ],
};
