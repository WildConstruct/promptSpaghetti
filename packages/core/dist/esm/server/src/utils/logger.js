/**
 * Simple logger utility
 * Can be replaced with more sophisticated logging libraries like winston or pino
 */
class SimpleLogger {
    formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level}] ${message}`;
    }
    info(message, ...args) {
        console.log(this.formatMessage('INFO', message), ...args);
    }
    error(message, ...args) {
        console.error(this.formatMessage('ERROR', message), ...args);
    }
    warn(message, ...args) {
        console.warn(this.formatMessage('WARN', message), ...args);
    }
    debug(message, ...args) {
        if (process.env.NODE_ENV === 'development') {
            console.debug(this.formatMessage('DEBUG', message), ...args);
        }
    }
}
export const logger = new SimpleLogger();
