/**
 * Epic 18.2.5 - Enhanced Error Generation Framework
 *
 * Structured error handling system that replaces scattered throw new Error() calls
 * with contextual, recoverable errors that provide better developer experience
 * and user feedback.
 */
export declare enum ErrorCode {
    GRAPH_VALIDATION_ERROR = "GRAPH_VALIDATION_ERROR",
    GRAPH_EXECUTION_ERROR = "GRAPH_EXECUTION_ERROR",
    NODE_EXECUTION_ERROR = "NODE_EXECUTION_ERROR",
    DATABASE_CONNECTION_ERROR = "DATABASE_CONNECTION_ERROR",
    NETWORK_ERROR = "NETWORK_ERROR",
    CONNECTION_FACTORY_ERROR = "CONNECTION_FACTORY_ERROR",
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
    AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
    MFA_ERROR = "MFA_ERROR",
    FILE_FORMAT_ERROR = "FILE_FORMAT_ERROR",
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
    PERMISSION_DENIED = "PERMISSION_DENIED",
    WORKFLOW_STATE_ERROR = "WORKFLOW_STATE_ERROR",
    PROJECT_LOCKED_ERROR = "PROJECT_LOCKED_ERROR",
    API_ERROR = "API_ERROR",
    ANALYTICS_ERROR = "ANALYTICS_ERROR",
    CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
    INITIALIZATION_ERROR = "INITIALIZATION_ERROR",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    ENTROPY_ERROR = "ENTROPY_ERROR",
    RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR"

export declare enum ErrorSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"

export interface ErrorContext {
    timestamp: string;
    userId?: string;
    sessionId?: string;
    requestId?: string;
    nodeId?: string;
    operation?: string;
    stackTrace?: string;
    originalError?: any;
    metadata?: Record<string, any>;

export interface RecoveryAction {
    type: 'retry' | 'fallback' | 'redirect' | 'reset' | 'manual';
    description: string;
    action?: () => Promise<void> | void;
    url?: string;
    delay?: number;
/**
 * Base class for all structured errors in the system
 */
export declare abstract class BaseError extends Error {
    readonly code: ErrorCode;
    readonly severity: ErrorSeverity;
    readonly context: ErrorContext;
    readonly suggestions: string[];
    readonly recoveryActions: RecoveryAction[];
    readonly userMessage?: string;
    constructor(message: string, code: ErrorCode, severity?: ErrorSeverity, context?: Partial<ErrorContext>, options?: {)
        suggestions?: string[];
        recoveryActions?: RecoveryAction[];
        userMessage?: string;
        cause?: Error;
    });
    /**
     * Convert error to JSON for API responses and logging
     */
    toJSON(): {
        name: string;
        message: string;
        code: ErrorCode;
        severity: ErrorSeverity;
        context: ErrorContext;
        suggestions: string[];
        recoveryActions: RecoveryAction[];
        userMessage: string | undefined;
    };
    /**
     * Get user-friendly error message
     */
    getUserMessage(): string;
    /**
     * Check if error is recoverable
     */
    isRecoverable(): boolean;
/**
 * Graph-related errors
 */
export declare class GraphValidationError extends BaseError {
    validationErrors: Array<{,
        field: string;
        value: any;
        expected: string;
    }>;
    constructor(message: string, validationErrors: Array<{)
        field: string;
        value: any;
        expected: string;
    }>, context?: Partial<ErrorContext>);

export declare class GraphExecutionError extends BaseError {
    constructor(message: string, context?: Partial<ErrorContext>, cause?: Error);

export declare class NodeExecutionError extends BaseError {
    constructor(nodeId: string, operation: string, message: string, cause?: Error, context?: Partial<ErrorContext>);
/**
 * Connection and Network errors
 */
export declare class DatabaseConnectionError extends BaseError {
    constructor(message: string, context?: Partial<ErrorContext>, cause?: Error);

export declare class ConnectionFactoryError extends BaseError {
    constructor(message: string, context?: Partial<ErrorContext>);
/**
 * Authentication and Authorization errors
 */
export declare class AuthenticationError extends BaseError {
    constructor(message: string, context?: Partial<ErrorContext>);

export declare class MFAError extends BaseError {
    constructor(message: string, mfaType?: string, context?: Partial<ErrorContext>);
/**
 * File and Resource errors
 */
export declare class ProjectLockedError extends BaseError {
    constructor(projectId?: string, context?: Partial<ErrorContext>);
/**
 * Workflow and State errors
 */
export declare class WorkflowStateError extends BaseError {
    constructor(message: string, context?: Partial<ErrorContext>);
/**
 * API and Analytics errors
 */
export declare class APIError extends BaseError {
    constructor(statusCode: number, message: string, endpoint?: string, context?: Partial<ErrorContext>);
/**
 * Validation errors
 */
export declare class ValidationError extends BaseError {
    constructor(field: string, value: any, expected: string, context?: Partial<ErrorContext>);
/**
 * Configuration and setup errors
 */
export declare class ConfigurationError extends BaseError {
    constructor(message: string, configKey?: string, context?: Partial<ErrorContext>);

//# sourceMappingURL=index.d.ts.map