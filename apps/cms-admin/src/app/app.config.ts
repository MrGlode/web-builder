import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideLogger, LogLevel } from '@site-factory/core-logger';
import { provideAuth } from '@site-factory/core-auth';
import { errorInterceptor, loadingInterceptor } from '@site-factory/core-http';
import { mockApiInterceptor } from './mocks/mock.interceptor';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withComponentInputBinding()),

    // HTTP avec interceptors — mock en premier pour intercepter avant les autres
    provideHttpClient(
      withInterceptors([
        ...(isDevMode() ? [mockApiInterceptor] : []),
        loadingInterceptor,
        errorInterceptor,
      ])
    ),

    provideLogger({
      minLevel: isDevMode() ? LogLevel.Debug : LogLevel.Warn,
      enableConsole: isDevMode(),
    }),

    ...provideAuth({
      issuerUrl: 'https://is.placeholder.company.com/oauth2/token',
      clientId: 'site-factory-cms',
      redirectUri: 'http://localhost:4200',
      postLogoutRedirectUri: 'http://localhost:4200',
      scopes: 'openid profile email',
      securedApiUrls: ['https://api.placeholder.company.com'],
    }),
  ],
};