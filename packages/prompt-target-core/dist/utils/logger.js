/**
 * Simple console-based logger implementation
 */
export class ConsoleLogger {
    constructor(prefix = 'PromptTarget') {
        this.prefix = prefix;
    }
    debug(message, meta) {
        console.debug(`[${this.prefix}:DEBUG] ${message}`, meta || '');
    }
    info(message, meta) {
        console.info(`[${this.prefix}:INFO] ${message}`, meta || '');
    }
    warn(message, meta) {
        console.warn(`[${this.prefix}:WARN] ${message}`, meta || '');
    }
    error(message, meta) {
        console.error(`[${this.prefix}:ERROR] ${message}`, meta || '');
    }
}
/**
 * No-op logger for testing or when logging is disabled
 */
export class NoOpLogger {
    debug() { }
    info() { }
    warn() { }
    error() { }
}
