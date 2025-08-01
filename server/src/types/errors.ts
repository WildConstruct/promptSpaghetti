/**
 * Structured Error Types for Backend API Error Handling & Resilience
 */

export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  RATE_LIMIT = 'rate_limit',
  TIMEOUT = 'timeout',
  EXTERNAL_SERVICE = 'external_service',
  DATABASE = 'database',
  INTERNAL = 'internal',
  BUSINESS_LOGIC = 'business_logic'


export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'




export interface ErrorContext {
  correlationId: string;
  userId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  timestamp: string;
  stackTrace?: string;
  additionalData?: Record<string, unknown>;







export interface ErrorDetail {
  field?: string;
  code: string;
  message: string;
  value?: unknown;





export abstract class BaseError extends Error {
  abstract category: ErrorCategory;
  abstract httpStatusCode: number;
  abstract severity: ErrorSeverity;
  
  public correlationId: string;
  public context?: Partial<ErrorContext>;
  public details?: ErrorDetail[];
  public retryable: boolean = false;
  public timestamp: string;

  constructor(
    message: string,
    correlationId?: string,
    context?: Partial<ErrorContext>,
    details?: ErrorDetail[]
  ) {
    super(message);
    this.name = this.constructor.name;
    this.correlationId = correlationId || this.generateCorrelationId();
    this.context = context;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace
    Error.captureStackTrace?.(this, this.constructor);


  private generateCorrelationId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      category: this.category,
      severity: this.severity,
      httpStatusCode: this.httpStatusCode,
      correlationId: this.correlationId,
      timestamp: this.timestamp,
      retryable: this.retryable,
      context: this.context,
      details: this.details,
      stack: this.stack
    };



// Validation Errors
export class ValidationError extends BaseError {
  category = ErrorCategory.VALIDATION;
  httpStatusCode = 400;
  severity = ErrorSeverity.LOW;
  
  constructor(
    message: string,
    details?: ErrorDetail[],
    correlationId?: string,
    context?: Partial<ErrorContext>
  ) {
    super(message, correlationId, context, details);



// Authentication Errors
export class AuthenticationError extends BaseError {
  category = ErrorCategory.AUTHENTICATION;
  httpStatusCode = 401;
  severity = ErrorSeverity.MEDIUM;
  
  constructor(
    message: string = 'Authentication required',
    correlationId?: string,
    context?: Partial<ErrorContext>
  ) {
    super(message, correlationId, context);



export class AuthorizationError extends BaseError {
  category = ErrorCategory.AUTHORIZATION;
  httpStatusCode = 403;
  severity = ErrorSeverity.MEDIUM;
  
  constructor(
    message: string = 'Insufficient permissions',
    correlationId?: string,
    context?: Partial<ErrorContext>
  ) {
    super(message, correlationId, context);



// Resource Errors
export class NotFoundError extends BaseError {
  category = ErrorCategory.NOT_FOUND;
  httpStatusCode = 404;
  severity = ErrorSeverity.LOW;
  
  constructor(
    resource: string,
    correlationId?: string,
    context?: Partial<ErrorContext>
  ) {
    super(`${resource} not found`, correlationId, context);



export class ConflictError extends BaseError {
  category = ErrorCategory.CONFLICT;
  httpStatusCode = 409;
  severity = ErrorSeverity.MEDIUM;
  
  constructor(
    message: string,
    correlationId?: string,
    context?: Partial<ErrorContext>
  ) {
    super(message, correlationId, context);



// Rate Limiting Errors
export class RateLimitError extends BaseError {
  category = ErrorCategory.RATE_LIMIT;
  httpStatusCode = 429;
  severity = ErrorSeverity.MEDIUM;
  retryable = true;
  
  public retryAfter?: number;
  
  constructor(
    message: string = 'Rate limit exceeded',
    retryAfter?: number,
    correlationId?: string,
    context?: Partial<ErrorContext>
  ) {
    super(message, correlationId, context);
    this.retryAfter = retryAfter;



// Timeout Errors
export class TimeoutError extends BaseError {
  category = ErrorCategory.TIMEOUT;
  httpStatusCode = 408;
  severity = ErrorSeverity.HIGH;
  retryable = true;
  
  public timeoutMs: number;
  public operation?: string;
  
  constructor(
    operation: string,
    timeoutMs: number,
    correlationId?: string,
    context?: Partial<ErrorContext>
  ) {
    super(`Operation '${operation}' timed out after ${timeoutMs}ms`, correlationId, context);
    this.timeoutMs = timeoutMs;
    this.operation = operation;



// External Service Errors
export class ExternalServiceError extends BaseError {
  category = ErrorCategory.EXTERNAL_SERVICE;
  httpStatusCode = 502;
  severity = ErrorSeverity.HIGH;
  retryable = true;
  
  public serviceName: string;
  public serviceStatusCode?: number;
  
  constructor(
    serviceName: string,
    message: string,
    serviceStatusCode?: number,
    correlationId?: string,
    context?: Partial<ErrorContext>
  ) {
    super(`External service '${serviceName}' error: ${message}`, correlationId, context);
    this.serviceName = serviceName;
    this.serviceStatusCode = serviceStatusCode;



// Database Errors
export class DatabaseError extends BaseError {
  category = ErrorCategory.DATABASE;
  httpStatusCode = 500;
  severity = ErrorSeverity.CRITICAL;
  retryable = true;
  
  public operation?: string;
  public table?: string;
  
  constructor(
    message: string,
    operation?: string,
    table?: string,
    correlationId?: string,
    context?: Partial<ErrorContext>
  ) {
    super(message, correlationId, context);
    this.operation = operation;
    this.table = table;



// Business Logic Errors
export class BusinessLogicError extends BaseError {
  category = ErrorCategory.BUSINESS_LOGIC;
  httpStatusCode = 422;
  severity = ErrorSeverity.MEDIUM;
  
  constructor(
    message: string,
    correlationId?: string,
    context?: Partial<ErrorContext>
  ) {
    super(message, correlationId, context);



// Internal Server Errors
export class InternalError extends BaseError {
  category = ErrorCategory.INTERNAL;
  httpStatusCode = 500;
  severity = ErrorSeverity.CRITICAL;
  
  constructor(
    message: string = 'Internal server error',
    correlationId?: string,
    context?: Partial<ErrorContext>
  ) {
    super(message, correlationId, context);



// Circuit Breaker Error
export class CircuitBreakerError extends BaseError {
  category = ErrorCategory.EXTERNAL_SERVICE;
  httpStatusCode = 503;
  severity = ErrorSeverity.HIGH;
  retryable = true;
  
  public serviceName: string;
  public state: 'open' | 'half-open';
  
  constructor(
    serviceName: string,
    state: 'open' | 'half-open',
    correlationId?: string,
    context?: Partial<ErrorContext>
  ) {
    super(
      `Circuit breaker is ${state} for service '${serviceName}'`,
      correlationId,
      context
    );
    this.serviceName = serviceName;
    this.state = state;



// Type guards for error identification
export function isBaseError(error: unknown): error is BaseError {
  return error instanceof BaseError;


export function isRetryableError(error: unknown): error is BaseError {
  return isBaseError(error) && error.retryable === true;


// Error factory functions