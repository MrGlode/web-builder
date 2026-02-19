import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpCore } from '@site-factory/core-http';
import { provideLogger } from '@site-factory/core-logger';
import { LogLevel } from '@site-factory/core-logger';
import { provideAuth } from '@site-factory/core-auth';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withComponentInputBinding()),
    ...provideHttpCore(),
    provideLogger({
      minLevel: isDevMode() ? LogLevel.Debug : LogLevel.Warn,
      enableConsole: isDevMode(),
    }),
    ...provideAuth({
      // TODO: Remplacer par les vraies valeurs depuis environment
      issuerUrl: 'https://is.placeholder.company.com/oauth2/token',
      clientId: 'site-factory-cms',
      redirectUri: 'http://localhost:4200',
      postLogoutRedirectUri: 'http://localhost:4200',
      scopes: 'openid profile email',
      securedApiUrls: ['https://api.placeholder.company.com'],
    }),
  ],
};