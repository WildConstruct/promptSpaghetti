/**
 * Epic 18.2.5 - Error Factory Pattern
 *
 * Centralized error creation with consistent patterns, context injection,
 * and recovery suggestions. Replaces scattered throw new Error() calls.
 */
import { ErrorContext } from './index';
export interface ErrorFactoryOptions {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    operation?: string;
    includeStackTrace?: boolean;
}
export declare class ErrorFactory {
    private static defaultContext;
    /**
     * Set default context that will be included in all created errors
     */
    static setDefaultContext(context: Partial<ErrorContext>): void;
    /**
     * Create enhanced context by merging provided context with defaults
     */
    private static createContext;
    options: ErrorFactoryOptions;
    additional: Partial<ErrorContext>;
    Partial<ErrorContext>(): any;
    /**
     * Create a graph validation error with detailed validation context
     */
    static createGraphValidationError(): any;
}
//# sourceMappingURL=ErrorFactory.d.ts.map