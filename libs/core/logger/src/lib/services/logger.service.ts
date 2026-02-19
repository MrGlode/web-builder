import { Injectable, Optional, inject, signal, computed } from '@angular/core';
import { LogLevel } from '../models/log-level.model';
import { LogEntry } from '../models/log-entry.model';
import {
  LoggerConfig,
  LOGGER_CONFIG,
  DEFAULT_LOGGER_CONFIG,
} from '../models/logger-config.model';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly config: LoggerConfig;

  /** Buffer des dernières entrées de log (utile pour debug/reporting) */
  private readonly logBuffer = signal<LogEntry[]>([]);

  /** Dernières entrées de log (lecture seule) */
  readonly recentLogs = computed(() => this.logBuffer());

  private static readonly MAX_BUFFER_SIZE = 100;

  constructor() {
    const injectedConfig = inject(LOGGER_CONFIG, { optional: true });
    this.config = injectedConfig ?? DEFAULT_LOGGER_CONFIG;
  }

  debug(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.Debug, message, context, data);
  }

  info(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.Info, message, context, data);
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.Warn, message, context, data);
  }

  error(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.Error, message, context, data);
  }

  clearBuffer(): void {
    this.logBuffer.set([]);
  }

  private log(
    level: LogLevel,
    message: string,
    context?: string,
    data?: unknown
  ): void {
    if (level < this.config.minLevel) return;

    const entry: LogEntry = {
      level,
      message,
      context,
      data,
      timestamp: new Date().toISOString(),
    };

    this.addToBuffer(entry);

    if (this.config.enableConsole) {
      this.writeToConsole(entry);
    }
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.update(buffer => {
      const updated = [...buffer, entry];
      return updated.length > LoggerService.MAX_BUFFER_SIZE
        ? updated.slice(-LoggerService.MAX_BUFFER_SIZE)
        : updated;
    });
  }

  private writeToConsole(entry: LogEntry): void {
    const prefix = entry.context ? `[${entry.context}]` : '';
    const msg = `${prefix} ${entry.message}`.trim();

    switch (entry.level) {
      case LogLevel.Debug:
        console.debug(msg, entry.data ?? '');
        break;
      case LogLevel.Info:
        console.info(msg, entry.data ?? '');
        break;
      case LogLevel.Warn:
        console.warn(msg, entry.data ?? '');
        break;
      case LogLevel.Error:
        console.error(msg, entry.data ?? '');
        break;
    }
  }
}