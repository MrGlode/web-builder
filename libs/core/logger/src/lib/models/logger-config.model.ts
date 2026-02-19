import { InjectionToken } from '@angular/core';
import { LogLevel } from './log-level.model';

export interface LoggerConfig {
  /** Niveau minimum de log affiché (défaut: Debug en dev, Warn en prod) */
  minLevel: LogLevel;
  /** Activer la sortie console (défaut: true) */
  enableConsole: boolean;
}

export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  minLevel: LogLevel.Debug,
  enableConsole: true,
};

export const LOGGER_CONFIG = new InjectionToken<LoggerConfig>('LOGGER_CONFIG');