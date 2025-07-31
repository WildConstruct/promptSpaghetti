import { Logger } from '../types/index.js';
/**
 * Simple console-based logger implementation
 */
export declare class ConsoleLogger implements Logger {
    private prefix;
    constructor(prefix?: string);
    debug(message: string, meta?: Record<string, any>): void;
    info(message: string, meta?: Record<string, any>): void;
    warn(message: string, meta?: Record<string, any>): void;
    error(message: string, meta?: Record<string, any>): void;
}
/**
 * No-op logger for testing or when logging is disabled
 */
export declare class NoOpLogger implements Logger {
    debug(): void;
    info(): void;
    warn(): void;
    error(): void;
}
