import { Provider } from '@angular/core';
import { LogLevel } from '../models/log-level.model';
import { LoggerConfig, LOGGER_CONFIG } from '../models/logger-config.model';

/**
 * Configure le logger de la plateforme.
 *
 * ```typescript
 * // En dev
 * provideLogger({ minLevel: LogLevel.Debug, enableConsole: true })
 *
 * // En prod
 * provideLogger({ minLevel: LogLevel.Warn, enableConsole: false })
 * ```
 */
export function provideLogger(config?: Partial<LoggerConfig>): Provider {
  return {
    provide: LOGGER_CONFIG,
    useValue: {
      minLevel: config?.minLevel ?? LogLevel.Debug,
      enableConsole: config?.enableConsole ?? true,
    } satisfies LoggerConfig,
  };
}