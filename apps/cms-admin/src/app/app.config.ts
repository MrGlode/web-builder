import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpCore } from '@site-factory/core-http';
import { provideLogger } from '@site-factory/core-logger';
import { LogLevel } from '@site-factory/core-logger';
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
  ],
};