/**
 * Epic 18.2.5 - Error Factory Pattern
 *
 * Centralized error creation with consistent patterns, context injection,
 * and recovery suggestions. Replaces scattered throw new Error() calls.
 */
import { 
  BaseError,
  ErrorContext,
  GraphValidationError,
  GraphExecutionError,
  NodeExecutionError,
  DatabaseConnectionError,
  ConnectionFactoryError,
  AuthenticationError,
  MFAError,
  ProjectLockedError,
  WorkflowStateError,
  APIError,
  ValidationError,
  ConfigurationError
} from './index';

export interface ErrorFactoryOptions {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    operation?: string;
    includeStackTrace?: boolean;
/**
 * Factory class for creating structured errors with consistent context
 */
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
    /**
     * Create a graph validation error with detailed validation context
     */
    static createGraphValidationError(validationErrors: Array<{)
        field: string;
        value: any;
        expected: string;
    }>, options?: ErrorFactoryOptions): GraphValidationError;
    /**
     * Create a graph execution error with node context
     */
    static createGraphExecutionError(message: string,)
      cause?: Error,
      options?: ErrorFactoryOptions
    ): GraphExecutionError;
    /**
     * Create a node execution error with specific node context
     */
    static createNodeExecutionError(nodeId: string,)
      operation: string,
      message: string,
      cause?: Error,
      options?: ErrorFactoryOptions
    ): NodeExecutionError;
    /**
     * Create a database connection error with retry logic
     */
    static createDatabaseConnectionError(message: string,)
      cause?: Error,
      options?: ErrorFactoryOptions
    ): DatabaseConnectionError;
    /**
     * Create a connection factory error
     */
    static createConnectionFactoryError(message?: string, options?: ErrorFactoryOptions): ConnectionFactoryError;
    /**
     * Create an authentication error with user context
     */
    static createAuthenticationError(message: string, options?: ErrorFactoryOptions): AuthenticationError;
    /**
     * Create MFA-specific errors with recovery guidance
     */
    static createMFAError(message: string, mfaType: string, options?: ErrorFactoryOptions): MFAError;
    /**
     * Create MFA configuration errors
     */
    static createMFAConfigurationError(type: 'already_configured' | 'invalid_email' | 'unsuitable_email' | 'invalid_config',)
      details?: string,
      options?: ErrorFactoryOptions
    ): MFAError;
    /**
     * Create MFA verification errors
     */
    static createMFAVerificationError(type: 'expired' | 'invalid_code' | 'too_many_attempts' | 'method_not_active' | 'rate_limit',)
      options?: ErrorFactoryOptions
    ): MFAError;
    /**
     * Create project locked error with lock context
     */
    static createProjectLockedError(projectId?: string,)
      lockedBy?: string,
      options?: ErrorFactoryOptions
    ): ProjectLockedError;
    /**
     * Create permission denied errors
     */
    static createPermissionDeniedError(resource: string,)
      action: string,
      options?: ErrorFactoryOptions
    ): AuthenticationError;
    /**
     * Create workflow state transition errors
     */
    static createWorkflowStateError(message?: string,)
      fromState?: string,
      toState?: string,
      options?: ErrorFactoryOptions
    ): WorkflowStateError;
    /**
     * Create API errors from HTTP responses
     */
    static createAPIError(statusCode: number,)
      message: string,
      endpoint?: string,
      responseBody?: any,
      options?: ErrorFactoryOptions
    ): APIError;
    /**
     * Create network/fetch errors
     */
    static createNetworkError(message: string,)
      endpoint?: string,
      cause?: Error,
      options?: ErrorFactoryOptions
    ): APIError;
    /**
     * Create validation errors for fields
     */
    static createValidationError(field: string,)
      value: any,
      expected: string,
      options?: ErrorFactoryOptions
    ): ValidationError;
    /**
     * Create entropy validation errors
     */
    static createEntropyError(codeType: string, options?: ErrorFactoryOptions): ValidationError;
    /**
     * Create configuration errors
     */
    static createConfigurationError(message: string,)
      configKey?: string,
      options?: ErrorFactoryOptions
    ): ConfigurationError;
    /**
     * Wrap unknown errors in structured format
     */
    static wrapUnknownError(error: unknown, operation: string, options?: ErrorFactoryOptions): BaseError;
    /**
     * Create errors with recovery actions
     */
    static createRecoverableError()
      message: string,
      operation: string,
      recoveryFn?: ()
    ) => Promise<void>, options?: ErrorFactoryOptions): GraphExecutionError;

//# sourceMappingURL=ErrorFactory.d.ts.map