/**
 * Retry Mechanism Utility - Epic 17
 * Task: E17-1753114396828-35CAE6 - Implement retry mechanism
 * 
 * Provides configurable retry logic with exponential backoff, jitter, and
 * comprehensive error handling for robust system operations.
 */



export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  jitter?: boolean;
  retryableErrors?: Array<string | number | RegExp>;
  onAttempt?: (attempt: number, error: Error) => void;
  onSuccess?: <T>(attempt: number, result: T) => void;
  onFailure?: (attempts: number, finalError: Error) => void;







export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
  retryHistory: RetryAttempt[];




export interface RetryAttempt {
  attempt: number;
  startTime: number;
  duration: number;
  success: boolean;
  error?: Error;
  delay?: number;





export class RetryError extends Error {
  constructor(
    message: string,
    public readonly attempts: number,
    public readonly originalError: Error,
    public readonly retryHistory: RetryAttempt[]
  ) {
    super(message);
    this.name = 'RetryError';



export class RetryUtils {
  private static readonly DEFAULT_OPTIONS: Required<RetryOptions> = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2,
    jitter: true,
    retryableErrors: [],
    onAttempt: () => {},
    onSuccess: () => {},
    onFailure: () => {}
  };

  /**
   * Execute a function with retry logic
   */
  public static async execute<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {

    const config = { ...this.DEFAULT_OPTIONS, ...options };
    const retryHistory: RetryAttempt[] = [];
    const startTime = Date.now();
    let lastError: Error;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      const attemptStart = Date.now();
      
      try {
        const result = await operation();
        const duration = Date.now() - attemptStart;
        
        retryHistory.push({
          attempt,
          startTime: attemptStart,
          duration,
          success: true
        });

        config.onSuccess(attempt, result);
        return result;
 catch (error) {
        const duration = Date.now() - attemptStart;
        lastError = error instanceof Error ? error : new Error(String(error));
        
        retryHistory.push({
          attempt,
          startTime: attemptStart,
          duration,
          success: false,
          error: lastError
        });

        config.onAttempt(attempt, lastError);

        // Check if error is retryable
        if (!this.isRetryableError(lastError, config.retryableErrors)) {
          break;


        // If this was the last attempt, don't wait
        if (attempt === config.maxAttempts) {
          break;


        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt, config);
        retryHistory[retryHistory.length - 1].delay = delay;
        
        await this.sleep(delay);



    const totalTime = Date.now() - startTime;
    config.onFailure(config.maxAttempts, lastError!);
    
    throw new RetryError(
      `Operation failed after ${config.maxAttempts} attempts: ${lastError!.message}`,
      config.maxAttempts,
      lastError!,
      retryHistory
    );


  /**
   * Execute a function with retry logic and return detailed result
   */
  public static async executeWithResult<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<RetryResult<T>> {
    const startTime = Date.now();
    
    try {
      const result = await this.execute(operation, options);
      return {
        success: true,
        result,
        attempts: 1, // If successful on first try
        totalTime: Date.now() - startTime,
        retryHistory: []
      };
 catch (error) {
      if (error instanceof RetryError) {
        return {
          success: false,
          error: error.originalError,
          attempts: error.attempts,
          totalTime: Date.now() - startTime,
          retryHistory: error.retryHistory
        };

      
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        attempts: 1,
        totalTime: Date.now() - startTime,
        retryHistory: []
      };



  /**
   * Create a retryable version of an async function
   */
  public static retryable<TArgs extends unknown[], TReturn>(
    fn: (...args: TArgs) => Promise<TReturn>,
    options: RetryOptions = {}
  ): (...args: TArgs) => Promise<TReturn> {
    return async (...args: TArgs): Promise<TReturn> => {
      return this.execute(() => fn(...args), options);
    };


  /**
   * Retry with exponential backoff specifically for database operations
   */
  public static async executeDatabase<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {

    const dbOptions: RetryOptions = {
      maxAttempts: 3,
      baseDelay: 500,
      maxDelay: 5000,
      backoffFactor: 2,
      jitter: true,
      retryableErrors: [
        /connection/i,
        /timeout/i,
        /deadlock/i,
        /lock.*timeout/i,
        'ECONNRESET',
        'ETIMEDOUT',
        'ENOTFOUND'
      ],
      ...options
    };

    return this.execute(operation, dbOptions);


  /**
   * Retry with exponential backoff specifically for HTTP operations
   */
  public static async executeHttp<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {

    const httpOptions: RetryOptions = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 1.5,
      jitter: true,
      retryableErrors: [
        500, 502, 503, 504, // Server errors
        408, 429, // Request timeout, rate limit
        /network/i,
        /timeout/i,
        'ECONNRESET',
        'ETIMEDOUT',
        'ENOTFOUND'
      ],
      ...options
    };

    return this.execute(operation, httpOptions);


  /**
   * Retry with circuit breaker pattern
   */
  public static async executeWithCircuitBreaker<T>(
    operation: () => Promise<T>,
    circuitBreakerKey: string,
    options: RetryOptions = {}
  ): Promise<T> {

    const circuitState = this.getCircuitState(circuitBreakerKey);
    
    if (circuitState.isOpen()) {
      throw new Error(`Circuit breaker is OPEN for ${circuitBreakerKey}`);


    try {
      const result = await this.execute(operation, {
        ...options,
        onFailure: (attempts, error) => {
          circuitState.recordFailure();
          options.onFailure?.(attempts, error);

        onSuccess: (attempt, result) => {
          circuitState.recordSuccess();
          options.onSuccess?.(attempt, result);

      });
      
      return result;
 catch (error) {
      circuitState.recordFailure();
      throw error;



  /**
   * Calculate delay with exponential backoff and jitter
   */
  private static calculateDelay(attempt: number, config: Required<RetryOptions>): number {
    // Calculate exponential backoff
    const exponentialDelay = Math.min(
      config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
      config.maxDelay
    );

    // Add jitter to avoid thundering herd
    if (config.jitter) {
      const jitterRange = exponentialDelay * 0.1;
      const jitter = Math.random() * jitterRange * 2 - jitterRange;
      return Math.max(0, exponentialDelay + jitter);


    return exponentialDelay;


  /**
   * Check if an error is retryable
   */
  private static isRetryableError(error: Error, retryableErrors: Array<string | number | RegExp>): boolean {
    if (retryableErrors.length === 0) {
      return true; // Retry all errors if no specific errors specified


    return retryableErrors.some(pattern => {
      if (typeof pattern === 'string') {
        return error.message.includes(pattern) || error.name === pattern;

      
      if (typeof pattern === 'number') {
        // For HTTP status codes
        return (
          error as Record<string,
          unknown>
        ).status === pattern || (error as Record<string, unknown>).statusCode === pattern;

      
      if (pattern instanceof RegExp) {
        return pattern.test(error.message) || pattern.test(error.name);

      
      return false;
    });


  /**
   * Sleep for specified milliseconds
   */
  private static sleep(ms: number): Promise<void> {

    return new Promise(resolve => setTimeout(resolve, ms));


  /**
   * Circuit breaker state management
   */
  private static circuitStates = new Map<string, CircuitBreakerState>();

  private static getCircuitState(key: string): CircuitBreakerState {
    if (!this.circuitStates.has(key)) {
      this.circuitStates.set(key, new CircuitBreakerState());

    return this.circuitStates.get(key)!;



/**
 * Circuit Breaker State Management
 */
class CircuitBreakerState {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  private readonly maxFailures = 5;
  private readonly resetTimeout = 60000; // 1 minute
  
  isOpen(): boolean {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
        return false;

      return true;

    return false;

  
  recordSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';

  
  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.maxFailures) {
      this.state = 'OPEN';




/**
 * Retry decorators for class methods
 */
export function retryable(options: RetryOptions = {}) {
  return function (target: Record<string, unknown>, propertyKey: string, descriptor: PropertyDescriptor) {
    if (!descriptor) {
      console.warn(`@retryable decorator: PropertyDescriptor is undefined for ${propertyKey}`);
      return descriptor;

    
    const originalMethod = descriptor.value;
    
    if (typeof originalMethod !== 'function') {
      console.warn(`@retryable decorator: ${propertyKey} is not a function`);
      return descriptor;

    
    descriptor.value = async function (...args: unknown[]) {
      return RetryUtils.execute(() => originalMethod.apply(this, args), options);
    };
    
    return descriptor;
  };


export function retryableDatabase(options: Partial<RetryOptions> = {}) {
  return function (target: Record<string, unknown>, propertyKey: string, descriptor: PropertyDescriptor) {
    if (!descriptor) {
      console.warn(`@retryableDatabase decorator: PropertyDescriptor is undefined for ${propertyKey}`);
      return descriptor;

    
    const originalMethod = descriptor.value;
    
    if (typeof originalMethod !== 'function') {
      console.warn(`@retryableDatabase decorator: ${propertyKey} is not a function`);
      return descriptor;

    
    descriptor.value = async function (...args: unknown[]) {
      return RetryUtils.executeDatabase(() => originalMethod.apply(this, args), options);
    };
    
    return descriptor;
  };


export function retryableHttp(options: Partial<RetryOptions> = {}) {
  return function (target: Record<string, unknown>, propertyKey: string, descriptor: PropertyDescriptor) {
    if (!descriptor) {
      console.warn(`@retryableHttp decorator: PropertyDescriptor is undefined for ${propertyKey}`);
      return descriptor;

    
    const originalMethod = descriptor.value;
    
    if (typeof originalMethod !== 'function') {
      console.warn(`@retryableHttp decorator: ${propertyKey} is not a function`);
      return descriptor;

    
    descriptor.value = async function (...args: unknown[]) {
      return RetryUtils.executeHttp(() => originalMethod.apply(this, args), options);
    };
    
    return descriptor;
  };


/**
 * Utility functions for common patterns
 */
export class RetryPatterns {
  /**
   * Retry pattern for file operations
   */
  static async fileOperation<T>(operation: () => Promise<T>): Promise<T> {

    return RetryUtils.execute(operation, {
      maxAttempts: 3,
      baseDelay: 100,
      maxDelay: 1000,
      retryableErrors: [
        'EBUSY',
        'EMFILE',
        'ENFILE',
        'ENOENT',
        /file.*busy/i,
        /resource.*temporarily.*unavailable/i
      ]
    });


  /**
   * Retry pattern for external API calls
   */
  static async apiCall<T>(operation: () => Promise<T>, serviceName?: string): Promise<T> {

    return RetryUtils.execute(operation, {
      maxAttempts: 4,
      baseDelay: 1000,
      maxDelay: 15000,
      backoffFactor: 1.8,
      jitter: true,
      retryableErrors: [500, 502, 503, 504, 408, 429],
      onAttempt: (attempt, error) => {
        console.warn(`API call to ${serviceName || 'external service'} failed (attempt ${attempt}):`, error.message);

    });


  /**
   * Retry pattern for log analysis operations
   */
  static async logAnalysis<T>(operation: () => Promise<T>): Promise<T> {

    return RetryUtils.execute(operation, {
      maxAttempts: 3,
      baseDelay: 2000,
      maxDelay: 10000,
      backoffFactor: 2,
      jitter: true,
      retryableErrors: [
        /timeout/i,
        /processing.*failed/i,
        /analysis.*error/i,
        /resource.*unavailable/i
      ],
      onAttempt: (attempt, error) => {
        console.warn(`Log analysis operation failed (attempt ${attempt}):`, error.message);

    });

