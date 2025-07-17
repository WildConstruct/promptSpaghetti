import { Logger } from '../types/index.js';

/**
 * Simple console-based logger implementation
 */
export class ConsoleLogger implements Logger {
  constructor(private prefix: string = 'PromptTarget') {}

  debug(message: string, meta?: Record<string, any>): void {
    console.debug(`[${this.prefix}:DEBUG] ${message}`, meta || '');
  }

  info(message: string, meta?: Record<string, any>): void {
    console.info(`[${this.prefix}:INFO] ${message}`, meta || '');
  }

  warn(message: string, meta?: Record<string, any>): void {
    console.warn(`[${this.prefix}:WARN] ${message}`, meta || '');
  }

  error(message: string, meta?: Record<string, any>): void {
    console.error(`[${this.prefix}:ERROR] ${message}`, meta || '');
  }
}

/**
 * No-op logger for testing or when logging is disabled
 */
export class NoOpLogger implements Logger {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
}