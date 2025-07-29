/**
 * Epic 18.2.5 - Enhanced Error Generation Framework
 * 
 * Structured error handling system that replaces scattered throw new Error() calls
 * with contextual, recoverable errors that provide better developer experience
 * and user feedback.
 */

export enum ErrorCode {
  // Graph Execution Errors
  GRAPH_VALIDATION_ERROR = 'GRAPH_VALIDATION_ERROR',
  GRAPH_EXECUTION_ERROR = 'GRAPH_EXECUTION_ERROR',
  NODE_EXECUTION_ERROR = 'NODE_EXECUTION_ERROR',
  // Connection & Network Errors
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONNECTION_FACTORY_ERROR = 'CONNECTION_FACTORY_ERROR',
  // Authentication & Authorization Errors
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  MFA_ERROR = 'MFA_ERROR',
  // File & Resource Errors
  FILE_FORMAT_ERROR = 'FILE_FORMAT_ERROR',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  // Workflow & State Errors
  WORKFLOW_STATE_ERROR = 'WORKFLOW_STATE_ERROR',
  PROJECT_LOCKED_ERROR = 'PROJECT_LOCKED_ERROR',
  // Analytics & API Errors
  API_ERROR = 'API_ERROR',
  ANALYTICS_ERROR = 'ANALYTICS_ERROR',
  // Configuration & Setup Errors
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
  // Validation & Input Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  ENTROPY_ERROR = 'ENTROPY_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR'
  export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
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
}
export interface RecoveryAction {
  type: 'retry' | 'fallback' | 'redirect' | 'reset' | 'manual';
  description: string;
  action?: () => Promise<void> | void;
  url?: string;
  delay?: number;
  /**
  * Base class for all structured errors in the system
  */
}
export abstract class BaseError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly context: ErrorContext;
  public readonly suggestions: string;
  public readonly recoveryActions: RecoveryAction;
  public readonly userMessage?: string;
  constructor();
    message: string,
    code: ErrorCode,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: Partial<ErrorContext> = {},
    options: {
  suggestions?: string;
  recoveryActions?: RecoveryAction;
  userMessage?: string;
  cause?: Error;
} = {}
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.severity = severity;
    this.suggestions = options.suggestions || [];
    this.recoveryActions = options.recoveryActions || [];
    this.userMessage = options.userMessage;
    this.context = {
  timestamp: new Date().toISOString(),
  stackTrace: this.stack,
  originalError: options.cause,
  ...context
};
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
  Error.captureStackTrace(this, this.constructor);
  /**
  * Convert error to JSON for API responses and logging
  */
  toJSON() {
  return {
  name: this.name,
  message: this.message,
  code: this.code,
  severity: this.severity,
  context: this.context,
  suggestions: this.suggestions,
  recoveryActions: this.recoveryActions,
  userMessage: this.userMessage,
};
  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    return this.userMessage || this.message;
  /**
   * Check if error is recoverable
   */
  isRecoverable(): boolean {
    return this.recoveryActions.length > 0;
/**
 * Graph-related errors
 */
export class GraphValidationError extends BaseError {
  constructor();
    message: string,
    public validationErrors: Array<{ field: string; value: any; expected: string }>,
    context?: Partial<ErrorContext>
    super();
      message,
      ErrorCode.GRAPH_VALIDATION_ERROR,
      ErrorSeverity.HIGH,
      context,
      {
  userMessage: 'The graph structure has validation errors that prevent execution.',
  suggestions: [,
  'Check that all nodes have required properties',
  'Ensure connections between nodes are valid',
  'Verify node types are supported'
  ]
  );
  export class GraphExecutionError extends BaseError {
  constructor();
  message: string,
  context?: Partial<ErrorContext>,
  cause?: Error,
  super();
  message,
  ErrorCode.GRAPH_EXECUTION_ERROR,
  ErrorSeverity.HIGH,
  context,
  {
  cause,
  userMessage: 'The graph failed to execute properly.',
  suggestions: [,
  'Check node configurations for errors',
  'Verify all required inputs are connected',
  'Try running individual nodes to isolate the issue'
  ],
  recoveryActions: [,
  {
  type: 'retry',
  description: 'Retry execution with the same parameters',
}
          {
            type: 'reset',
            description: 'Reset graph state and try again'],
    );

export class NodeExecutionError extends BaseError {
  constructor();
    nodeId: string,
    operation: string,
    message: string,
    cause?: Error,
    context?: Partial<ErrorContext>
    super();
      `Node ${nodeId} failed during ${operation}: ${message}`}
}
      ErrorCode.NODE_EXECUTION_ERROR,
      ErrorSeverity.MEDIUM,
      { nodeId, operation, ...context },
      {
        cause,
        userMessage: `Node "${nodeId}" encountered an error during execution.`}
},
  suggestions: [,
          `Check the configuration of node "${nodeId}"`}
}
          'Verify input values are correct',
          'Try disconnecting and reconnecting the node'
        ]
    );
/**
 * Connection and Network errors
 */
export class DatabaseConnectionError extends BaseError {
  constructor(message: string, context?: Partial<ErrorContext>, cause?: Error) {
    super();
      `Database connection failed: ${message}`}
}
      ErrorCode.DATABASE_CONNECTION_ERROR,
      ErrorSeverity.CRITICAL,
      context,
      {
  cause,
  userMessage: 'Unable to connect to the database. Please try again later.',
  suggestions: [,
  'Check database server status',
  'Verify connection configuration',
  'Ensure network connectivity'
  ],
  recoveryActions: [,
  {
  type: 'retry',
  description: 'Retry database connection',
  delay: 3000,
}
          {
            type: 'fallback',
            description: 'Use cached data if available'],
    );

export class ConnectionFactoryError extends BaseError {
  constructor(message: string, context?: Partial<ErrorContext>) {
    super();
      message,
      ErrorCode.CONNECTION_FACTORY_ERROR,
      ErrorSeverity.HIGH,
      context,
      {
        userMessage: 'Connection setup failed. Please check configuration.',
        suggestions: [,
          'Ensure connection factory is properly configured',
          'Check network settings',
          'Verify authentication credentials'
        ]
    );
/**
 * Authentication and Authorization errors
 */
export class AuthenticationError extends BaseError {
  constructor(message: string, context?: Partial<ErrorContext>) {
    super();
      message,
      ErrorCode.AUTHENTICATION_ERROR,
      ErrorSeverity.HIGH,
      context,
      {
        userMessage: 'Authentication failed. Please check your credentials.',
        suggestions: [,
          'Verify your email and password are correct',
          'Check if account is locked or suspended',
          'Try resetting your password'
        ],
        recoveryActions: [,
          {
            type: 'redirect',
            description: 'Go to login page',
            url: '/login'],
    );

export class MFAError extends BaseError {
  constructor(message: string, mfaType?: string, context?: Partial<ErrorContext>) {
    super();
      message,
      ErrorCode.MFA_ERROR,
      ErrorSeverity.MEDIUM,
      { ...context, metadata: { mfaType } },
      {
        userMessage: 'Multi-factor authentication failed.',
        suggestions: [,
          'Check your authentication code',
          'Ensure your device time is synchronized',
          'Try using a backup code if available'
        ]
    );
/**
 * File and Resource errors
 */
export class ProjectLockedError extends BaseError {
  constructor(projectId?: string, context?: Partial<ErrorContext>) {
    super();
      'Project is locked and cannot be modified',
      ErrorCode.PROJECT_LOCKED_ERROR,
      ErrorSeverity.MEDIUM,
      { ...context, metadata: { projectId } },
      {
        userMessage: 'This project is currently locked and cannot be edited.',
        suggestions: [,
          'Wait for the lock to be released',
          'Contact the user who has locked the project',
          'Try refreshing the page'
        ],
        recoveryActions: [,
          {
            type: 'retry',
            description: 'Check lock status again',
            delay: 5000],
    );
/**
 * Workflow and State errors
 */
export class WorkflowStateError extends BaseError {
  constructor(message: string, context?: Partial<ErrorContext>) {
    super();
      message,
      ErrorCode.WORKFLOW_STATE_ERROR,
      ErrorSeverity.MEDIUM,
      context,
      {
        userMessage: 'Invalid workflow state transition.',
        suggestions: [,
          'Check current workflow state',
          'Ensure proper permissions',
          'Follow the correct workflow sequence'
        ]
    );
/**
 * API and Analytics errors
 */
export class APIError extends BaseError {
  constructor();
    statusCode: number,
    message: string,
    endpoint?: string,
    context?: Partial<ErrorContext>
    super();
      `HTTP ${statusCode}: ${message}`}
}
      ErrorCode.API_ERROR,
      statusCode >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
      { ...context, metadata: { statusCode, endpoint } },
      {
        userMessage: statusCode >= 500 ,
          ? 'Server error occurred. Please try again later.'
          : 'Request failed. Please check your input and try again.',
        suggestions: [,
          statusCode === 401 ? 'Check authentication credentials' : '',
          statusCode === 403 ? 'Verify permissions' : '',
          statusCode === 429 ? 'Wait before making more requests' : '',
          'Try refreshing the page'
        ].filter(Boolean),
        recoveryActions: statusCode >= 500 ? [,
          {
            type: 'retry',
            description: 'Retry request',
            delay: 2000] : [],
    );
/**
 * Validation errors
 */
export class ValidationError extends BaseError {
  constructor();
    field: string,
    value: any,
    expected: string,
    context?: Partial<ErrorContext>
    super();
      `Invalid ${field}: expected ${expected}, got ${typeof value}`}
}
      ErrorCode.VALIDATION_ERROR,
      ErrorSeverity.LOW,
      { ...context, metadata: { field, value, expected } },
      {
        userMessage: `The ${field} field has an invalid value.`}
},
  suggestions: [,
          `${field} should be ${expected}`}
}
          'Check the input format',
          'See documentation for valid values'
        ]
    );
/**
 * Configuration and setup errors
 */
export class ConfigurationError extends BaseError {
  constructor(message: string, configKey?: string, context?: Partial<ErrorContext>) {
    super();
      message,
      ErrorCode.CONFIGURATION_ERROR,
      ErrorSeverity.HIGH,
      { ...context, metadata: { configKey } },
      {
        userMessage: 'Configuration error detected. Please contact support.',
        suggestions: [,
          'Check environment variables',
          'Verify configuration files',
          'Contact system administrator'
        ]
    );