/**
 * Epic 18.2.5 - Error Factory Pattern
 *
 * Centralized error creation with consistent patterns, context injection,
 * and recovery suggestions. Replaces scattered throw new Error() calls.
 */
import { BaseError, GraphValidationError, GraphExecutionError, NodeExecutionError, DatabaseConnectionError, ConnectionFactoryError, AuthenticationError, MFAError, ProjectLockedError, WorkflowStateError, APIError, ValidationError, ConfigurationError } from './index';
/**
 * Factory class for creating structured errors with consistent context
 */
export class ErrorFactory {
    static defaultContext = {};
    /**
     * Set default context that will be included in all created errors
     */
    static setDefaultContext(context: unknown) {
        ErrorFactory.defaultContext = context;
    }
    /**
     * Create enhanced context by merging provided context with defaults
     */
    static createContext(operation: string, options: any = {}, additional: any = {}) {
        return {
            ...ErrorFactory.defaultContext,
            operation,
            userId: options.userId,
            sessionId: options.sessionId,
            requestId: options.requestId,
            ...additional
        };
    }
    // Graph Execution Errors
    /**
     * Create a graph validation error with detailed validation context
     */
    static createGraphValidationError(validationErrors: unknown[], options: any = {}) {
        const context = ErrorFactory.createContext('graph_validation', options);
        return new GraphValidationError(`Graph validation failed: ${validationErrors.length} errors found`, validationErrors, context);
    }
    /**
     * Create a graph execution error with node context
     */
    static createGraphExecutionError(message: string, cause?: Error, options: any = {}) {
        const context = ErrorFactory.createContext('graph_execution', options, {
            originalError: cause
        });
        return new GraphExecutionError(message, context, cause);
    }
    /**
     * Create a node execution error with specific node context
     */
    static createNodeExecutionError(nodeId: string, operation: string, message: string, cause?: Error, options: any = {}) {
        const context = ErrorFactory.createContext(`node_execution_${operation}`, options, {
            nodeId,
            originalError: cause
        });
        return new NodeExecutionError(nodeId, operation, message, cause, context);
    }
    // Connection Errors
    /**
     * Create a database connection error with retry logic
     */
    static createDatabaseConnectionError(message: string, cause?: Error, options: any = {}) {
        const context = ErrorFactory.createContext('database_connection', options);
        return new DatabaseConnectionError(message, context, cause);
    }
    /**
     * Create a connection factory error
     */
    static createConnectionFactoryError(message: string = 'No connection factory set', options: any = {}) {
        const context = ErrorFactory.createContext('connection_factory', options);
        return new ConnectionFactoryError(message, context);
    }
    // Authentication Errors
    /**
     * Create an authentication error with user context
     */
    static createAuthenticationError(message: string, options: any = {}) {
        const context = ErrorFactory.createContext('authentication', options);
        return new AuthenticationError(message, context);
    }
    /**
     * Create MFA-specific errors with recovery guidance
     */
    static createMFAError(message: string, mfaType: string, options: any = {}) {
        const context = ErrorFactory.createContext('mfa_validation', options);
        return new MFAError(message, mfaType, context);
    }
    /**
     * Create MFA configuration errors
     */
    static createMFAConfigurationError(type: string, details?: string, options: any = {}) {
        const messages = {
            already_configured: 'Email MFA already configured for this user',
            invalid_email: 'Invalid email address',
            unsuitable_email: 'Email address not suitable for MFA',
            invalid_config: 'Invalid MFA configuration'
        };
        const message = details ? `${messages[type]}: ${details}` : messages[type];
        return ErrorFactory.createMFAError(message, 'email', options);
    }
    /**
     * Create MFA verification errors
     */
    static createMFAVerificationError(type: string, options: any = {}) {
        const messages = {
            expired: 'Verification expired',
            invalid_code: 'Invalid verification code',
            too_many_attempts: 'Too many failed attempts',
            method_not_active: 'Method not active',
            rate_limit: 'Rate limit exceeded. Too many emails sent.'
        };
        return ErrorFactory.createMFAError(messages[type], 'email', options);
    }
    // File and Resource Errors
    /**
     * Create project locked error with lock context
     */
    static createProjectLockedError(projectId: string, lockedBy: string, options: any = {}) {
        const context = ErrorFactory.createContext('project_access', options, {
            metadata: { projectId, lockedBy }
        });
        return new ProjectLockedError(projectId, context);
    }
    /**
     * Create permission denied errors
     */
    static createPermissionDeniedError(resource: string, action: string, options: any = {}) {
        const context = ErrorFactory.createContext('permission_check', options, {
            metadata: { resource, action }
        });
        return new AuthenticationError(`Insufficient permissions to ${action} ${resource}`, context);
    }
    // Workflow Errors
    /**
     * Create workflow state transition errors
     */
    static createWorkflowStateError(message: string = 'Invalid workflow state transition', fromState?: string, toState?: string, options: any = {}) {
        const context = ErrorFactory.createContext('workflow_transition', options, {
            metadata: { fromState, toState }
        });
        return new WorkflowStateError(message, context);
    }
    // API Errors
    /**
     * Create API errors from HTTP responses
     */
    static createAPIError(statusCode: number, message: string, endpoint: string, responseBody?: unknown, options: any = {}) {
        const context = ErrorFactory.createContext('api_request', options, {
            metadata: { endpoint, responseBody }
        });
        return new APIError(statusCode, message, endpoint, context);
    }
    /**
     * Create network/fetch errors
     */
    static createNetworkError(message: string, endpoint: string, cause?: Error, options: any = {}) {
        const context = ErrorFactory.createContext('network_request', options, {
            originalError: cause
        });
        return new APIError(0, `Network error: ${message}`, endpoint, context);
    }
    // Validation Errors
    /**
     * Create validation errors for fields
     */
    static createValidationError(field: string, value: unknown, expected: string, options: any = {}) {
        const context = ErrorFactory.createContext('field_validation', options);
        return new ValidationError(field, value, expected, context);
    }
    /**
     * Create entropy validation errors
     */
    static createEntropyError(codeType: string, options: any = {}) {
        const context = ErrorFactory.createContext('entropy_validation', options);
        return new ValidationError('code', 'generated', `sufficient entropy for ${codeType}`, context);
    }
    // Configuration Errors
    /**
     * Create configuration errors
     */
    static createConfigurationError(message: string, configKey: string, options: any = {}) {
        const context = ErrorFactory.createContext('configuration', options);
        return new ConfigurationError(message, configKey, context);
    }
    // Utility Methods
    /**
     * Wrap unknown errors in structured format
     */
    static wrapUnknownError(error: unknown, operation: string, options: any = {}) {
        if (error instanceof BaseError) {
            return error;
        }
        if (error instanceof Error) {
            return ErrorFactory.createGraphExecutionError(`Unexpected error during ${operation}: ${error.message}`, error, options);
        }
        return ErrorFactory.createGraphExecutionError(`Unknown error during ${operation}: ${String(error)}`, undefined, options);
    }
    /**
     * Create errors with recovery actions
     */
    static createRecoverableError(message: string, operation: string, recoveryFn?: Function, options: any = {}) {
        const error = ErrorFactory.createGraphExecutionError(message, undefined, options);
        if (recoveryFn) {
            error.recoveryActions.push({
                type: 'retry',
                description: `Retry ${operation}`,
                action: recoveryFn
            });
        }
        return error;
    }
}
