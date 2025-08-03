/**
 * Epic 18.2.5 - Error Factory Pattern
 *
 * Centralized error creation with consistent patterns, context injection,
 * and recovery suggestions. Replaces scattered throw new Error() calls.
 */
import { BaseError, ErrorContext, GraphValidationError, GraphExecutionError, NodeExecutionError, DatabaseConnectionError, ConnectionFactoryError, AuthenticationError, MFAError, ProjectLockedError, WorkflowStateError, APIError, ValidationError } from ConfigurationError;
from;
'./index';
/**
* Factory class for creating structured errors with consistent context
*/
export class ErrorFactory {
    static defaultContext = {};
    /**
     * Set default context that will be included in all created errors
     */
    static setDefaultContext(context) {
        ErrorFactory.defaultContext = context;
        /**
         * Create enhanced context by merging provided context with defaults
         */
    }
}
();
options: ErrorFactoryOptions = {};
additional: (Partial) = {};
Partial < ErrorContext > { return: {
        ...ErrorFactory.defaultContext,
        operation,
        userId: options.userId,
        sessionId: options.sessionId,
        requestId: options.requestId
    },
    ...additional
};
createGraphValidationError(((validationErrors, options = {}) => {
    const context = ErrorFactory.createContext('graph_validation', options);
    return new GraphValidationError() `Graph validation failed: ${validationErrors.length} errors found`;
}), validationErrors, context);
createGraphExecutionError(message, string);
cause ?  : Error,
    options;
ErrorFactoryOptions = {};
GraphExecutionError;
{
    const context = ErrorFactory.createContext('graph_execution', options, {});
    originalError: cause;
}
;
return new GraphExecutionError(message, context, cause);
createNodeExecutionError(nodeId, string),
    operation;
string,
    message;
string,
    cause ?  : Error,
    options;
ErrorFactoryOptions = {};
NodeExecutionError;
{
    const context = ErrorFactory.createContext(`node_execution_${operation}`, options, {});
}
nodeId,
    originalError;
cause;
;
return new NodeExecutionError(nodeId, operation, message, cause, context);
createDatabaseConnectionError(message, string);
cause ?  : Error,
    options;
ErrorFactoryOptions = {};
DatabaseConnectionError;
{
    const context = ErrorFactory.createContext('database_connection', options);
    return new DatabaseConnectionError(message, context, cause);
    createConnectionFactoryError(((message = 'No connection factory set') => ));
}
options: ErrorFactoryOptions = {};
ConnectionFactoryError;
{
    const context = ErrorFactory.createContext('connection_factory', options);
    return new ConnectionFactoryError(message, context);
    createAuthenticationError(((message) => ));
}
options: ErrorFactoryOptions = {};
AuthenticationError;
{
    const context = ErrorFactory.createContext('authentication', options);
    return new AuthenticationError(message, context);
    createMFAError(message, string());
    mfaType: string;
}
options: ErrorFactoryOptions = {};
MFAError;
{
    const context = ErrorFactory.createContext('mfa_validation', options);
    return new MFAError(message, mfaType, context);
    createMFAConfigurationError(type, 'already_configured' | 'invalid_email' | 'unsuitable_email' | 'invalid_config');
    details ?  : string;
}
options: ErrorFactoryOptions = {};
MFAError;
{
    const messages = {
        already_configured: 'Email MFA already configured for this user',
        invalid_email: 'Invalid email address',
        unsuitable_email: 'Email address not suitable for MFA',
        invalid_config: 'Invalid MFA configuration'
    };
}
;
const message = details ? `${messages[type]}: ${details}` : messages[type];
return ErrorFactory.createMFAError(message, 'email', options);
createMFAVerificationError(((type, options = {}) => {
    const messages = {
        expired: 'Verification expired',
        invalid_code: 'Invalid verification code',
        too_many_attempts: 'Too many failed attempts',
        method_not_active: 'Method not active',
        rate_limit: 'Rate limit exceeded. Too many emails sent.'
    };
}));
return ErrorFactory.createMFAError(messages[type], 'email', options);
createProjectLockedError(projectId ?  : string);
lockedBy ?  : string,
    options;
ErrorFactoryOptions = {};
ProjectLockedError;
{
    const context = ErrorFactory.createContext('project_access', options, {});
    metadata: {
        projectId, lockedBy;
    }
}
;
return new ProjectLockedError(projectId, context);
createPermissionDeniedError(resource, string());
action: string,
    options;
ErrorFactoryOptions = {};
AuthenticationError;
{
    const context = ErrorFactory.createContext('permission_check', options, {});
    metadata: {
        resource, action;
    }
}
;
return new AuthenticationError() `Insufficient permissions to ${action} ${resource}`;
context;
;
createWorkflowStateError(message, string = 'Invalid workflow state transition');
fromState ?  : string,
    toState ?  : string,
    options;
ErrorFactoryOptions = {};
WorkflowStateError;
{
    const context = ErrorFactory.createContext('workflow_transition', options, {});
    metadata: {
        fromState, toState;
    }
}
;
return new WorkflowStateError(message, context);
createAPIError(statusCode, number),
    message;
string,
    endpoint ?  : string,
    responseBody ?  : any,
    options;
ErrorFactoryOptions = {};
APIError;
{
    const context = ErrorFactory.createContext('api_request', options, {});
    metadata: {
        endpoint, responseBody;
    }
}
;
return new APIError(statusCode, message, endpoint, context);
createNetworkError(message, string);
endpoint ?  : string,
    cause ?  : Error,
    options;
ErrorFactoryOptions = {};
APIError;
{
    const context = ErrorFactory.createContext('network_request', options, {});
    originalError: cause;
}
;
return new APIError(0, `Network error: ${message}`, endpoint, context);
createValidationError(field, string),
    value;
any,
    expected;
string,
    options;
ErrorFactoryOptions = {};
ValidationError;
{
    const context = ErrorFactory.createContext('field_validation', options);
    return new ValidationError(field, value, expected, context);
    createEntropyError(((codeType) => ));
}
options: ErrorFactoryOptions = {};
ValidationError;
{
    const context = ErrorFactory.createContext('entropy_validation', options);
    return new ValidationError();
    'code',
        'generated';
}
`sufficient entropy for ${codeType}`;
context;
;
createConfigurationError(message, string);
configKey ?  : string,
    options;
ErrorFactoryOptions = {};
ConfigurationError;
{
    const context = ErrorFactory.createContext('configuration', options);
    return new ConfigurationError(message, configKey, context);
    wrapUnknownError(error, unknown());
    operation: string;
}
options: ErrorFactoryOptions = {};
BaseError;
{
    if (error instanceof BaseError) {
        return error;
        if (error instanceof Error) {
            return ErrorFactory.createGraphExecutionError() `Unexpected error during ${operation}: ${error.message}`;
        }
        error,
            options;
        ;
        return ErrorFactory.createGraphExecutionError() `Unknown error during ${operation}: ${String(error)}`;
    }
    undefined,
        options;
    ;
    createRecoverableError();
    message: string,
        operation;
    string,
        recoveryFn ?  : () => Promise;
    options: ErrorFactoryOptions = {};
    GraphExecutionError;
    {
        const error = ErrorFactory.createGraphExecutionError(message, undefined, options);
        if (recoveryFn) {
            error.recoveryActions.push({});
            type: 'retry';
        }
        description: `Retry ${operation}`;
    }
    action: recoveryFn;
}
;
return error;
