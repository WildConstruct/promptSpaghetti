/**
 * AuditLogger - Comprehensive audit logging for data access
 *
 * Provides detailed logging of all data access operations including:
 * - Who accessed the data (user/system identity)
 * - What data was accessed (classification level, identifiers)
 * - When the access occurred (timestamps)
 * - Where the access originated (IP, location, system)
 * - Why the access was made (purpose, authorization)
 * - How the data was accessed (operation type, method)
 *
 * Epic 19 Task T-1752989143998-485: Implement audit logging for data access
 */
declare class BrowserEventEmitter {
    private events;
    on(event: string, listener: Function): string;
    private config;
    private buffer;
    private flushTimer?;
    private storageBackend;
    private operationMetrics;
    constructor(config?: AuditLoggerConfig);
}
//# sourceMappingURL=AuditLogger.d.ts.map